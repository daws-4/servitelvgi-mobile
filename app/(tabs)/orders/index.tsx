import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/app/contexts/ThemeColors';

/**
 * Orders screen - List of installer orders
 */
export default function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const router = useRouter();

    return (
        <>
            <Header title="Órdenes" showInstallerInfo />
            <ScrollView
                style={{ paddingTop: insets.top + 70 }}
                className="px-6 pt-6 bg-background"
            >
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-text mb-2">
                        Mis Órdenes de Trabajo
                    </Text>
                    <Text className="text-text opacity-50">
                        Gestiona tus órdenes de instalación y servicio
                    </Text>
                </View>

                {/* Empty state placeholder */}
                <View className="items-center justify-center py-20">
                    <View
                        className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4"
                        style={{ opacity: 0.5 }}
                    >
                        <Feather name="list" size={40} color={colors.icon} />
                    </View>
                    <Text className="text-text text-lg font-semibold mb-2">
                        Sin órdenes pendientes
                    </Text>
                    <Text className="text-text opacity-50 text-center px-8">
                        Tus órdenes de trabajo aparecerán aquí
                    </Text>
                </View>

                <View className="h-32" />
            </ScrollView>
        </>
    );
}
