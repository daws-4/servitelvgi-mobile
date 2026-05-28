import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import MapView, { PROVIDER_DEFAULT, Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/app/contexts/AuthContext';
import InstallerHeader from '@/components/orders/InstallerHeader';
import OrderCard from '@/components/orders/OrderCard';
import OrderFilters from '@/components/orders/OrderFilters';
import OrderTypeSelectionModal from '@/components/orders/OrderTypeSelectionModal';
import { BrandColors } from '@/constants/colors';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useNotifications } from '@/hooks/useNotifications';
import { useOrders } from '@/hooks/useOrders';
import { useSmartPolling } from '@/hooks/useSmartPolling';
import type { Order, OrderStatus, OrderType } from '@/types/Order';

type ViewMode = 'list' | 'map';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  // Match CustomTabBar height: 64 + safeArea bottom
  const tabBarHeight = 64 + Math.max(insets.bottom, 0);
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<OrderType | 'all'>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const spinValue = React.useRef(new Animated.Value(0)).current;
  const spinAnimation = React.useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (refreshing) {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
      }
      spinValue.setValue(0);
      spinAnimation.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnimation.current.start();
    } else {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
        spinAnimation.current = null;
      }
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [refreshing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Debounce search value
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);



  // Auth context for crew ID
  const { installer } = useAuth();
  const crewId = installer?.crew?._id || '';

  // Orders data from API - now using server side filtering/search
  const { orders, loading, loadingMore, loadMore, error, refetch } = useOrders(
    crewId,
    {
      status: statusFilter === 'all' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
      search: debouncedSearchValue,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      sortDirection,
    },
    pageSize
  );

  // Notifications hook
  const { setupNotificationHandlers } = useNotifications();

  // Refetch orders when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refetch({ silent: true });
    }, [refetch])
  );

  // Setup notification handlers to refetch on new notifications
  useEffect(() => {
    const cleanup = setupNotificationHandlers(() => refetch({ silent: true }));
    return cleanup;
  }, [setupNotificationHandlers, refetch]);

  // Enable smart polling for order updates
  useSmartPolling({
    callback: () => refetch({ silent: true }),
    interval: 1000 * 60 * 6, // Poll every 6 minutes (aligned with staleTime) when app is active
    enabled: !loading && !!crewId, // Only poll when not loading and have crew ID
  });

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    console.log('🔄 Pull-to-refresh triggered!');
    try {
      setRefreshing(true);
      // Force refetch even if recently fetched (user explicitly requested)
      await refetch({ force: true });
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      // Always stop refreshing, even if there's an error
      setRefreshing(false);
      console.log('✅ Refresh completed');
    }
  };

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

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [viewMode]);

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc);
    } catch (error: any) {
      // Location is optional for map functionality - silently fail
      // Common errors: GPS disabled, location services off, timeout
      console.log('Location unavailable:', error?.message || 'Unknown error');
      setLocation(null);
    }
  };

  // Filtered orders - mostly pass-through now as filtering is server-side
  // We only keep this if we want to do optimistic UI updates or specific client-side sorts,
  // but the requirement is server-side.
  const filteredOrders = useMemo(() => {
    // Since we are filtering on server, 'orders' already contains the filtered list.
    // However, useOrders 'orders' is an aggregate of pages.
    // If we change filters, the hook resets and reloads.

    // Client-side sort fallback just to guarantee sorting is applied on loaded pages
    const sorted = [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.receptionDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.receptionDate || 0).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return sorted;
  }, [orders, sortDirection]);

  // Diagnostics for Map View
  useEffect(() => {
    if (viewMode === 'map') {
      const ordersWithCasa = filteredOrders.filter((o) => o.coordenadasCasa?.latitude).length;
      const ordersWithNap = filteredOrders.filter((o) => o.coordenadasNap?.latitude).length;
      const ordersWithLegacy = filteredOrders.filter((o) => o.coordinates?.latitude).length;

      console.log('=== [MapView Diagnostics] SCREEN MOUNT ===');
      console.log(`- Total orders in list: ${filteredOrders.length}`);
      console.log(`- Orders with coordenadasCasa (Subscriber): ${ordersWithCasa}`);
      console.log(`- Orders with coordenadasNap (NAP): ${ordersWithNap}`);
      console.log(`- Orders with legacy coordinates: ${ordersWithLegacy}`);
      console.log(`- User current GPS location active: ${!!location}`);
      if (location) {
        console.log(`- User location coordinates: ${location.coords.latitude}, ${location.coords.longitude}`);
      }
      console.log('==========================================');
    }
  }, [viewMode, filteredOrders, location]);

  const handleOrderPress = (order: Order) => {
    router.push(`/orders/${order._id}`);
  };

  const handleMapPress = () => {
    setViewMode('map');
  };

  const handleCreateOrder = () => {
    setShowCreateModal(true);
  };

  const handleOrderTypeSelect = (type: 'recovery' | 'visit') => {
    setShowCreateModal(false);
    if (type === 'recovery') {
      router.push('/orders/create-recovery');
    } else if (type === 'visit') {
      router.push('/(tabs)/orders/create-visit/select');
    }
  };

  // Render Map View
  if (viewMode === 'map') {
    const initialRegion = location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      : {
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
            onMapReady={() => {
              console.log('[MapView Diagnostics] Native Map is READY and initialized successfully!');
            }}
            onMapLoaded={() => {
              console.log('[MapView Diagnostics] Native Map tiles finished loading successfully.');
            }}
            onRegionChangeComplete={(region) => {
              console.log('[MapView Diagnostics] Map region changed to:', JSON.stringify(region));
            }}>
            {/* Show markers for orders with coordinates */}
            {filteredOrders.map((order) => {
              const coords =
                order.coordenadasCasa?.latitude && order.coordenadasCasa?.longitude
                  ? order.coordenadasCasa
                  : order.coordenadasNap?.latitude && order.coordenadasNap?.longitude
                  ? order.coordenadasNap
                  : order.coordinates?.latitude && order.coordinates?.longitude
                  ? order.coordinates
                  : null;

              if (!coords) return null;

              const label = order.coordenadasCasa?.latitude && order.coordenadasCasa?.longitude
                ? 'Casa'
                : order.coordenadasNap?.latitude && order.coordenadasNap?.longitude
                ? 'NAP'
                : 'Ubicación';

              return (
                <Marker
                  key={order._id}
                  coordinate={{
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                  }}
                  title={`${order.subscriberName} (${label})`}
                  description={order.address}
                  onCalloutPress={() => handleOrderPress(order)}
                />
              );
            })}
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
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
      />

      {/* Pagination & Count Control */}
      <View style={styles.paginationControl}>
        <Text style={styles.countText}>
          Mostrando{' '}
          <Text style={{ fontWeight: 'bold', color: BrandColors.primary }}>
            {filteredOrders.length}
          </Text>{' '}
          órdenes
        </Text>

        <View style={styles.pageSizeContainer}>
          <Text style={styles.pageSizeLabel}>Ver:</Text>
          {[10, 20, 50, 100].map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.pageSizeButton, pageSize === size && styles.pageSizeButtonActive]}
              onPress={() => setPageSize(size)}>
              <Text style={[styles.pageSizeText, pageSize === size && styles.pageSizeTextActive]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator
          bounces
          alwaysBounceVertical={true}
          overScrollMode="always"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: tabBarHeight + 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={BrandColors.primary}
              colors={[BrandColors.primary]}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

            // Load more when close to bottom and not already loading
            if (isCloseToBottom && !loadingMore) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}>
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
              <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
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
                {searchValue ||
                statusFilter !== 'all' ||
                typeFilter !== 'all' ||
                startDate ||
                endDate
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay órdenes asignadas a tu cuadrilla'}
              </Text>
            </View>
          )}

          {/* Orders List */}
          {!loading && !error && filteredOrders.length > 0 && (
            <View style={styles.listContent}>
              {filteredOrders.map((order) => (
                <OrderCard key={order._id} order={order} onPress={() => handleOrderPress(order)} />
              ))}

              {/* Load More Indicator */}
              {loadingMore && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={BrandColors.primary} />
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Floating Refresh Button */}
        <TouchableOpacity
          style={[styles.floatingRefreshBtn, { bottom: tabBarHeight + 116 }]}
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <FontAwesome name="refresh" size={16} color="white" />
          </Animated.View>
        </TouchableOpacity>

        {/* Floating Create Recovery Order Button */}
        <TouchableOpacity
          style={[styles.floatingCreateBtn, { bottom: tabBarHeight + 68 }]}
          onPress={handleCreateOrder}>
          <FontAwesome name="plus-square" size={16} color="white" />
        </TouchableOpacity>

        {/* Floating Map Button */}
        <TouchableOpacity
          style={[styles.floatingMapBtn, { bottom: tabBarHeight + 20 }]}
          onPress={handleMapPress}>
          <FontAwesome name="map" size={16} color="white" />
        </TouchableOpacity>

        <OrderTypeSelectionModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSelect={handleOrderTypeSelect}
        />
      </View>
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
    paddingBottom: 44,
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
  floatingRefreshBtn: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981', // Emerald green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingCreateBtn: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6', // Blue for recovery
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingMapBtn: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  paginationControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 13,
    color: '#64748b',
  },
  pageSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageSizeLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  pageSizeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pageSizeButtonActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  pageSizeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  pageSizeTextActive: {
    color: '#fff',
  },
});
