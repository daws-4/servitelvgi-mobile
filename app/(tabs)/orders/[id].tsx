import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    TextInput,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ReadOnlyField from '@/components/orders/ReadOnlyField';
import EditableField from '@/components/orders/EditableField';
import StatusPicker from '@/components/orders/StatusPicker';
import PickerField from '@/components/orders/PickerField';
import PhotoEvidenceManager from '@/components/orders/PhotoEvidenceManager';
import InventoryAssignmentManager from '@/components/orders/InventoryAssignmentManager';
import OrderSpeedTest from '@/components/orders/OrderSpeedTest';
import CustomerSignature from '@/components/orders/CustomerSignature';
import InstallerLogManager from '@/components/orders/InstallerLogManager';
import EquipmentRecoveryForm from '@/components/orders/EquipmentRecoveryForm';
import orderService from '@/services/api/orders';
import { useAuth } from '@/app/contexts/AuthContext';
import { BrandColors } from '@/constants/colors';
import { ORDER_TYPE_LABELS } from '@/constants/orderStates';
import type { Order, OrderStatus, OrderType, MaterialUsed, InternetTestResult, InstallerLog, EquipmentRecovered } from '@/types/Order';

const ETIQUETA_COLORS = [
    { label: 'Verde', value: 'verde', color: '#22c55e' },
    { label: 'Rojo', value: 'rojo', color: '#ef4444' },
    { label: 'Azul', value: 'azul', color: '#3b82f6' },
];

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { installer } = useAuth();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<OrderStatus>('pending');
    const [saving, setSaving] = useState(false);

    const [materialsUsed, setMaterialsUsed] = useState<MaterialUsed[]>([]);

    // HARD status modal state
    const [hardReasonModalVisible, setHardReasonModalVisible] = useState(false);
    const [hardReason, setHardReason] = useState('');

    // Key to force re-render of text fields to clear selection
    const [selectionResetKey, setSelectionResetKey] = useState(0);

    const clearSelection = () => {
        setSelectionResetKey(prev => prev + 1);
    };

    // Fetch order data
    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    // Loading State
    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.getOrderById(id!);
            setOrder(data);
            setCurrentStatus(data.status);
            setMaterialsUsed(data.materialsUsed || []);
        } catch (err: any) {
            console.error('Error fetching order:', err);

            if (err.response?.status === 404 || err.status === 404) {
                Alert.alert(
                    'Orden no encontrada',
                    'La orden que intentas ver no existe o fue eliminada.',
                    [
                        {
                            text: 'Volver a la lista',
                            onPress: () => router.replace('/(tabs)/orders/')
                        }
                    ]
                );
                return;
            }

            setError(err.message || 'Error al cargar la orden');
        } finally {
            setLoading(false);
        }
    };

    // Check if order can be completed
    const canComplete = useMemo(() => {
        if (!order) return false;

        const isRecoveryOrder = order.type === 'recuperacion';
        const isAveriaOrder = order.type === 'averia';

        if (isRecoveryOrder) {
            // For recovery: require at least ONT ID to complete
            return !!order.equipmentRecovered?.ontId?.trim();
        }

        if (isAveriaOrder) {
            // For AVERIA orders: no mandatory requirements (inventory, signature, internet test are optional)
            return true;
        }

        // For installation: need inventory, signature, and internet test
        const hasInventory = (materialsUsed?.length || 0) > 0;
        const hasSignature = !!order.customerSignature;
        const hasInternetTest = !!(order.internetTest?.downloadSpeed && order.internetTest?.uploadSpeed);

        return hasInventory && hasSignature && hasInternetTest;
    }, [order, materialsUsed]);

    // Get completion requirements message
    const getCompletionMessage = useMemo(() => {
        if (!order) return '';

        const isRecoveryOrder = order.type === 'recuperacion';
        const isAveriaOrder = order.type === 'averia';
        const missing: string[] = [];

        if (isRecoveryOrder) {
            // Recovery order - require ONT ID for completion
            if (!order.equipmentRecovered?.ontId?.trim()) {
                missing.push('ID de la ONT');
            }
        } else if (isAveriaOrder) {
            // AVERIA orders have no mandatory requirements
            // All fields are optional
        } else {
            // Installation requirements
            if (!materialsUsed?.length) {
                missing.push('inventario asignado');
            }
            if (!order.customerSignature) {
                missing.push('firma del cliente');
            }
            if (!order.internetTest?.downloadSpeed) {
                missing.push('prueba de internet');
            }
        }

        if (missing.length === 0) return '';
        return `Falta: ${missing.join(', ')}`;
    }, [order, materialsUsed]);

    // Callback when test is saved successfully
    const handleTestSaved = (result: InternetTestResult) => {
        setOrder(prev => prev ? { ...prev, internetTest: result } : null);
    };

    // Save progress without completing
    const saveProgress = async () => {
        if (!order) return;

        try {
            setSaving(true);

            // Sanitize materialsUsed to ensure item is always a string ID (not an object)
            const sanitizedMaterials = materialsUsed.map(m => ({
                ...m,
                item: typeof m.item === 'string' ? m.item : (m.item as any)?._id?.toString() || m.item
            }));

            await orderService.updateOrder(order._id, {
                materialsUsed: sanitizedMaterials,
                photoEvidence: order.photoEvidence,
                customerSignature: order.customerSignature,
                internetTest: order.internetTest
            });
            Alert.alert('Éxito', 'Progreso guardado correctamente');
        } catch (err: any) {
            console.error('Error saving progress:', err);
            Alert.alert('Error', 'No se pudo guardar el progreso');
        } finally {
            setSaving(false);
        }
    };

    // Handle status change
    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order || newStatus === currentStatus) return;

        // LOCKING: If current status is HARD, only allow transition to completed
        if (currentStatus === 'hard' && newStatus !== 'completed') {
            Alert.alert(
                'Orden Bloqueada',
                'Una orden en estado HARD solo puede cambiar a COMPLETADA cuando se haya resuelto.',
                [{ text: 'Entendido' }]
            );
            return;
        }

        // Validate completion requirements
        if (newStatus === 'completed') {
            if (!canComplete) {
                Alert.alert(
                    'No se puede completar',
                    getCompletionMessage || 'Faltan requisitos para completar la orden',
                    [{ text: 'Entendido' }]
                );
                return;
            }

            // Confirm completion
            Alert.alert(
                'Confirmar Completado',
                '¿Estás seguro de completar esta orden? No podrás modificarla después.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Completar',
                        onPress: async () => {
                            try {
                                setUpdating(true);
                                const isRecoveryOrder = order.type === 'recuperacion';

                                await orderService.completeOrder(order._id, {
                                    materialsUsed: isRecoveryOrder ? [] : materialsUsed,
                                    photoEvidence: order.photoEvidence || [],
                                    customerSignature: isRecoveryOrder ? undefined : order.customerSignature,
                                    internetTest: isRecoveryOrder ? undefined : order.internetTest,
                                    equipmentRecovered: isRecoveryOrder ? order.equipmentRecovered : undefined,
                                });
                                setCurrentStatus('completed');
                                setOrder(prev => prev ? { ...prev, status: 'completed' } : null);
                                Alert.alert('Éxito', 'Orden completada correctamente');
                                router.back();
                            } catch (err: any) {
                                console.error('Error completing order:', err);
                                Alert.alert('Error', err.message || 'No se pudo completar la orden');
                            } finally {
                                setUpdating(false);
                            }
                        }
                    }
                ]
            );
            return;
        }

        // SPECIAL CASE: Switching to HARD requires a log entry with reason
        if (newStatus === 'hard') {
            // Show modal to request reason
            setHardReasonModalVisible(true);
            setUpdating(false);
            return;
        }

        // Normal status update (not HARD, not completed)
        try {
            setUpdating(true);
            await orderService.updateOrderStatus(order._id, newStatus);
            setOrder(prev => prev ? { ...prev, status: newStatus } : null);

            setCurrentStatus(newStatus);
            Alert.alert('Éxito', 'Estado actualizado correctamente');
        } catch (err: any) {
            console.error('Error updating status:', err);
            Alert.alert('Error', err.message || 'No se pudo actualizar el estado');
        } finally {
            setUpdating(false);
        }
    };

    // Handle HARD status confirmation after reason is provided
    const handleConfirmHardStatus = async () => {
        if (!order || !hardReason.trim()) {
            Alert.alert('Error', 'Debes proporcionar un motivo para marcar como HARD');
            return;
        }

        try {
            setUpdating(true);
            setHardReasonModalVisible(false);

            const newVisitCount = (order.visitCount || 0) + 1;

            // Create log entry
            const newLog: InstallerLog = {
                timestamp: new Date().toISOString(),
                log: `[HARD] ${hardReason}`,
                status: 'hard'
            };

            const updatedLogs = [...(order.installerLog || []), newLog];

            // Update order with HARD status, incremented visit count, and log entry
            await orderService.updateOrder(order._id, {
                status: 'hard',
                visitCount: newVisitCount,
                installerLog: updatedLogs
            });

            // Update local state
            setOrder(prev => prev ? {
                ...prev,
                status: 'hard',
                visitCount: newVisitCount,
                installerLog: updatedLogs
            } : null);
            setCurrentStatus('hard');
            setHardReason(''); // Clear reason input

            Alert.alert('Éxito', `Orden marcada como HARD. Visita #${newVisitCount} registrada.`);
        } catch (err: any) {
            console.error('Error updating to HARD status:', err);
            Alert.alert('Error', err.message || 'No se pudo actualizar el estado');
        } finally {
            setUpdating(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Handle photos change (for tracking purposes, actual upload is handled by the component)
    const handlePhotosChange = (photos: string[]) => {
        setOrder(prev => prev ? { ...prev, photoEvidence: photos } : null);
    };

    // Handle materials change locally
    const handleMaterialsChange = (materials: MaterialUsed[]) => {
        setMaterialsUsed(materials);
        // We update the order object locally as well so it reflects in the state if needed by other components
        setOrder(prev => prev ? { ...prev, materialsUsed: materials } : null);
    };

    // Handle signature change
    const handleSignatureChange = async (signature: string | undefined) => {
        if (!order) return;

        // Update local state
        setOrder(prev => prev ? { ...prev, customerSignature: signature } : null);

        // Save to backend
        try {
            await orderService.updateOrder(order._id, {
                customerSignature: signature
            });
        } catch (error) {
            console.error('Error saving signature to backend:', error);
            // Revert local state if needed or show error? 
            // The component shows "Éxito" on success of this callback if it was async, but it's not awaited in the component. 
            // Actually CustomerSignature doesn't await onSignatureChange.
        }
    };

    // Handle immediate save for critical changes (bobbin/equipment removal)
    const handleImmediateSave = async (materials: MaterialUsed[]) => {
        if (!order) return;

        // Sanitize materialsUsed to ensure item is always a string ID (not an object)
        const sanitizedMaterials = materials.map(m => ({
            ...m,
            item: typeof m.item === 'string' ? m.item : (m.item as any)?._id?.toString() || m.item
        }));

        // Update local state
        setMaterialsUsed(sanitizedMaterials);
        setOrder(prev => prev ? { ...prev, materialsUsed: sanitizedMaterials } : null);

        // Save to backend immediately
        await orderService.updateOrder(order._id, {
            materialsUsed: sanitizedMaterials
        });
    };

    // Handle installer logs change
    const handleLogsChange = async (logs: InstallerLog[]) => {
        if (!order) return;

        // Update local state
        setOrder(prev => prev ? { ...prev, installerLog: logs } : null);

        // Save to backend
        try {
            await orderService.updateOrder(order._id, {
                installerLog: logs
            });
        } catch (error) {
            console.error('Error saving installer logs to backend:', error);
        }
    };

    // Handle equipment recovery data change
    const handleEquipmentChange = (equipment: EquipmentRecovered) => {
        if (!order) return;

        // Update local state
        setOrder(prev => prev ? { ...prev, equipmentRecovered: equipment } : null);
    };

    // Handle order field updates (for recovery orders)
    const handleOrderFieldUpdate = async (field: keyof Order, value: any) => {
        if (!order) return;

        // Update local state
        setOrder(prev => prev ? { ...prev, [field]: value } : null);

        // Save to backend
        try {
            await orderService.updateOrder(order._id, {
                [field]: value
            });
        } catch (error) {
            console.error(`Error updating ${String(field)}:`, error);
        }
    };



    // Handle etiqueta update
    const handleEtiquetaUpdate = async (field: 'color' | 'numero', value: any) => {
        if (!order) return;

        const newEtiqueta = {
            ...order.etiqueta,
            [field]: value
        };

        // Update local state
        setOrder(prev => prev ? { ...prev, etiqueta: newEtiqueta as any } : null);

        // Save to backend
        try {
            await orderService.updateOrder(order._id, {
                etiqueta: newEtiqueta
            });
        } catch (error) {
            console.error('Error updating etiqueta:', error);
        }
    };

    const handleCall = (phoneNumber: string) => {
        // Clean phone number (remove non-digits if necessary, but tel: usually handles spaces)
        // Ensure prompt: true is used (default on recent RN versions) or just openURL
        const url = `tel:${phoneNumber.replace(/\s+/g, '')}`; // Remove spaces for better compatibility

        Linking.openURL(url).catch(err => {
            console.error('Error opening dialer:', err);
            Alert.alert('Error', 'No se pudo abrir la aplicación de teléfono');
        });
    };

    // Loading State
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                    <Text style={styles.loadingText}>Cargando orden...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error State
    if (error || !order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <FontAwesome name="exclamation-triangle" size={48} color="#ef4444" />
                    <Text style={styles.errorTitle}>Error al cargar</Text>
                    <Text style={styles.errorText}>{error || 'Orden no encontrada'}</Text>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Volver a Órdenes</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Get initials for avatar
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .slice(0, 2)
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase();
    };

    return (
        <>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <FontAwesome name="arrow-left" size={16} color="#0f0f0f" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Detalle de Orden</Text>
                        <Text style={styles.headerSubtitle}>#{order.ticket_id}</Text>
                    </View>
                    {/* Save Button */}
                    {currentStatus !== 'completed' && currentStatus !== 'cancelled' && currentStatus !== 'visita' && (
                        <TouchableOpacity
                            onPress={saveProgress}
                            style={styles.saveBtn}
                            disabled={saving || updating}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color={BrandColors.primary} />
                            ) : (
                                <FontAwesome name="save" size={20} color={BrandColors.primary} />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* 
                   Pressing the background clears text selection by incrementing the reset key.
                   We use TouchableWithoutFeedback to avoid visual feedback but catch the press.
                */}
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={clearSelection}
                        style={{ flex: 1 }}
                    >
                        {/* Subscriber Info Card */}
                        <LinearGradient
                            colors={[BrandColors.secondary, BrandColors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.subscriberCard}
                        >
                            <View style={styles.subscriberHeader}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{getInitials(order.subscriberName)}</Text>
                                </View>
                                <View style={styles.subscriberInfo}>
                                    <Text style={styles.subscriberName}>{order.subscriberName}</Text>
                                    <Text style={styles.subscriberType}>
                                        {ORDER_TYPE_LABELS[order.type as OrderType] || order.type || 'Orden'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.subscriberDetails}>
                                {order.node && (
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>NODO</Text>
                                        <Text style={styles.detailValue}>{order.node}</Text>
                                    </View>
                                )}
                                {(order.phones?.length ?? 0) > 0 && (
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>TELÉFONO</Text>
                                        <Text style={styles.detailValue}>{order.phones?.[0]}</Text>
                                    </View>
                                )}
                            </View>
                        </LinearGradient>

                        {/* Subscriber Data Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <FontAwesome name="user" size={14} color={BrandColors.primary} />
                                <Text style={styles.sectionTitle}>Datos del Abonado</Text>
                            </View>

                            {/* Conditional rendering: Editable for recovery orders, ReadOnly for others */}
                            {order.type === 'recuperacion' && order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'visita' ? (
                                <>
                                    <EditableField
                                        label="Número de Abonado"
                                        value={order.subscriberNumber}
                                        onChangeText={(text) => handleOrderFieldUpdate('subscriberNumber', text)}
                                        icon="id-card"
                                        keyboardType="numeric"
                                    />
                                    <EditableField
                                        label="Nombre"
                                        value={order.subscriberName}
                                        onChangeText={(text) => handleOrderFieldUpdate('subscriberName', text)}
                                        icon="user"
                                    />
                                    <EditableField
                                        label="Dirección"
                                        value={order.address}
                                        onChangeText={(text) => handleOrderFieldUpdate('address', text)}
                                        icon="map-marker"
                                        multiline
                                    />
                                    <EditableField
                                        label="Teléfono"
                                        value={order.phones?.[0] || ''}
                                        onChangeText={(text) => handleOrderFieldUpdate('phones', text ? [text] : [])}
                                        icon="phone"
                                        keyboardType="phone-pad"
                                    />
                                    <EditableField
                                        label="Email"
                                        value={order.email}
                                        onChangeText={(text) => handleOrderFieldUpdate('email', text)}
                                        icon="envelope"
                                        keyboardType="email-address"
                                    />
                                </>
                            ) : (
                                <>
                                    <ReadOnlyField
                                        label="Nombre"
                                        value={order.subscriberName}
                                        icon="user"
                                        selectable={true}
                                    />
                                    <ReadOnlyField
                                        label="N° Abonado"
                                        value={order.subscriberNumber}
                                        icon="id-card"
                                        selectable={true}
                                    />
                                    <ReadOnlyField
                                        label="Dirección"
                                        value={order.address}
                                        icon="map-marker"
                                        selectable={true}
                                    />

                                    {/* Dynamic Phone Numbers */}
                                    {order.phones && order.phones.length > 0 ? (
                                        order.phones.map((phone, index) => (
                                            <ReadOnlyField
                                                key={`phone-${index}`}
                                                label={`Teléfono ${index + 1}`}
                                                value={phone}
                                                icon="phone"
                                                selectable={true}
                                                onAction={() => handleCall(phone)}
                                                actionIcon="phone"
                                            />
                                        ))
                                    ) : (
                                        <ReadOnlyField
                                            label="Teléfono"
                                            value="No registrado"
                                            icon="phone"
                                        />
                                    )}

                                    <ReadOnlyField
                                        label="Email"
                                        value={order.email}
                                        icon="envelope"
                                        selectable={true}
                                    />
                                </>
                            )}
                        </View>

                        {/* Technical Data Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <FontAwesome name="cogs" size={14} color={BrandColors.primary} />
                                <Text style={styles.sectionTitle}>Datos Técnicos</Text>
                            </View>

                            <ReadOnlyField
                                label="Tipo de Orden"
                                value={ORDER_TYPE_LABELS[order.type as OrderType] || order.type || 'No especificado'}
                                icon="tag"
                                selectable={true}
                            />

                            {/* Ticket ID: Editable for recovery orders */}
                            {order.type === 'recuperacion' && order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'visita' ? (
                                <EditableField
                                    label="Número de Ticket"
                                    value={order.ticket_id}
                                    onChangeText={(text) => handleOrderFieldUpdate('ticket_id', text)}
                                    icon="ticket"
                                    placeholder="Ej: TKT-2024-001"
                                />
                            ) : (
                                order.ticket_id && (
                                    <ReadOnlyField
                                        label="Ticket ID"
                                        value={order.ticket_id}
                                        icon="ticket"
                                        selectable={true}
                                    />
                                )
                            )}

                            {/* Node field: Editable for recovery orders */}
                            {order.type === 'recuperacion' && order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'visita' ? (
                                <EditableField
                                    label="Nodo"
                                    value={order.node}
                                    onChangeText={(text) => handleOrderFieldUpdate('node', text)}
                                    icon="sitemap"
                                    placeholder="Ej: SCRVEG20112A-GPON"
                                />
                            ) : (
                                <ReadOnlyField
                                    label="Nodo"
                                    value={order.node}
                                    icon="sitemap"
                                    selectable={true}
                                />
                            )}

                            {/* Power and Ports Fields (Only for Instalacion/Averia) */}
                            {(order.type === 'instalacion' || order.type === 'averia') && (
                                <>
                                    {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'visita' ? (
                                        <>
                                            <EditableField
                                                label="Potencia NAP (dBm)"
                                                value={order.powerNap}
                                                onChangeText={(text) => handleOrderFieldUpdate('powerNap', text)}
                                                icon="bolt"
                                                placeholder="-20.5"
                                                keyboardType="numeric"
                                            />
                                            <EditableField
                                                label="Potencia Roseta (dBm)"
                                                value={order.powerRoseta}
                                                onChangeText={(text) => handleOrderFieldUpdate('powerRoseta', text)}
                                                icon="plug"
                                                placeholder="-22.0"
                                                keyboardType="numeric"
                                            />
                                            <EditableField
                                                label="Puertos Restantes"
                                                value={order.remainingPorts?.toString()}
                                                onChangeText={(text) => handleOrderFieldUpdate('remainingPorts', parseInt(text) || 0)}
                                                icon="sort-numeric-asc"
                                                keyboardType="numeric"
                                            />
                                            <PickerField
                                                label="Etiqueta Color"
                                                value={order.etiqueta?.color}
                                                onChange={(val) => handleEtiquetaUpdate('color', val)}
                                                options={ETIQUETA_COLORS}
                                                icon="tag"
                                                placeholder="Seleccionar Color"
                                            />
                                            <EditableField
                                                label="Etiqueta Número"
                                                value={order.etiqueta?.numero?.toString()}
                                                onChangeText={(text) => handleEtiquetaUpdate('numero', parseInt(text) || 0)}
                                                icon="hashtag"
                                                placeholder="123"
                                                keyboardType="numeric"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <ReadOnlyField
                                                label="Potencia NAP"
                                                value={order.powerNap ? `${order.powerNap} dBm` : 'No registra'}
                                                icon="bolt"
                                            />
                                            <ReadOnlyField
                                                label="Potencia Roseta"
                                                value={order.powerRoseta ? `${order.powerRoseta} dBm` : 'No registra'}
                                                icon="plug"
                                            />
                                            <ReadOnlyField
                                                label="Puertos Restantes"
                                                icon="sort-numeric-asc"
                                            />
                                            <ReadOnlyField
                                                label="Etiqueta Color"
                                                value={order.etiqueta?.color ? order.etiqueta.color.charAt(0).toUpperCase() + order.etiqueta.color.slice(1) : 'No registra'}
                                                icon="tag"
                                            />
                                            <ReadOnlyField
                                                label="Etiqueta Número"
                                                value={order.etiqueta?.numero?.toString() || 'No registra'}
                                                icon="hashtag"
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            <ReadOnlyField
                                label="Servicios a Instalar"
                                value={order.servicesToInstall?.join(', ')}
                                icon="list"
                            />
                            <ReadOnlyField
                                label="Cuadrilla Asignada"
                                value={order.assignedToName || String(installer?.crew?.number)}
                                icon="users"
                            />
                        </View>

                        {/* Status Section (Editable) */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <FontAwesome name="flag" size={14} color={BrandColors.primary} />
                                <Text style={styles.sectionTitle}>Estado y Asignación</Text>
                            </View>

                            {currentStatus === 'visita' ? (
                                <View style={{
                                    backgroundColor: '#dcfce7',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 16,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#bbf7d0'
                                }}>
                                    <FontAwesome name="check-circle" size={20} color="#16a34a" style={{ marginRight: 8 }} />
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#16a34a' }}>Visita</Text>
                                </View>
                            ) : (
                                <StatusPicker
                                    value={currentStatus}
                                    onChange={handleStatusChange}
                                    disabled={updating || currentStatus === 'completed'}
                                    canComplete={canComplete}
                                    completionMessage={getCompletionMessage}
                                />
                            )}

                            {/* Completion requirements info */}
                            {currentStatus !== 'completed' && currentStatus !== 'visita' && (
                                <View style={styles.requirementsCard}>
                                    <Text style={styles.requirementsTitle}>Requisitos para Finalizar:</Text>

                                    {order.type === 'recuperacion' ? (
                                        // Recovery order - require ONT ID
                                        <View style={styles.requirementRow}>
                                            <FontAwesome
                                                name={order.equipmentRecovered?.ontId?.trim() ? 'check-circle' : 'circle-o'}
                                                size={16}
                                                color={order.equipmentRecovered?.ontId?.trim() ? '#22c55e' : '#94a3b8'}
                                            />
                                            <Text style={styles.requirementText}>ID de la ONT recuperada</Text>
                                        </View>
                                    ) : order.type === 'averia' ? (
                                        // AVERIA orders - all optional
                                        <View style={styles.requirementRow}>
                                            <FontAwesome
                                                name={'check-circle'}
                                                size={16}
                                                color={'#22c55e'}
                                            />
                                            <Text style={styles.requirementText}>Sin requisitos obligatorios</Text>
                                        </View>
                                    ) : (
                                        // Installation requirements
                                        <>
                                            <View style={styles.requirementRow}>
                                                <FontAwesome
                                                    name={materialsUsed?.length ? 'check-circle' : 'circle-o'}
                                                    size={16}
                                                    color={materialsUsed?.length ? '#22c55e' : '#94a3b8'}
                                                />
                                                <Text style={styles.requirementText}>Inventario asignado</Text>
                                            </View>
                                            <View style={styles.requirementRow}>
                                                <FontAwesome
                                                    name={order.customerSignature ? 'check-circle' : 'circle-o'}
                                                    size={16}
                                                    color={order.customerSignature ? '#22c55e' : '#94a3b8'}
                                                />
                                                <Text style={styles.requirementText}>Firma del cliente</Text>
                                            </View>
                                            <View style={styles.requirementRow}>
                                                <FontAwesome
                                                    name={order.internetTest?.downloadSpeed ? 'check-circle' : 'circle-o'}
                                                    size={16}
                                                    color={order.internetTest?.downloadSpeed ? '#22c55e' : '#94a3b8'}
                                                />
                                                <Text style={styles.requirementText}>Prueba de internet</Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Equipment Recovery Section (Only for recuperacion orders) */}
                        {order.type === 'recuperacion' && (
                            <EquipmentRecoveryForm
                                orderId={order._id}
                                initialData={order.equipmentRecovered}
                                onDataChange={handleEquipmentChange}
                                readOnly={order.status === 'completed' || order.status === 'cancelled' || order.status === 'visita'}
                            />
                        )}

                        {/* Inventory Assignment Section (Only for installation/repair) */}
                        {order.type !== 'recuperacion' && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <FontAwesome name="cube" size={14} color={BrandColors.primary} />
                                    <Text style={styles.sectionTitle}>Materiales e Inventario</Text>
                                </View>

                                <InventoryAssignmentManager
                                    crewId={installer?.crew?._id || ''}
                                    materialsUsed={materialsUsed}
                                    onMaterialsChange={handleMaterialsChange}
                                    onImmediateSave={handleImmediateSave}
                                    readOnly={order.status === 'completed' || order.status === 'cancelled' || order.status === 'visita'}
                                />
                            </View>
                        )}

                        {/* Photo Evidence Section (Always visible) */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <FontAwesome name="camera" size={14} color={BrandColors.primary} />
                                <Text style={styles.sectionTitle}>Evidencia Fotográfica</Text>
                            </View>

                            <PhotoEvidenceManager
                                orderId={order._id}
                                installerId={installer?._id || ''}
                                crewId={installer?.crew?._id || ''}
                                existingPhotos={order.photoEvidence}
                                onPhotosChange={handlePhotosChange}
                                readOnly={order.status === 'completed' || order.status === 'cancelled' || order.status === 'visita'}
                            />
                        </View>

                        {/* Signature Section (Only for installation/repair) */}
                        {order.type !== 'recuperacion' && (
                            <View style={styles.section}>
                                <CustomerSignature
                                    orderId={order._id}
                                    signature={order.customerSignature}
                                    onSignatureChange={handleSignatureChange}
                                    onUploadSignature={orderService.saveSignatureUrl.bind(orderService)}
                                    readOnly={order.status === 'completed' || order.status === 'cancelled' || order.status === 'visita'}
                                />
                            </View>
                        )}

                        {/* Internet Test Section (Only for installation/repair) */}
                        {order.type !== 'recuperacion' && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <FontAwesome name="wifi" size={14} color={BrandColors.primary} />
                                    <Text style={styles.sectionTitle}>Prueba de Internet</Text>
                                </View>

                                <OrderSpeedTest
                                    orderId={order._id}
                                    existingTest={order.internetTest}
                                    onTestSaved={handleTestSaved}
                                    readOnly={order.status === 'completed' || order.status === 'cancelled' || order.status === 'visita'}
                                />
                            </View>
                        )}

                        {/* Installer Log Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <FontAwesome name="clipboard" size={14} color={BrandColors.primary} />
                                <Text style={styles.sectionTitle}>Bitácora del Instalador</Text>
                            </View>

                            <InstallerLogManager
                                orderId={order._id}
                                installerLogs={order.installerLog || []}
                                onLogsChange={handleLogsChange}
                                currentStatus={currentStatus}
                                readOnly={order.status === 'completed' || order.status === 'cancelled' || order.status === 'visita'}
                            />
                        </View>

                        {/* Bottom Spacer */}
                        <View style={{ height: insets.bottom + 40 }} />
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            {/* HARD Status Reason Modal */}
            <Modal
                visible={hardReasonModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setHardReasonModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Marcar como HARD</Text>
                        <Text style={styles.modalSubtitle}>
                            Por favor describe el motivo por el cual no se pudo completar esta orden:
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Ej: Cliente no se encontraba en el domicilio"
                            value={hardReason}
                            onChangeText={setHardReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => {
                                    setHardReasonModalVisible(false);
                                    setHardReason('');
                                }}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleConfirmHardStatus}
                                disabled={!hardReason.trim()}
                            >
                                <Text style={styles.modalButtonTextConfirm}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748b',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    backButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: BrandColors.primary,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    saveBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        marginLeft: 8,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    scrollContent: {
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    subscriberCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
    },
    subscriberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '800',
        color: BrandColors.primary,
    },
    subscriberInfo: {
        flex: 1,
    },
    subscriberName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    subscriberType: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    subscriberDetails: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        paddingTop: 16,
        gap: 32,
    },
    detailItem: {},
    detailLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    requirementsCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    requirementsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 12,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 14,
        color: '#374151',
    },
    placeholderCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#94a3b8',
        marginTop: 12,
    },
    placeholderSubtext: {
        fontSize: 12,
        color: '#cbd5e1',
        marginTop: 4,
        textAlign: 'center',
    },
    signaturePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    signatureText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#22c55e',
    },
    testResults: {
        width: '100%',
    },
    speedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    speedLabel: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
    speedValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    // HARD Status Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: 20,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#1e293b',
        minHeight: 100,
        marginBottom: 20,
        backgroundColor: '#f8fafc',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#f1f5f9',
    },
    modalButtonConfirm: {
        backgroundColor: BrandColors.primary,
    },
    modalButtonTextCancel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    modalButtonTextConfirm: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});
