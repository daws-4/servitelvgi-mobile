import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import type { OrderStatus } from '@/types/Order';
import { useOrderConfig } from '@/context/OrderConfigContext';

interface StatusPickerProps {
    value: OrderStatus;
    onChange: (status: OrderStatus) => void;
    disabled?: boolean;
    canComplete?: boolean; // If false, "completed" option is disabled
    completionMessage?: string; // Message explaining why can't complete
}

/**
 * Status picker dropdown for order status modification
 */
export default function StatusPicker({
    value,
    onChange,
    disabled = false,
    canComplete = true,
    completionMessage = 'Faltan requisitos para completar',
}: StatusPickerProps) {
    const { config, getStatusConfig } = useOrderConfig();
    const [modalVisible, setModalVisible] = useState(false);

    // Build options from config
    const statusOptions = Object.values(config?.statuses || {}).sort((a, b) => a.order - b.order);
    const currentOption = getStatusConfig(value as string);

    const handleSelect = (status: OrderStatus) => {
        const optionConfig = getStatusConfig(status as string);
        if (optionConfig.countsAsCompleted && !canComplete) {
            return; // Don't allow selection
        }
        onChange(status);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Estado de la Orden</Text>

            <TouchableOpacity
                style={[styles.picker, disabled && styles.pickerDisabled]}
                onPress={() => !disabled && setModalVisible(true)}
                disabled={disabled}
            >
                <View style={[styles.badge, { backgroundColor: currentOption.hexBgColor }]}>
                    <Text style={[styles.badgeText, { color: currentOption.hexColor }]}>
                        {currentOption.label}
                    </Text>
                </View>
                {!disabled && (
                    <FontAwesome name="chevron-down" size={12} color="#94a3b8" />
                )}
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Estado</Text>

                        <FlatList
                            data={statusOptions}
                            keyExtractor={(item) => item.key}
                            renderItem={({ item }) => {
                                const isSelected = item.key === value;
                                const isDisabled = item.countsAsCompleted && !canComplete;

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.option,
                                            isSelected && styles.optionSelected,
                                            isDisabled && styles.optionDisabled,
                                        ]}
                                        onPress={() => handleSelect(item.key)}
                                        disabled={isDisabled}
                                    >
                                        <View style={[styles.optionBadge, { backgroundColor: item.hexBgColor }]}>
                                            <Text style={[styles.optionBadgeText, { color: item.hexColor }]}>
                                                {item.label}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <FontAwesome name="check" size={16} color={BrandColors.primary} />
                                        )}
                                        {isDisabled && (
                                            <FontAwesome name="lock" size={14} color="#94a3b8" />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        {!canComplete && (
                            <View style={styles.warningContainer}>
                                <FontAwesome name="info-circle" size={14} color="#f59e0b" />
                                <Text style={styles.warningText}>{completionMessage}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 6,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    pickerDisabled: {
        opacity: 0.6,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '85%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
        textAlign: 'center',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginBottom: 4,
    },
    optionSelected: {
        backgroundColor: '#f1f5f9',
    },
    optionDisabled: {
        opacity: 0.5,
    },
    optionBadge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    optionBadgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        padding: 12,
        borderRadius: 10,
        marginTop: 12,
        gap: 8,
    },
    warningText: {
        fontSize: 13,
        color: '#92400e',
        flex: 1,
    },
    cancelButton: {
        marginTop: 16,
        paddingVertical: 14,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
});
