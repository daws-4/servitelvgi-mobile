import { Tabs } from 'expo-router';
import React from 'react';
import CustomTabBar from '@/components/navigation/CustomTabBar';
import { BrandColors } from '@/constants/colors';
import { useAuth } from '@/app/contexts/AuthContext';

/**
 * Tab Navigator Layout
 * Configures the bottom tab navigation for main app screens
 */
export default function TabsLayout() {
    const { installer } = useAuth();

    // Log the showInventory value for debugging
    console.log('🔍 TabsLayout - installer.showInventory:', installer?.showInventory);

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
                name="orders/index"
                options={{
                    title: 'Órdenes',
                    tabBarLabel: 'Órdenes',
                }}
            />

            {/* Conditionally render inventory tab based on installer.showInventory */}
       
                <Tabs.Screen
                    name="inventory/index"
                    options={{
                        title: 'Inventario',
                        tabBarLabel: 'Inventario',
                        href: installer?.showInventory ? '/inventory' : null,
                    }}
                />
    

            <Tabs.Screen
                name="profile/index"
                options={{
                    title: 'Perfil',
                    tabBarLabel: 'Perfil',
                }}
            />

        </Tabs>
    );
}
