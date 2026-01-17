import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import type { InstallerLog, OrderStatus } from '@/types/Order';

interface InstallerLogManagerProps {
    orderId: string;
    installerLogs: InstallerLog[];
    onLogsChange: (logs: InstallerLog[]) => void;
    currentStatus: OrderStatus;
    readOnly?: boolean;
}

// Status options for installer logs
const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pendiente', color: '#94a3b8' },
    { value: 'assigned', label: 'Asignada', color: '#3b82f6' },
    { value: 'in_progress', label: 'En Progreso', color: '#f59e0b' },
    { value: 'completed', label: 'Completada', color: '#22c55e' },
    { value: 'cancelled', label: 'Cancelada', color: '#ef4444' },
    { value: 'hard', label: 'Hard', color: '#f44336' },
];

export default function InstallerLogManager({
    orderId,
    installerLogs,
    onLogsChange,
    currentStatus,
    readOnly = false,
}: InstallerLogManagerProps) {
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [logMessage, setLogMessage] = useState('');

    // Sort logs by timestamp (newest first)
    const sortedLogs = [...installerLogs].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
    });

    const handleAddLog = () => {
        setEditingIndex(null);
        setLogMessage('');
        setModalVisible(true);
    };

    const handleEditLog = (index: number) => {
        const logToEdit = installerLogs[index];
        setEditingIndex(index);
        setLogMessage(logToEdit.log);
        setModalVisible(true);
    };

    const handleDeleteLog = (index: number) => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de eliminar esta entrada del registro?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        const newLogs = installerLogs.filter((_, i) => i !== index);
                        onLogsChange(newLogs);
                    },
                },
            ]
        );
    };

    const handleSaveLog = () => {
        if (!logMessage.trim()) {
            Alert.alert('Error', 'El mensaje del registro no puede estar vacío');
            return;
        }

        const newLog: InstallerLog = {
            timestamp: editingIndex !== null ? installerLogs[editingIndex].timestamp : new Date().toISOString(),
            log: logMessage.trim(),
            status: currentStatus, // Use current order status
        };

        let newLogs: InstallerLog[];
        if (editingIndex !== null) {
            // Edit existing log
            newLogs = installerLogs.map((log, i) => (i === editingIndex ? newLog : log));
        } else {
            // Add new log
            newLogs = [...installerLogs, newLog];
        }

        onLogsChange(newLogs);
        setModalVisible(false);
        setLogMessage('');
    };

    const getStatusConfig = (status: OrderStatus) => {
        return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    };

    const formatTimestamp = (timestamp: Date | string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('es-VE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View style={styles.container}>
            {/* Logs List */}
            {sortedLogs.length === 0 ? (
                <View style={styles.emptyState}>
                    <FontAwesome name="clipboard" size={32} color="#cbd5e1" />
                    <Text style={styles.emptyText}>No hay registros en la bitácora</Text>
                    {!readOnly && (
                        <Text style={styles.emptySubtext}>Agrega el primer registro usando el botón de abajo</Text>
                    )}
                </View>
            ) : (
                <View style={styles.logsList}>
                    {sortedLogs.map((log, index) => {
                        const actualIndex = installerLogs.findIndex(l => l === log);
                        const statusConfig = getStatusConfig(log.status);

                        return (
                            <View key={actualIndex} style={styles.logCard}>
                                <View style={styles.logHeader}>
                                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                                        <Text style={styles.statusText}>{statusConfig.label}</Text>
                                    </View>
                                    <Text style={styles.timestamp}>{formatTimestamp(log.timestamp)}</Text>
                                </View>
                                <Text style={styles.logMessage}>{log.log}</Text>
                                {!readOnly && (
                                    <View style={styles.logActions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleEditLog(actualIndex)}
                                        >
                                            <FontAwesome name="edit" size={14} color="#3b82f6" />
                                            <Text style={styles.actionButtonText}>Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleDeleteLog(actualIndex)}
                                        >
                                            <FontAwesome name="trash" size={14} color="#ef4444" />
                                            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Eliminar</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Add Log Button */}
            {!readOnly && (
                <TouchableOpacity style={styles.addButton} onPress={handleAddLog}>
                    <FontAwesome name="plus" size={16} color="#fff" />
                    <Text style={styles.addButtonText}>Agregar Registro</Text>
                </TouchableOpacity>
            )}

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <FontAwesome name="times" size={24} color="#64748b" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {editingIndex !== null ? 'Editar Registro' : 'Nuevo Registro'}
                        </Text>
                        <TouchableOpacity onPress={handleSaveLog}>
                            <FontAwesome name="check" size={24} color={BrandColors.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Status Display (read-only) */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Estado de la Orden</Text>
                            <View style={styles.statusDisplay}>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusConfig(currentStatus).color }]}>
                                    <Text style={styles.statusText}>{getStatusConfig(currentStatus).label}</Text>
                                </View>
                                <Text style={styles.statusHint}>El registro se guardará con este estado</Text>
                            </View>
                        </View>

                        {/* Log Message */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mensaje del Registro</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Describe el progreso, problemas encontrados, acciones tomadas, etc."
                                placeholderTextColor="#94a3b8"
                                value={logMessage}
                                onChangeText={setLogMessage}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Timestamp Display */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Fecha y Hora</Text>
                            <View style={styles.timestampDisplay}>
                                <FontAwesome name="clock-o" size={14} color="#64748b" />
                                <Text style={styles.timestampText}>
                                    {editingIndex !== null
                                        ? formatTimestamp(installerLogs[editingIndex].timestamp)
                                        : formatTimestamp(new Date())}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyState: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#94a3b8',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#cbd5e1',
        marginTop: 4,
        textAlign: 'center',
    },
    logsList: {
        gap: 12,
    },
    logCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'uppercase',
    },
    timestamp: {
        fontSize: 12,
        color: '#94a3b8',
    },
    logMessage: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 12,
    },
    logActions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3b82f6',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BrandColors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 16,
        gap: 8,
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    statusDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    statusHint: {
        fontSize: 12,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    textArea: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        minHeight: 120,
    },
    timestampDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        gap: 10,
    },
    timestampText: {
        fontSize: 14,
        color: '#64748b',
    },
});
