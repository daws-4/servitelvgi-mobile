import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

interface InventorySummaryProps {
    totalItems: number;
    lowStockCount: number;
}

export default function InventorySummary({ totalItems, lowStockCount }: InventorySummaryProps) {
    return (
        <View style={styles.container}>
            {/* Total Items Card */}
            <View style={[styles.card, styles.itemsCard]}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="archive" size={14} color={BrandColors.secondary} />
                </View>
                <View>
                    <Text style={styles.labelItems}>Ítems</Text>
                    <Text style={styles.valueItems}>{totalItems} Tipos</Text>
                </View>
            </View>

            {/* Low Stock Alerts Card */}
            <View style={[styles.card, styles.alertsCard]}>
                <View style={styles.iconContainerAlert}>
                    <FontAwesome name="exclamation-triangle" size={14} color="white" />
                </View>
                <View>
                    <Text style={styles.labelAlerts}>Alertas</Text>
                    <Text style={styles.valueAlerts}>{String(lowStockCount).padStart(2, '0')} Bajos</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        position: 'relative',
        zIndex: 10,
    },
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
    },
    itemsCard: {
        backgroundColor: 'rgba(222, 239, 183, 0.2)', // BrandColors.background with opacity
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    alertsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: BrandColors.background,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainerAlert: {
        width: 40,
        height: 40,
        backgroundColor: '#f87171', // red-400
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    labelItems: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(219, 234, 254, 1)', // blue-100
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    valueItems: {
        fontSize: 14,
        fontWeight: '900',
        color: 'white',
        marginTop: 2,
    },
    labelAlerts: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(219, 234, 254, 1)', // blue-100
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    valueAlerts: {
        fontSize: 14,
        fontWeight: '900',
        color: 'white',
        marginTop: 2,
    },
});
