import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Header from '@/components/Header';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/app/contexts/ThemeColors';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import * as Location from 'expo-location';

/**
 * Map screen - Display orders on map
 */
export default function MapScreen() {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const { hasPermission, requestPermission } = useLocationPermission();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    useEffect(() => {
        if (hasPermission) {
            getCurrentLocation();
        }
    }, [hasPermission]);

    const getCurrentLocation = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    // Request permission if not granted
    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, []);

    if (!hasPermission) {
        return (
            <>
                <Header title="Mapa" showInstallerInfo />
                <View
                    style={{ paddingTop: insets.top + 70 }}
                    className="flex-1 items-center justify-center bg-background px-6"
                >
                    <View
                        className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4"
                        style={{ opacity: 0.5 }}
                    >
                        <Feather name="map-pin" size={40} color={colors.icon} />
                    </View>
                    <Text className="text-text text-lg font-semibold mb-2 text-center">
                        Permiso de Ubicación Requerido
                    </Text>
                    <Text className="text-text opacity-50 text-center">
                        Se necesita permiso de ubicación para mostrar el mapa
                    </Text>
                </View>
            </>
        );
    }

    const initialRegion = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    } : {
        latitude: 10.4806, // Default: Caracas, Venezuela
        longitude: -66.9036,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    return (
        <>
            <Header title="Mapa" showInstallerInfo />
            <View style={{ paddingTop: insets.top + 70 }} className="flex-1">
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={initialRegion}
                    showsUserLocation
                    showsMyLocationButton
                    showsCompass
                >
                    {/* Future: Add order markers here */}
                </MapView>
            </View>
        </>
    );
}
