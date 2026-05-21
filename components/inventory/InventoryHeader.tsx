import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useAuth } from '@/app/contexts/AuthContext';
import { BrandColors } from '@/constants/colors';

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
      className="relative overflow-hidden rounded-b-[56px] px-8 pb-4 pt-10"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
      }}>
      {/* Background Decoration */}
      <View
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      />

      {/* History Button - Positioned absolutely */}
      <TouchableOpacity
        className="absolute right-8 top-10 z-20 h-10 w-10 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}>
        <FontAwesome name="history" size={18} color="white" />
      </TouchableOpacity>

      {/* Header Content - Centered */}
      <View className="relative z-10 items-center">
        <Text className="mb-1 text-2xl font-black text-white" style={{ letterSpacing: -0.5 }}>
          Mi Inventario
        </Text>
        <Text
          className="text-[10px] font-bold uppercase"
          style={{
            color: 'rgba(219, 234, 254, 0.7)',
            letterSpacing: 2,
          }}>
          Stock Asignado • {installer?.name || 'Instalador'}
        </Text>
      </View>

      {/* Children (e.g., InventorySummary) */}
      {children && <View className="mt-4">{children}</View>}
    </LinearGradient>
  );
}
