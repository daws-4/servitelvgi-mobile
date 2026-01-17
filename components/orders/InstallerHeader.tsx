import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import { useAuth } from '@/app/contexts/AuthContext';
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
    const fullName = currentInstaller ? `${currentInstaller.name} ${currentInstaller.surname}` : 'Técnico Instalador';

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
            className="pt-10 px-8 rounded-b-[56px] relative overflow-hidden"
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
            <View className="absolute top-10 right-8 z-20">
                <TouchableOpacity
                    className="w-12 h-12 rounded-full justify-center items-center overflow-hidden"
                    style={{
                        backgroundColor: 'white',
                        padding: 3,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    {currentInstaller?.profilePicture ? (
                        <Image
                            source={{ uri: currentInstaller.profilePicture }}
                            className="w-full h-full rounded-full"
                            style={{
                                width: 42,
                                height: 42,
                            }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            className="w-full h-full rounded-full justify-center items-center"
                            style={{
                                backgroundColor: '#f3f4f6',
                                width: 42,
                                height: 42,
                            }}
                        >
                            <FontAwesome name="user-md" size={18} color="#9ca3af" />
                        </View>
                    )}
                </TouchableOpacity>
            </View>

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
        </LinearGradient>
    );
}
