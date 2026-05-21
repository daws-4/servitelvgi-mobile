import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import OrderCard from './OrderCard';

import { BrandColors } from '@/constants/colors';
import type { Order } from '@/types/Order';

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  onMap: () => void;
}

export default function OrderDetail({ order, onBack, onMap }: OrderDetailProps) {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState('Completada Satisfactoriamente');
  const [cableUsed, setCableUsed] = useState('');
  const [observations, setObservations] = useState('');

  return (
    <SafeAreaView className="mt-2 flex-1" style={{ backgroundColor: '#f8fafc' }}>
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View
          className="flex-row items-center border-b border-slate-100 px-6 pb-5"
          style={{ backgroundColor: 'rgba(248, 250, 252, 0.9)' }}>
          <TouchableOpacity
            onPress={onBack}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <FontAwesome name="arrow-left" size={16} color="#0f0f0f" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-gray-900">Detalle de Orden</Text>
            <Text className="text-xs font-bold text-slate-400">
              Abonado: {order.subscriberNumber}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onMap}
            className="ml-auto h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <FontAwesome name="map" size={16} color={BrandColors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top,
            paddingBottom: 24,
          }}
          style={{ flex: 1 }}>
          {/* Top Bar */}

          {/* Client Info Card */}
          <LinearGradient
            colors={[BrandColors.secondary, BrandColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="m-4 p-6 shadow-lg"
            style={{ elevation: 10, borderRadius: 32 }}>
            <View className="mb-4 flex-row items-center">
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <Text className="text-2xl font-black" style={{ color: BrandColors.primary }}>
                  DC
                </Text>
              </View>
              <View>
                <Text className="text-xl font-bold text-white">{order.subscriberName}</Text>
                <Text className="text-sm text-blue-100 opacity-80">Plan FibraNet 500Mb</Text>
              </View>
            </View>

            <View className="flex-row gap-6 border-t border-white/20 pt-4">
              <View>
                <Text className="mb-0.5 text-xs font-bold uppercase text-blue-100 opacity-60">
                  NODO
                </Text>
                <Text className="text-sm font-bold text-white">SCRVEG20112A</Text>
              </View>
              <View>
                <Text className="mb-0.5 text-xs font-bold uppercase text-blue-100 opacity-60">
                  TELÉFONO
                </Text>
                <Text className="text-sm font-bold text-white">424-7617337</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Form */}
          <View className="gap-6 px-6 pt-0">
            <View className="flex-row items-center">
              <FontAwesome
                name="list-alt"
                size={16}
                color={BrandColors.primary}
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-black uppercase tracking-wider text-gray-900">
                Reporte de Instalación
              </Text>
            </View>

            {/* Status Select (Simulated) */}
            <View className="gap-2">
              <Text className="ml-1 text-sm font-bold text-slate-400">Estado de Ejecución</Text>
              <View className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Text className="text-base font-medium text-gray-900">{status}</Text>
                <FontAwesome name="chevron-down" size={12} color="#cbd5e1" />
              </View>
            </View>

            {/* Material Input */}
            <View className="gap-2">
              <Text className="ml-1 text-sm font-bold text-slate-400">
                Cable UTP Utilizado (mts)
              </Text>
              <TextInput
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base"
                placeholder="Ej: 45"
                keyboardType="numeric"
                value={cableUsed}
                onChangeText={setCableUsed}
              />
            </View>

            {/* Observations */}
            <View className="gap-2">
              <Text className="ml-1 text-sm font-bold text-slate-400">Observaciones Técnicas</Text>
              <TextInput
                className="h-[100px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base"
                placeholder="Detalles de la falla o instalación..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={observations}
                onChangeText={setObservations}
              />
            </View>

            {/* Photos */}
            <View className="gap-2">
              <Text className="ml-1 text-sm font-bold text-slate-400">Evidencias Fotográficas</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity className="h-[100px] w-[100px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-100">
                  <FontAwesome name="camera" size={20} color="#94a3b8" />
                  <Text className="mt-1 text-[10px] font-bold text-slate-400">AGREGAR</Text>
                </TouchableOpacity>
                {/* Placeholder for photos */}
                <View className="relative h-[100px] w-[100px] rounded-2xl bg-slate-200">
                  <View
                    className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-md"
                    style={{ elevation: 5 }}>
                    <FontAwesome name="times" size={10} color="white" />
                  </View>
                </View>
              </View>
            </View>

            {/* Footer Action */}
            <View
              className="px-6 pt-4"
              style={{ paddingBottom: Math.max(insets.bottom, 24), backgroundColor: '#f8fafc' }}>
              <TouchableOpacity
                className="flex-row items-center justify-center gap-3 rounded-2xl p-4 shadow-lg"
                style={{
                  backgroundColor: BrandColors.primary,
                  elevation: 8,
                }}>
                <FontAwesome name="paper-plane" size={16} color="white" />
                <Text className="text-lg font-bold text-white">Finalizar Orden</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
