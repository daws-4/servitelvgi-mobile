import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SlideUp from './SlideUp';
import ThemeToggle from './ThemeToggle';

import { useOffline } from '@/app/contexts/OfflineContext';
import useThemeColors from '@/app/contexts/ThemeColors';
import { BrandColors, StatusColors } from '@/constants/colors';
import crewService from '@/services/api/crews';
import type { Crew } from '@/types/Crew';

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  hasAvatar?: boolean;
  showInstallerInfo?: boolean; // Show installer name and crew
  showLogo?: boolean; // Show ENLARED logo
}

export default function Header({
  showBackButton = false,
  title = '',
  hasAvatar = false,
  showInstallerInfo = false,
  showLogo = false,
}: HeaderProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showSlideUp, setShowSlideUp] = useState(false);
  const { installer } = require('@/app/contexts/AuthContext').useAuth();

  // Crew state - fetched separately if needed
  const [fetchedCrew, setFetchedCrew] = useState<Crew | null>(null);

  // Extract crew data
  const installerAny = installer as any;
  const crewId: string | undefined = installerAny?.crew?._id || installerAny?.currentCrew;

  // Fetch crew data if we have an ID but no number
  useEffect(() => {
    const fetchCrewData = async () => {
      // Check if we have a crew ID but no crew number
      const hasCrewNumber = installerAny?.crew?.number;

      if (crewId && !hasCrewNumber && showInstallerInfo) {
        try {
          const crewData = await crewService.getCrewById(crewId);
          setFetchedCrew(crewData);
        } catch (error) {
          console.error('❌ [Header] Error fetching crew:', error);
        }
      }
    };

    fetchCrewData();
  }, [crewId, installerAny, showInstallerInfo]);

  // Try to get crew number from various sources
  const crewNumber: number | undefined = installerAny?.crew?.number || fetchedCrew?.number;

  return (
    <>
      <View
        className=" absolute left-0 right-0 top-0 z-50 flex-row items-center justify-between bg-background px-5 py-6"
        style={{ paddingTop: insets.top + 10 }}>
        <View className="flex-1 flex-row items-center">
          {showBackButton && (
            <Pressable
              onPress={() => router.back()}
              className="mr-3 p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="arrow-left" color={colors.icon} size={24} />
            </Pressable>
          )}

          {/* ENLARED Logo */}
          {showLogo && (
            <View className="mr-3">
              <Text style={{ color: BrandColors.primary }} className="text-2xl font-bold">
                ENLARED
              </Text>
            </View>
          )}

          {hasAvatar && (
            <Pressable
              onPress={() => setShowSlideUp(true)}
              className="mr-3 h-10 w-10 overflow-hidden rounded-full"
              style={{
                borderWidth: installer?.profilePicture ? 2 : 0,
                borderColor: installer?.profilePicture ? BrandColors.primary : 'transparent',
              }}>
              <Image
                source={
                  installer?.profilePicture
                    ? { uri: installer.profilePicture }
                    : require('@/assets/img/thomino.jpg')
                }
                className="h-full w-full"
                style={{ resizeMode: 'cover' }}
              />
            </Pressable>
          )}

          {/* Installer Info */}
          {showInstallerInfo && installer && (
            <View className="flex-1">
              <Text className="text-base font-bold text-text">
                {installer.name} {installer.surname}
              </Text>
              {crewNumber && (
                <Text className="text-xs text-text opacity-50">Cuadrilla {crewNumber}</Text>
              )}
            </View>
          )}

          {title && !showInstallerInfo && (
            <Text className="text-2xl font-bold text-text">{title}</Text>
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
          <Text style={{ color: colors.text, fontSize: 12 }}>Sincronizando...</Text>
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
            }}>
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
              {pendingCount}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
