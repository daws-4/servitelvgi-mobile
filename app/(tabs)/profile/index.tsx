import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/app/contexts/ThemeColors';
import { useAuth } from '@/app/contexts/AuthContext';
import { BrandColors } from '@/constants/colors';

/**
 * Profile screen - Display installer profile and settings
 */
export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const { installer, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <Header showInstallerInfo />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: insets.top + 70 + 24,
                    paddingHorizontal: 24,
                    paddingBottom: 24
                }}
                showsVerticalScrollIndicator={true}
            >
                {/* Profile Header */}
                <View className="items-center mb-8">
                    <Image
                        source={require('@/assets/img/thomino.jpg')}
                        className="w-24 h-24 rounded-full mb-4"
                    />
                    <Text className="text-2xl font-bold text-text">
                        {installer?.name} {installer?.surname}
                    </Text>
                    <Text className="text-text opacity-50 mb-2">
                        @{installer?.username}
                    </Text>
                    {installer?.crew && (
                        <View className="flex-row items-center bg-secondary rounded-full px-4 py-2 mt-2">
                            <Feather name="users" size={16} color={colors.text} />
                            <Text className="text-text ml-2 font-semibold">
                                {installer.crew.name}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Profile Information */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-text mb-4">
                        Información Personal
                    </Text>

                    {installer?.email && (
                        <ProfileItem
                            icon="mail"
                            label="Email"
                            value={installer.email}
                        />
                    )}

                    {installer?.phone && (
                        <ProfileItem
                            icon="phone"
                            label="Teléfono"
                            value={installer.phone}
                        />
                    )}

                    <ProfileItem
                        icon="activity"
                        label="Estado"
                        value={installer?.status === 'active' ? 'Activo' : 'Inactivo'}
                    />

                    <ProfileItem
                        icon="briefcase"
                        label="En Servicio"
                        value={installer?.onDuty ? 'Sí' : 'No'}
                    />
                </View>

                {/* Actions */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-text mb-4">
                        Configuración
                    </Text>

                    <Pressable
                        onPress={handleLogout}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}
                        className="flex-row items-center bg-secondary rounded-2xl px-4 py-4 mb-3"
                    >
                        <View className="w-12 h-12 bg-background flex items-center justify-center rounded-full">
                            <Feather name="log-out" size={20} color={BrandColors.primary} />
                        </View>
                        <Text className="text-text font-semibold ml-4 flex-1">
                            Cerrar Sesión
                        </Text>
                        <Feather name="chevron-right" size={20} color={colors.icon} />
                    </Pressable>
                </View>

                <View className="h-32" />
            </ScrollView>
        </View>
    );
}

/**
 * Profile information item component
 */
function ProfileItem({ icon, label, value }: { icon: string, label: string, value: string }) {
    const colors = useThemeColors();

    return (
        <View className="flex-row items-center bg-secondary rounded-2xl px-4 py-4 mb-3">
            <View className="w-10 h-10 bg-background flex items-center justify-center rounded-full">
                <Feather name={icon as any} size={18} color={colors.icon} />
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-text opacity-50 text-xs">{label}</Text>
                <Text className="text-text font-semibold">{value}</Text>
            </View>
        </View>
    );
}
