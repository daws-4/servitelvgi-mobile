import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import { useAuth } from '@/app/contexts/AuthContext';

interface InventoryHeaderProps {
    children?: ReactNode;
}

export default function InventoryHeader({ children }: InventoryHeaderProps) {
    const { installer } = useAuth();

    return (
        <LinearGradient
            colors={[BrandColors.secondary, BrandColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="pt-10 pb-4 px-8 rounded-b-[56px] relative overflow-hidden"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 12,
            }}
        >
            {/* Background Decoration */}
            <View
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            />

            {/* History Button - Positioned absolutely */}
            <TouchableOpacity
                className="absolute top-10 right-8 w-10 h-10 rounded-2xl justify-center items-center z-20"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
            >
                <FontAwesome name="history" size={18} color="white" />
            </TouchableOpacity>

            {/* Header Content - Centered */}
            <View className="items-center relative z-10">
                <Text
                    className="text-white text-2xl font-black mb-1"
                    style={{ letterSpacing: -0.5 }}
                >
                    Mi Inventario
                </Text>
                <Text
                    className="text-[10px] font-bold uppercase"
                    style={{
                        color: 'rgba(219, 234, 254, 0.7)',
                        letterSpacing: 2,
                    }}
                >
                    Stock Asignado • {installer?.name || 'Instalador'}
                </Text>
            </View>

            {/* Children (e.g., InventorySummary) */}
            {children && (
                <View className="mt-4">
                    {children}
                </View>
            )}
        </LinearGradient>
    );
}
