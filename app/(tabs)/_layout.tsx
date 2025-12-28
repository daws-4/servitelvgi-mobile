import { Tabs } from 'expo-router';
import React from 'react';
import CustomTabBar from '@/components/navigation/CustomTabBar';
import { BrandColors } from '@/constants/colors';

/**
 * Tab Navigator Layout
 * Configures the bottom tab navigation for main app screens
 */
export default function TabsLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: BrandColors.primary,
                tabBarInactiveTintColor: '#999999',
            }}
        >
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Órdenes',
                    tabBarLabel: 'Órdenes',
                }}
            />
            <Tabs.Screen
                name="inventory"
                options={{
                    title: 'Inventario',
                    tabBarLabel: 'Inventario',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarLabel: 'Perfil',
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Mapa',
                    tabBarLabel: 'Mapa',
                }}
            />
        </Tabs>
    );
}
