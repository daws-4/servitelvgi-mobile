import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

export interface InventoryItemData {
    id: string;
    name: string;
    code: string;
    quantity: number;
    unit: string;
    icon: string;
    isLowStock?: boolean;
    isEquipment?: boolean;
}

interface InventoryItemProps {
    item: InventoryItemData;
    onPress?: () => void;
}

export default function InventoryItem({ item, onPress }: InventoryItemProps) {
    const isLowStock = item.isLowStock || false;
    const isEquipment = item.isEquipment || false;

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={isEquipment ? 0.7 : 1}
            onPress={isEquipment ? onPress : undefined}
            disabled={!isEquipment}
        >
            <View style={styles.leftSection}>
                <View style={[
                    styles.iconContainer,
                    isLowStock ? styles.iconContainerLowStock : styles.iconContainerNormal
                ]}>
                    <FontAwesome
                        name={item.icon as any}
                        size={18}
                        color={isLowStock ? '#ef4444' : BrandColors.primary}
                    />
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.name}</Text>
                        {isEquipment && (
                            <View style={styles.equipmentBadge}>
                                <FontAwesome name="microchip" size={8} color="#3b82f6" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.code}>CÓD: {item.code}</Text>
                </View>
            </View>

            <View style={styles.rightSection}>
                <Text style={[
                    styles.quantity,
                    isLowStock ? styles.quantityLowStock : styles.quantityNormal
                ]}>
                    {String(item.quantity).padStart(2, '0')}
                </Text>
                <Text style={[
                    styles.unit,
                    isLowStock ? styles.unitLowStock : styles.unitNormal
                ]}>
                    {isLowStock ? 'BAJO STOCK' : item.unit}
                </Text>
            </View>

            {isEquipment && (
                <FontAwesome
                    name="chevron-right"
                    size={12}
                    color="#cbd5e1"
                    style={styles.chevron}
                />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#f1f5f9', // slate-100
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerNormal: {
        backgroundColor: 'rgba(222, 239, 183, 0.3)', // BrandColors.background with opacity
    },
    iconContainerLowStock: {
        backgroundColor: '#fef2f2', // red-50
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '900',
        color: '#0f0f0f',
        textTransform: 'uppercase',
        letterSpacing: -0.3,
        marginBottom: 2,
    },
    code: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#94a3b8', // slate-400
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    quantity: {
        fontSize: 18,
        fontWeight: '900',
        lineHeight: 18,
        marginBottom: 4,
    },
    quantityNormal: {
        color: BrandColors.primary,
    },
    quantityLowStock: {
        color: '#dc2626', // red-600
    },
    unit: {
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    unitNormal: {
        color: '#94a3b8', // slate-400
    },
    unitLowStock: {
        color: '#f87171', // red-400
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    equipmentBadge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    chevron: {
        marginLeft: 8,
    },
});
