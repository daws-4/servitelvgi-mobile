import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Platform,
    PanResponder,
    Animated,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BrandColors } from '@/constants/colors';
import orderHistoryService from '@/services/api/orderHistory';
import type { OrderHistory } from '@/types/orderHistory';

interface MovementHistoryModalProps {
    visible: boolean;
    onClose: () => void;
    crewId: string;
}

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getChangeTypeLabel = (type: string): string => {
    switch (type) {
        case 'materials_added':
            return 'Materiales Usados';
        case 'completed':
            return 'Orden Completada';
        case 'status_change':
            return 'Cambio de Estado';
        case 'crew_assignment':
            return 'Asignación';
        default:
            return type;
    }
};

const getChangeTypeStyle = (type: string) => {
    switch (type) {
        case 'materials_added':
            return { bg: '#fef3c7', text: '#d97706', icon: 'wrench' };
        case 'completed':
            return { bg: '#dcfce7', text: '#16a34a', icon: 'check-circle' };
        case 'status_change':
            return { bg: '#dbeafe', text: '#2563eb', icon: 'exchange' };
        default:
            return { bg: '#f1f5f9', text: '#64748b', icon: 'info-circle' };
    }
};

export default function MovementHistoryModal({
    visible,
    onClose,
    crewId,
}: MovementHistoryModalProps) {
    // Default to last 7 days
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    });
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [history, setHistory] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const translateY = useRef(new Animated.Value(0)).current;

    // Pan responder for swipe to close
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    Animated.timing(translateY, {
                        toValue: 500,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        onClose();
                        // Don't reset here - will reset when modal opens again
                    });
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const fetchHistory = useCallback(async () => {
        if (!crewId) return;

        try {
            setLoading(true);
            setError(null);

            const data = await orderHistoryService.getOrderHistories({
                crewId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                changeType: 'materials_added',
            });

            setHistory(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar historial');
            console.error('Error fetching order history:', err);
        } finally {
            setLoading(false);
        }
    }, [crewId, startDate, endDate]);

    useEffect(() => {
        if (visible && crewId) {
            fetchHistory();
            translateY.setValue(0);
        }
    }, [visible, crewId, fetchHistory]);

    const onStartDateChange = (_event: any, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onEndDateChange = (_event: any, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    const renderHistoryItem = ({ item }: { item: OrderHistory }) => {
        const typeStyle = getChangeTypeStyle(item.changeType);
        return (
            <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
                        <FontAwesome
                            name={typeStyle.icon as any}
                            size={10}
                            color={typeStyle.text}
                        />
                        <Text style={[styles.typeText, { color: typeStyle.text }]}>
                            {getChangeTypeLabel(item.changeType)}
                        </Text>
                    </View>
                    <Text style={styles.historyDate}>{formatDateTime(item.createdAt)}</Text>
                </View>

                <Text style={styles.historyDescription}>{item.description}</Text>

                {item.newValue && typeof item.newValue === 'object' && (
                    <View style={styles.materialsContainer}>
                        {Array.isArray(item.newValue) ? (
                            item.newValue.map((mat: any, index: number) => {
                                // El API puede devolver diferentes estructuras:
                                // 1. { item: { description: "..." }, quantity: X }
                                // 2. { description: "...", quantity: X }
                                // 3. { name: "...", amount: X }
                                const materialName =
                                    mat.item?.description ||  // Estructura con item populado
                                    mat.itemDetails?.description ||
                                    mat.description ||
                                    mat.name ||
                                    mat.item?.code ||
                                    mat.code ||
                                    'Material';

                                const qty = mat.quantity || mat.amount || mat.used || 1;

                                return (
                                    <View key={index} style={styles.materialRow}>
                                        <FontAwesome name="cube" size={10} color="#94a3b8" />
                                        <Text style={styles.materialName}>
                                            {materialName}
                                        </Text>
                                        <Text style={styles.materialQty}>
                                            x{qty}
                                        </Text>
                                    </View>
                                );
                            })
                        ) : (
                            // Si newValue es un objeto pero no array
                            <Text style={styles.materialName}>
                                {item.newValue.description || item.newValue.name || JSON.stringify(item.newValue)}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[styles.modalContainer, { transform: [{ translateY }] }]}
                >
                    {/* Drag Handle */}
                    <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
                        <View style={styles.dragHandle} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleContainer}>
                            <FontAwesome name="history" size={18} color={BrandColors.primary} />
                            <Text style={styles.headerTitle}>Historial de Movimientos</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <FontAwesome name="times" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Date Filters */}
                    <View style={styles.dateFilters}>
                        <View style={styles.datePickerContainer}>
                            <Text style={styles.dateLabel}>Desde:</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <FontAwesome name="calendar" size={12} color={BrandColors.primary} />
                                <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.datePickerContainer}>
                            <Text style={styles.dateLabel}>Hasta:</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <FontAwesome name="calendar" size={12} color={BrandColors.primary} />
                                <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={fetchHistory}
                        >
                            <FontAwesome name="search" size={14} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Date Pickers (Android) */}
                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onStartDateChange}
                            maximumDate={endDate}
                        />
                    )}
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onEndDateChange}
                            minimumDate={startDate}
                            maximumDate={new Date()}
                        />
                    )}

                    {/* Content */}
                    {loading ? (
                        <View style={styles.centerContent}>
                            <ActivityIndicator size="large" color={BrandColors.primary} />
                            <Text style={styles.loadingText}>Cargando historial...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.centerContent}>
                            <FontAwesome name="exclamation-circle" size={48} color="#ef4444" />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
                                <Text style={styles.retryText}>Reintentar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : history.length === 0 ? (
                        <View style={styles.centerContent}>
                            <FontAwesome name="file-text-o" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>
                                No hay movimientos en este período
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={history}
                            keyExtractor={(item) => item._id}
                            renderItem={renderHistoryItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}

                    {/* Stats */}
                    {!loading && !error && history.length > 0 && (
                        <View style={styles.stats}>
                            <Text style={styles.statsText}>
                                {history.length} movimientos encontrados
                            </Text>
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        paddingBottom: 32,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#cbd5e1',
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    closeButton: {
        padding: 4,
    },
    dateFilters: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
        alignItems: 'flex-end',
        backgroundColor: '#f8fafc',
    },
    datePickerContainer: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    dateButtonText: {
        fontSize: 13,
        color: '#0f172a',
        fontWeight: '500',
    },
    searchButton: {
        backgroundColor: BrandColors.primary,
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        color: '#ef4444',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
    },
    retryText: {
        color: '#ef4444',
        fontWeight: '600',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94a3b8',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
    },
    historyCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    historyDate: {
        fontSize: 11,
        color: '#94a3b8',
    },
    historyDescription: {
        fontSize: 13,
        color: '#334155',
        lineHeight: 18,
    },
    materialsContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    materialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    materialName: {
        flex: 1,
        fontSize: 12,
        color: '#64748b',
    },
    materialQty: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0f172a',
    },
    stats: {
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    statsText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
});
