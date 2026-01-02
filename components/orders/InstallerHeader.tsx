import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import { useAuth } from '@/app/contexts/AuthContext';

interface InstallerHeaderProps {
    onSearch?: (text: string) => void;
}

export default function InstallerHeader({ onSearch }: InstallerHeaderProps) {
    const { installer } = useAuth();

    // Get installer's full name
    const fullName = installer ? `${installer.name} ${installer.surname}` : 'Técnico Instalador';

    // Get role/crew info
    const roleText = installer?.crew
        ? `Técnico • ${installer.crew.name}`
        : 'Técnico Instalador • Servitel';

    return (
        <LinearGradient
            colors={[BrandColors.secondary, BrandColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="pt-10 pb-8 px-8 rounded-b-[56px] relative overflow-hidden"
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

            {/* Avatar Button - Positioned absolutely */}
            <TouchableOpacity
                className="absolute top-10 right-8 w-12 h-12 rounded-full justify-center items-center z-20"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
            >
                <FontAwesome name="user-md" size={20} color="white" />
            </TouchableOpacity>

            {/* Header Content - Centered */}
            <View className="items-center relative z-10 mb-5 px-4">
                <Text
                    className="text-white text-2xl font-black mb-1 text-center"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ letterSpacing: -0.5 }}
                >
                    {fullName}
                </Text>
                <Text
                    className="text-[10px] font-bold uppercase"
                    style={{
                        color: 'rgba(219, 234, 254, 0.7)',
                        letterSpacing: 2,
                    }}
                >
                    {roleText}
                </Text>
            </View>

            {/* Search Bar */}
            <View className="relative justify-center">
                <FontAwesome
                    name="search"
                    size={14}
                    color="rgba(255,255,255,0.5)"
                    className="absolute left-4 z-10"
                    style={{ position: 'absolute', left: 16, zIndex: 1 }}
                />
                <TextInput
                    className="rounded-2xl py-2.5 pr-4 text-sm text-white"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderWidth: 1,
                        paddingLeft: 44,
                    }}
                    placeholder="Buscar abonado o dirección..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    onChangeText={onSearch}
                />
            </View>
        </LinearGradient>
    );
}
