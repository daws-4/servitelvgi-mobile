import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';

import InstallerHeader from '@/components/orders/InstallerHeader';
import OrderFilters from '@/components/orders/OrderFilters';
import OrderCard, { Order } from '@/components/orders/OrderCard';
import OrderDetail from '@/components/orders/OrderDetail';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { BrandColors } from '@/constants/colors';

// Mock Data
const MOCK_ORDERS: Order[] = [
    {
        id: '368063',
        type: 'Instalación',
        clientName: 'DANIEL CHACÓN',
        address: 'MUNICIPIO CÁRDENAS, URB. LA FLORIDA...',
        timeAgo: 'Hace 2 horas',
        statusColor: '#4ade80',
        statusBg: '#dcfce7', // green-100
        statusText: '#16a34a', // green-600
    },
    {
        id: '369120',
        type: 'Avería Crítica',
        clientName: 'MARÍA RODRÍGUEZ',
        address: 'CALLE 5, SECTOR LAS LOMAS, EDIF...',
        timeAgo: 'Urgente',
        statusColor: '#f87171',
        statusBg: '#fee2e2', // red-100
        statusText: '#dc2626', // red-600
    },
    {
        id: '36863',
        type: 'Instalación',
        clientName: 'DANIEL CHACÓN',
        address: 'MUNICIPIO CÁRDENAS, URB. LA FLORIDA...',
        timeAgo: 'Hace 2 horas',
        statusColor: '#4ade80',
        statusBg: '#dcfce7', // green-100
        statusText: '#16a34a', // green-600
    },
    {
        id: '3690',
        type: 'Avería Crítica',
        clientName: 'MARÍA RODRÍGUEZ',
        address: 'CALLE 5, SECTOR LAS LOMAS, EDIF...',
        timeAgo: 'Urgente',
        statusColor: '#f87171',
        statusBg: '#fee2e2', // red-100
        statusText: '#dc2626', // red-600
    },
    {
        id: '38063',
        type: 'Instalación',
        clientName: 'DANIEL CHACÓN',
        address: 'MUNICIPIO CÁRDENAS, URB. LA FLORIDA...',
        timeAgo: 'Hace 2 horas',
        statusColor: '#4ade80',
        statusBg: '#dcfce7', // green-100
        statusText: '#16a34a', // green-600
    },
    {
        id: '36910',
        type: 'Avería Crítica',
        clientName: 'MARÍA RODRÍGUEZ',
        address: 'CALLE 5, SECTOR LAS LOMAS, EDIF...',
        timeAgo: 'Urgente',
        statusColor: '#f87171',
        statusBg: '#fee2e2', // red-100
        statusText: '#dc2626', // red-600
    },
];

type ViewMode = 'list' | 'detail' | 'map';

export default function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight(); // Get TabBar height
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');

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
                setSelectedOrder(null);
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

    const handleOrderPress = (order: Order) => {
        setSelectedOrder(order);
        setViewMode('detail');
    };

    const handleMapPress = () => {
        setViewMode('map');
    };

    // Render Detail View
    if (viewMode === 'detail' && selectedOrder) {
        return (
            <OrderDetail
                order={selectedOrder}
                onBack={() => setViewMode('list')}
                onMap={() => setViewMode('map')}
            />
        );
    }

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

                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={[StyleSheet.absoluteFillObject, { marginTop: insets.top + 60, marginBottom: tabBarHeight }]}
                    initialRegion={initialRegion}
                    showsUserLocation
                    showsMyLocationButton
                    showsCompass
                />
            </View>
        );
    }

    // Render List View (Default)
    return (
        <View style={styles.container}>
            <InstallerHeader />
            <OrderFilters
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
            />

            <ScrollView
                contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 100 }]}
                showsVerticalScrollIndicator={true}
            >
                {MOCK_ORDERS.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onPress={() => handleOrderPress(order)}
                    />
                ))}
            </ScrollView>

            {/* Floating Map Button (simulating context action or just extra navigational aid) */}
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
        backgroundColor: '#f8fafc', // slate-50
    },
    listContent: {
        paddingBottom: 100,
    },
    mapHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
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
