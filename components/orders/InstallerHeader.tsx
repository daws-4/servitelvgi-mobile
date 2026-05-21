import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { useAuth } from '@/app/contexts/AuthContext';
import { BrandColors } from '@/constants/colors';
import crewService from '@/services/api/crews';
import installerService from '@/services/api/installers';
import type { Crew } from '@/types/Crew';
import type { Installer } from '@/types/Installer';

interface InstallerHeaderProps {
  onSearch?: (text: string) => void;
}

export default function InstallerHeader({ onSearch }: InstallerHeaderProps) {
  const { installer } = useAuth();

  // Crew state - fetched separately if needed
  const [fetchedCrew, setFetchedCrew] = useState<Crew | null>(null);

  // Installer state - fetched to get complete profile data
  const [fetchedInstaller, setFetchedInstaller] = useState<Installer | null>(null);

  // Use fetched installer if available, otherwise use auth installer
  const currentInstaller = fetchedInstaller || installer;

  // Get installer's full name
  const fullName = currentInstaller
    ? `${currentInstaller.name} ${currentInstaller.surname}`
    : 'Técnico Instalador';

  // Extract crew data
  const installerAny = currentInstaller as any;
  const crewId: string | undefined = installerAny?.crew?._id || installerAny?.currentCrew;

  // Fetch complete installer profile if profilePicture is missing
  useEffect(() => {
    const fetchInstallerData = async () => {
      if (installer?._id && !installer?.profilePicture) {
        try {
          const installerData = await installerService.getInstallerById(installer._id);
          setFetchedInstaller(installerData);
        } catch (error) {
          console.error('❌ [InstallerHeader] Error fetching installer:', error);
        }
      }
    };

    fetchInstallerData();
  }, [installer?._id, installer?.profilePicture]);

  // Fetch crew data if we have an ID but no number
  useEffect(() => {
    const fetchCrewData = async () => {
      // Check if we have a crew ID but no crew number
      const hasCrewNumber = installerAny?.crew?.number;

      if (crewId && !hasCrewNumber) {
        try {
          const crewData = await crewService.getCrewById(crewId);
          setFetchedCrew(crewData);
        } catch (error) {
          console.error('❌ [InstallerHeader] Error fetching crew:', error);
        }
      }
    };

    fetchCrewData();
  }, [crewId, installerAny]);

  // Try to get crew number from various sources
  const crewNumber: number | undefined = installerAny?.crew?.number || fetchedCrew?.number;

  // Get role/crew info
  const roleText = crewNumber
    ? `Técnico • Cuadrilla ${crewNumber}`
    : 'Técnico Instalador • ENLARED';

  return (
    <LinearGradient
      colors={[BrandColors.secondary, BrandColors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="relative overflow-hidden rounded-b-[56px] px-8 pt-10"
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

      {/* Avatar Button - Positioned absolutely */}
      <View className="absolute right-8 top-10 z-20">
        <TouchableOpacity
          className="h-12 w-12 items-center justify-center overflow-hidden rounded-full"
          style={{
            backgroundColor: 'white',
            padding: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
          {currentInstaller?.profilePicture ? (
            <Image
              source={{ uri: currentInstaller.profilePicture }}
              className="h-full w-full rounded-full"
              style={{
                width: 42,
                height: 42,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              className="h-full w-full items-center justify-center rounded-full"
              style={{
                backgroundColor: '#f3f4f6',
                width: 42,
                height: 42,
              }}>
              <FontAwesome name="user-md" size={18} color="#9ca3af" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Header Content - Centered */}
      <View className="relative z-10 mb-5 items-center px-4">
        <Text
          className="mb-1 text-center text-2xl font-black text-white"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ letterSpacing: -0.5 }}>
          {fullName}
        </Text>
        <Text
          className="text-[10px] font-bold uppercase"
          style={{
            color: 'rgba(219, 234, 254, 0.7)',
            letterSpacing: 2,
          }}>
          {roleText}
        </Text>
      </View>
    </LinearGradient>
  );
}
