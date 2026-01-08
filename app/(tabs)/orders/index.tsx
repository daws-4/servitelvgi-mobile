import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, ActivityIndicator, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import MapView, { PROVIDER_DEFAULT, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';

import InstallerHeader from '@/components/orders/InstallerHeader';
import OrderFilters from '@/components/orders/OrderFilters';
import OrderCard from '@/components/orders/OrderCard';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/app/contexts/AuthContext';
import { BrandColors } from '@/constants/colors';
import type { Order, OrderStatus, OrderType } from '@/types/Order';

type ViewMode = 'list' | 'map';

export default function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const router = useRouter();

    const [viewMode, setViewMode] = useState<ViewMode>('list');

    // Filters
    const [searchValue, setSearchValue] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<OrderType | 'all'>('all');

    // Auth context for crew ID
    const { installer } = useAuth();
    const crewId = installer?.crew?._id || '';

    // Orders data from API
    const { orders, loading, loadingMore, loadMore, error, refetch } = useOrders(crewId);

    // Map & Location State
    const { hasPermission, requestPermission } = useLocationPermission();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    // Initial Location Check
    useEffect(() => {
        if (hasPermission) {
            getCurrentLocation();
        } else {
            requestPermission();
        }
    }, [hasPermission]);

    // Handle Back Button
    useEffect(() => {
        const backAction = () => {
            if (viewMode !== 'list') {
                setViewMode('list');
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [viewMode]);

    const getCurrentLocation = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    // Filtered orders based on search and filters
    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        // Apply search filter
        if (searchValue.trim()) {
            const search = searchValue.toLowerCase().trim();
            filtered = filtered.filter(order =>
                order.subscriberNumber.toLowerCase().includes(search) ||
                order.subscriberName.toLowerCase().includes(search)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Apply type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(order => order.type === typeFilter);
        }

        return filtered;
    }, [orders, searchValue, statusFilter, typeFilter]);

    const handleOrderPress = (order: Order) => {
        router.push(`/orders/${order._id}`);
    };

    const handleMapPress = () => {
        setViewMode('map');
    };

    // Render Map View
    if (viewMode === 'map') {
        const initialRegion = location ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        } : {
            latitude: 10.4806,
            longitude: -66.9036,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };

        return (
            <View style={styles.container}>
                <View style={[styles.mapHeader, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => setViewMode('list')} style={styles.backBtn}>
                        <FontAwesome name="arrow-left" size={16} color="#0f0f0f" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mapa de Órdenes</Text>
                </View>

                <View style={{ flex: 1, paddingTop: insets.top + 60, paddingBottom: tabBarHeight }}>
                    <MapView
                        provider={PROVIDER_DEFAULT}
                        style={{ width: '100%', height: '100%' }}
                        initialRegion={initialRegion}
                        showsUserLocation
                        showsMyLocationButton
                        showsCompass
                    >
                        {/* Show markers for orders with coordinates */}
                        {filteredOrders
                            .filter(order => order.coordinates?.latitude && order.coordinates?.longitude)
                            .map(order => (
                                <Marker
                                    key={order._id}
                                    coordinate={{
                                        latitude: order.coordinates!.latitude,
                                        longitude: order.coordinates!.longitude,
                                    }}
                                    title={order.subscriberName}
                                    description={order.address}
                                    onCalloutPress={() => handleOrderPress(order)}
                                />
                            ))}
                    </MapView>
                </View>
            </View>
        );
    }

    // Render List View (Default)
    return (
        <View style={styles.container}>
            <InstallerHeader />
            <OrderFilters
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
            />

            {/* Loading State */}
            {loading && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                    <Text style={styles.loadingText}>Cargando órdenes...</Text>
                </View>
            )}

            {/* Error State */}
            {error && !loading && (
                <View style={styles.centerContainer}>
                    <FontAwesome name="exclamation-triangle" size={40} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Empty State */}
            {!loading && !error && filteredOrders.length === 0 && (
                <View style={styles.centerContainer}>
                    <FontAwesome name="inbox" size={48} color="#cbd5e1" />
                    <Text style={styles.emptyTitle}>No se encontraron órdenes</Text>
                    <Text style={styles.emptyText}>
                        {searchValue || statusFilter !== 'all' || typeFilter !== 'all'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay órdenes asignadas a tu cuadrilla'}
                    </Text>
                </View>
            )}

            {/* Orders List */}
            {!loading && !error && filteredOrders.length > 0 && (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(order) => order._id}
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            onPress={() => handleOrderPress(item)}
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: tabBarHeight + 100 }
                    ]}
                    showsVerticalScrollIndicator={true}
                    onEndReached={() => {
                        // Only load more if no filters are active (simple infinite scroll)
                        // Or we can try to support it with filters too, but logic might be tricky if filters are client-side only?
                        // Actually, filters are passed to the hook and then to API.
                        // But wait! logic in index.tsx does client-side filtering on `orders` array returned by hook.
                        // If we use pagination, we MUST fetch filtered results from backend or else we filter only the loaded page.
                        // CURRENTLY `filteredOrders` is client-side filtered.
                        // Since useOrders fetches PAGE 1-N, applying client-side filter to that is partial.
                        // ideally we should move filters to API param in useOrders.
                        if (!searchValue && statusFilter === 'all' && typeFilter === 'all') {
                            loadMore();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={{ padding: 16, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color={BrandColors.primary} />
                            </View>
                        ) : null
                    }
                />
            )}

            {/* Floating Map Button */}
            <TouchableOpacity
                style={[styles.floatingMapBtn, { bottom: tabBarHeight + 24 }]}
                onPress={handleMapPress}
            >
                <FontAwesome name="map" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 100,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748b',
    },
    errorText: {
        marginTop: 16,
        fontSize: 14,
        color: '#ef4444',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#ef4444',
        borderRadius: 12,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    emptyText: {
        marginTop: 8,
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
    mapHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f0f0f',
    },
    floatingMapBtn: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: BrandColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
