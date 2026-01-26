import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import { BlurView } from 'expo-blur';

interface OrderTypeSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (type: 'recovery' | 'visit') => void;
}

export default function OrderTypeSelectionModal({ visible, onClose, onSelect }: OrderTypeSelectionModalProps) {
    if (!visible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nueva Orden</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <FontAwesome name="times" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>Selecciona el tipo de orden que deseas crear</Text>

                    <View style={styles.optionsContainer}>
                        {/* Recovery Option */}
                        <TouchableOpacity
                            style={styles.optionCard}
                            onPress={() => onSelect('recovery')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
                                <FontAwesome name="history" size={24} color="#3B82F6" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>Orden de Recuperación</Text>
                                <Text style={styles.optionDescription}>Para recuperar equipos de clientes</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={16} color="#CBD5E1" />
                        </TouchableOpacity>

                        {/* Visit Option */}
                        <TouchableOpacity
                            style={styles.optionCard}
                            onPress={() => onSelect('visit')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
                                <FontAwesome name="user" size={24} color="#22C55E" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>Orden de Visita</Text>
                                <Text style={styles.optionDescription}>Crea una nueva orden de visita</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={16} color="#CBD5E1" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    closeButton: {
        padding: 8,
        marginRight: -8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    optionsContainer: {
        gap: 16,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
        color: '#64748b',
    },
});
