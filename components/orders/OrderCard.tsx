import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

export interface Order {
    id: string;
    type: 'Instalación' | 'Avería Crítica';
    clientName: string;
    address: string;
    timeAgo: string;
    statusColor: string;
    statusBg: string;
    statusText: string;
}

interface OrderCardProps {
    order: Order;
    onPress: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
    const isInstallation = order.type === 'Instalación';
    const accentColor = isInstallation ? '#4ade80' : '#f87171'; // green-400 : red-400

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={onPress}
        >
            {/* Status Strip */}
            <View style={[styles.strip, { backgroundColor: accentColor }]} />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={[
                        styles.badge,
                        { backgroundColor: order.statusBg }
                    ]}>
                        <Text style={[styles.badgeText, { color: order.statusText }]}>
                            {order.type}
                        </Text>
                    </View>
                    <Text style={styles.orderId}>#{order.id}</Text>
                </View>

                {/* Body */}
                <Text style={styles.clientName}>{order.clientName}</Text>

                <View style={styles.addressContainer}>
                    <FontAwesome name="map-marker" size={12} color={BrandColors.primary} style={styles.icon} />
                    <Text style={styles.addressText} numberOfLines={1}>
                        {order.address}
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.timeText}>{order.timeAgo}</Text>
                    <View style={styles.actionBtn}>
                        <FontAwesome name="chevron-right" size={10} color="#64748b" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        marginHorizontal: 24,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#f1f5f9', // slate-100
    },
    strip: {
        width: 6,
        height: '100%',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    orderId: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8', // slate-400
    },
    clientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f0f0f', // onyx
        marginBottom: 4,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        marginRight: 6,
    },
    addressText: {
        fontSize: 12,
        color: '#64748b', // slate-500
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8', // slate-400
    },
    actionBtn: {
        padding: 8,
        backgroundColor: '#f1f5f9', // slate-100
        borderRadius: 12,
    },
});
