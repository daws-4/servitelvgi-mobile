import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useQueryClient } from '@tanstack/react-query';

import { BrandColors } from '@/constants/colors';
import { useAuth } from '@/app/contexts/AuthContext';
import OrderCard from '@/components/orders/OrderCard';
import type { Order } from '@/types/Order';

export default function SelectVisitOriginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { installer } = useAuth();
    const crewId = installer?.crew?._id || '';

    // Access React Query cache to get orders already loaded in index.tsx
    const queryClient = useQueryClient();

    // Get all cached orders data from any useOrders calls
    const cachedOrders = useMemo(() => {
        const queries = queryClient.getQueriesData({ queryKey: ['orders', crewId] });
        const orderMap = new Map<string, Order>();

        // Flatten all pages from all matching queries and deduplicate by _id
        queries.forEach(([_key, data]: [any, any]) => {
            if (data?.pages) {
                data.pages.forEach((page: any) => {
                    if (page?.items) {
                        page.items.forEach((order: Order) => {
                            // Use Map to automatically deduplicate by _id
                            orderMap.set(order._id, order);
                        });
                    }
                });
            }
        });

        return Array.from(orderMap.values());
    }, [queryClient, crewId]);

    // Filter logic:
    // - Not completed
    // - Not Hard
    // - Not Visita (don't create a visit from a visit)
    // - Not Recuperacion (Type)
    const eligibleOrders = useMemo(() => {
        return cachedOrders.filter(order =>
            order.status !== 'completed' &&
            order.status !== 'hard' &&
            order.status !== 'visita' &&
            order.type !== 'recuperacion'
        );
    }, [cachedOrders]);

    const loading = cachedOrders.length === 0;
    const error = null;

    const handleSelectOrder = (order: Order) => {
        // Navigate to confirmation screen with the selected order ID
        router.push({
            pathname: '/(tabs)/orders/create-visit/confirm',
            params: { originId: order._id }
        });
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seleccionar Orden Base</Text>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={BrandColors.primary} />
                        <Text style={styles.emptyText}>Cargando órdenes...</Text>
                    </View>
                ) : eligibleOrders.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <FontAwesome name="list-alt" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No hay órdenes disponibles para generar visita</Text>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.helperText}>
                            Selecciona la orden sobre la cual realizarás la visita tecnica.
                            Se copiarán los datos del cliente y dirección.
                        </Text>
                        <View style={styles.listContent}>
                            {eligibleOrders.map((item) => (
                                <View key={item._id} style={styles.cardWrapper}>
                                    <View style={styles.selectionOverlay} pointerEvents="none">
                                        <FontAwesome name="chevron-right" size={16} color={BrandColors.primary} />
                                    </View>
                                    <OrderCard order={item} onPress={() => handleSelectOrder(item)} />
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
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
        marginBottom: 20,
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
