import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/colors';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/app/contexts/AuthContext';
import OrderCard from '@/components/orders/OrderCard';
import type { Order } from '@/types/Order';

export default function SelectVisitOriginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { installer } = useAuth();
    const crewId = installer?.crew?._id || '';

    const { orders, loading, error, refetch } = useOrders(crewId);

    // Filter logic:
    // - Not completed
    // - Not Hard
    // - Not Visita (don't create a visit from a visit)
    // - Not Recuperacion (Type)
    const eligibleOrders = useMemo(() => {
        return orders.filter(order =>
            order.status !== 'completed' &&
            order.status !== 'hard' &&
            order.status !== 'visita' &&
            order.type !== 'recuperacion'
        );
    }, [orders]);

    const handleSelectOrder = (order: Order) => {
        // Navigate to confirmation screen with the selected order ID
        router.push({
            pathname: '/(tabs)/orders/create-visit/confirm',
            params: { originId: order._id }
        });
    };

    const renderItem = ({ item }: { item: Order }) => (
        <View style={styles.cardWrapper}>
            <View style={styles.selectionOverlay} pointerEvents="none">
                <FontAwesome name="chevron-right" size={16} color={BrandColors.primary} />
            </View>
            <OrderCard order={item} onPress={() => handleSelectOrder(item)} />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seleccionar Orden Base</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.helperText}>
                    Selecciona la orden sobre la cual realizarás la visita tecnica.
                    Se copiarán los datos del cliente y dirección.
                </Text>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={BrandColors.primary} />
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                            <Text style={styles.retryText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                ) : eligibleOrders.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <FontAwesome name="list-alt" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No hay órdenes disponibles para generar visita</Text>
                    </View>
                ) : (
                    <FlatList
                        data={eligibleOrders}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    helperText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    errorText: {
        color: '#ef4444',
        marginBottom: 8,
    },
    retryButton: {
        padding: 8,
    },
    retryText: {
        color: BrandColors.primary,
        fontWeight: '600',
    },
    emptyText: {
        color: '#94a3b8',
        marginTop: 16,
        textAlign: 'center',
    },
    cardWrapper: {
        marginBottom: 12,
        position: 'relative',
    },
    selectionOverlay: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        zIndex: 10,
    }
});
