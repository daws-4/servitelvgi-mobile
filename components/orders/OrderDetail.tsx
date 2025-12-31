import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Order } from './OrderCard';

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
        <SafeAreaView className="flex-1 mt-2" style={{ backgroundColor: '#f8fafc' }}>
            <View style={{ flex: 1, backgroundColor: '#f8fafc'   }} >
                <View
                    className="flex-row items-center px-6 pb-5 border-b border-slate-100"
                    style={{ backgroundColor: 'rgba(248, 250, 252, 0.9)' }}
                >
                    <TouchableOpacity
                        onPress={onBack}
                        className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center mr-4"
                    >
                        <FontAwesome name="arrow-left" size={16} color="#0f0f0f" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-lg font-bold text-gray-900">Detalle de Orden</Text>
                        <Text className="text-xs font-bold text-slate-400">Abonado: {order.id}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={onMap}
                        className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center ml-auto"
                    >
                        <FontAwesome name="map" size={16} color={BrandColors.primary} />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop: insets.top,
                        paddingBottom: 24
                    }}
                    style={{ flex: 1 }}
                >
                    {/* Top Bar */}
                    

                    {/* Client Info Card */}
                    <LinearGradient
                        colors={[BrandColors.secondary, BrandColors.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="m-4 p-6 shadow-lg"
                        style={{ elevation: 10, borderRadius: 32 }}
                    >
                        <View className="flex-row items-center mb-4">
                            <View className="w-14 h-14 bg-white rounded-2xl justify-center items-center mr-4">
                                <Text className="text-2xl font-black" style={{ color: BrandColors.primary }}>DC</Text>
                            </View>
                            <View>
                                <Text className="text-white text-xl font-bold">{order.clientName}</Text>
                                <Text className="text-blue-100 text-sm opacity-80">Plan FibraNet 500Mb</Text>
                            </View>
                        </View>

                        <View className="flex-row border-t border-white/20 pt-4 gap-6">
                            <View>
                                <Text className="text-blue-100 text-xs font-bold uppercase opacity-60 mb-0.5">NODO</Text>
                                <Text className="text-white text-sm font-bold">SCRVEG20112A</Text>
                            </View>
                            <View>
                                <Text className="text-blue-100 text-xs font-bold uppercase opacity-60 mb-0.5">TELÉFONO</Text>
                                <Text className="text-white text-sm font-bold">424-7617337</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Form */}
                    <View className="px-6 pt-0 gap-6">
                        <View className="flex-row items-center">
                            <FontAwesome name="list-alt" size={16} color={BrandColors.primary} style={{ marginRight: 8 }} />
                            <Text className="text-base font-black text-gray-900 uppercase tracking-wider">Reporte de Instalación</Text>
                        </View>

                        {/* Status Select (Simulated) */}
                        <View className="gap-2">
                            <Text className="text-sm font-bold text-slate-400 ml-1">Estado de Ejecución</Text>
                            <View className="flex-row justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                <Text className="text-base font-medium text-gray-900">{status}</Text>
                                <FontAwesome name="chevron-down" size={12} color="#cbd5e1" />
                            </View>
                        </View>

                        {/* Material Input */}
                        <View className="gap-2">
                            <Text className="text-sm font-bold text-slate-400 ml-1">Cable UTP Utilizado (mts)</Text>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base"
                                placeholder="Ej: 45"
                                keyboardType="numeric"
                                value={cableUsed}
                                onChangeText={setCableUsed}
                            />
                        </View>

                        {/* Observations */}
                        <View className="gap-2">
                            <Text className="text-sm font-bold text-slate-400 ml-1">Observaciones Técnicas</Text>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base h-[100px]"
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
                            <Text className="text-sm font-bold text-slate-400 ml-1">Evidencias Fotográficas</Text>
                            <View className="flex-row gap-2">
                                <TouchableOpacity className="w-[100px] h-[100px] bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl justify-center items-center">
                                    <FontAwesome name="camera" size={20} color="#94a3b8" />
                                    <Text className="text-[10px] font-bold text-slate-400 mt-1">AGREGAR</Text>
                                </TouchableOpacity>
                                {/* Placeholder for photos */}
                                <View className="w-[100px] h-[100px] bg-slate-200 rounded-2xl relative">
                                    <View className="absolute top-1 right-1 bg-red-500 w-5 h-5 rounded-full justify-center items-center shadow-md" style={{ elevation: 5 }}>
                                        <FontAwesome name="times" size={10} color="white" />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Footer Action */}
                        <View
                            className="px-6 pt-4"
                            style={{ paddingBottom: Math.max(insets.bottom, 24), backgroundColor: '#f8fafc' }}
                        >
                            <TouchableOpacity
                                className="flex-row justify-center items-center p-4 rounded-2xl gap-3 shadow-lg"
                                style={{
                                    backgroundColor: BrandColors.primary,
                                    elevation: 8
                                }}
                            >
                                <FontAwesome name="paper-plane" size={16} color="white" />
                                <Text className="text-white font-bold text-lg">Finalizar Orden</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View >
        </SafeAreaView >
    );
}
