import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import ThemeToggle from './ThemeToggle';
import useThemeColors from '@/app/contexts/ThemeColors';
import SlideUp from './SlideUp';
import { useState } from 'react';
import React from 'react';
import { useOffline } from '@/app/contexts/OfflineContext';
import { BrandColors, StatusColors } from '@/constants/colors';

interface HeaderProps {
    showBackButton?: boolean;
    title?: string;
    hasAvatar?: boolean;
    showInstallerInfo?: boolean; // Show installer name and crew
    showLogo?: boolean; // Show Servitel logo
}

export default function Header({ showBackButton = false, title = '', hasAvatar = false, showInstallerInfo = false, showLogo = false }: HeaderProps) {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [showSlideUp, setShowSlideUp] = useState(false);
    const { installer } = require('@/app/contexts/AuthContext').useAuth();

    return (
        <>
            <View className=' px-5 py-6 flex-row bg-background items-center justify-between absolute top-0 left-0 right-0 z-50' style={{ paddingTop: insets.top + 10 }}>
                <View className="flex-row items-center flex-1">
                    {showBackButton && (
                        <Pressable
                            onPress={() => router.back()}
                            className="mr-3 p-1"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Feather name="arrow-left" color={colors.icon} size={24} />
                        </Pressable>
                    )}

                    {/* Servitel Logo */}
                    {showLogo && (
                        <View className="mr-3">
                            <Text style={{ color: BrandColors.primary }} className="text-2xl font-bold">
                               ENLARED
                            </Text>
                        </View>
                    )}

                    {hasAvatar && (
                        <Pressable onPress={() => setShowSlideUp(true)}>
                            <Image source={require('@/assets/img/thomino.jpg')} className='w-8 h-8 rounded-full mr-3' />
                        </Pressable>
                    )}

                    {/* Installer Info */}
                    {showInstallerInfo && installer && (
                        <View className="flex-1">
                            <Text className="text-text font-bold text-base">
                                {installer.name} {installer.surname}
                            </Text>
                            {installer.crew && (
                                <Text className="text-text opacity-50 text-xs">
                                    {installer.crew.name}
                                </Text>
                            )}
                        </View>
                    )}

                    {title && !showInstallerInfo && (
                        <Text className="text-text text-2xl font-bold">{title}</Text>
                    )}
                </View>

                {/* Sync indicator and theme toggle */}
                <View className="flex-row items-center gap-3">
                    <SyncIndicator />
                    <ThemeToggle />
                </View>
            </View>
            <SlideUp visible={showSlideUp} onClose={() => setShowSlideUp(false)} />
        </>
    );
}

/**
 * Indicador de sincronización offline
 */
function SyncIndicator() {
    const { isSyncing, pendingCount } = useOffline();
    const colors = useThemeColors();

    if (!isSyncing && pendingCount === 0) {
        return null;
    }

    return (
        <View className="flex-row items-center gap-2">
            {isSyncing ? (
                <>
                    <ActivityIndicator size="small" color={BrandColors.primary} />
                    <Text style={{ color: colors.text, fontSize: 12 }}>
                        Sincronizando...
                    </Text>
                </>
            ) : (
                <View className="flex-row items-center gap-1">
                    <Feather name="cloud-off" color={StatusColors.warning} size={16} />
                    <View
                        style={{
                            backgroundColor: StatusColors.warning,
                            borderRadius: 10,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                        }}
                    >
                        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
                            {pendingCount}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}