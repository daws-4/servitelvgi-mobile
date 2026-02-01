import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

export interface PickerOption {
    label: string;
    value: string;
    color?: string;
    bgColor?: string;
}

interface PickerFieldProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    options: PickerOption[];
    icon?: string;
    placeholder?: string;
    disabled?: boolean;
}

/**
 * Generic Picker field component
 * Shows a labeled field that opens a modal selection on press
 */
export default function PickerField({
    label,
    value,
    onChange,
    options,
    icon,
    placeholder,
    disabled = false,
}: PickerFieldProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val: string) => {
        onChange(val);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                {icon && <FontAwesome name={icon as any} size={12} color="#64748b" style={styles.icon} />}
                <Text style={styles.label}>{label}</Text>
            </View>

            <TouchableOpacity
                style={[styles.input, disabled && styles.disabledInput]}
                onPress={() => !disabled && setModalVisible(true)}
                disabled={disabled}
            >
                {selectedOption ? (
                    <View style={styles.valueRow}>
                        {selectedOption.color && (
                            <View style={[styles.colorDot, { backgroundColor: selectedOption.color }]} />
                        )}
                        <Text style={styles.valueText}>{selectedOption.label}</Text>
                    </View>
                ) : (
                    <Text style={styles.placeholder}>{placeholder || 'Seleccionar...'}</Text>
                )}

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
                        <Text style={styles.modalTitle}>Seleccionar {label}</Text>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => {
                                const isSelected = item.value === value;

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.option,
                                            isSelected && styles.optionSelected,
                                        ]}
                                        onPress={() => handleSelect(item.value)}
                                    >
                                        <View style={styles.optionContent}>
                                            {item.color && (
                                                <View style={[styles.optionColorDot, { backgroundColor: item.color }]} />
                                            )}
                                            <Text style={[
                                                styles.optionText,
                                                isSelected && styles.optionTextSelected
                                            ]}>
                                                {item.label}
                                            </Text>
                                        </View>

                                        {isSelected && (
                                            <FontAwesome name="check" size={16} color={BrandColors.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />

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
        marginBottom: 14,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    icon: {
        marginRight: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    disabledInput: {
        backgroundColor: '#f1f5f9',
        opacity: 0.8,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    valueText: {
        fontSize: 14,
        color: '#1e293b',
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    placeholder: {
        fontSize: 14,
        color: '#94a3b8',
    },
    // Modal Styles
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
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 4,
    },
    optionSelected: {
        backgroundColor: '#f1f5f9',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionColorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    optionText: {
        fontSize: 15,
        color: '#334155',
    },
    optionTextSelected: {
        color: BrandColors.primary,
        fontWeight: '600',
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
