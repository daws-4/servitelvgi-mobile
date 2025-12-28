import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/app/contexts/ThemeColors';

/**
 * Inventory screen - Display crew inventory
 */
export default function InventoryScreen() {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();

    return (
        <>
            <Header title="Inventario" showInstallerInfo />
            <ScrollView
                style={{ paddingTop: insets.top + 70 }}
                className="px-6 pt-6 bg-background"
            >
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-text mb-2">
                        Inventario de Cuadrilla
                    </Text>
                    <Text className="text-text opacity-50">
                        Materiales y equipos asignados
                    </Text>
                </View>

                {/* Empty state placeholder */}
                <View className="items-center justify-center py-20">
                    <View
                        className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4"
                        style={{ opacity: 0.5 }}
                    >
                        <Feather name="package" size={40} color={colors.icon} />
                    </View>
                    <Text className="text-text text-lg font-semibold mb-2">
                        Sin inventario asignado
                    </Text>
                    <Text className="text-text opacity-50 text-center px-8">
                        El inventario de tu cuadrilla aparecerá aquí
                    </Text>
                </View>

                <View className="h-32" />
            </ScrollView>
        </>
    );
}
