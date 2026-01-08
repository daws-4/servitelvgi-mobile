import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/app/contexts/AuthContext';
import { useInstaller } from '@/hooks/useInstaller';
import { BrandColors } from '@/constants/colors';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsCard from '@/components/profile/StatsCard';
import SettingsSection from '@/components/profile/SettingsSection';
import SettingsMenuItem from '@/components/profile/SettingsMenuItem';
import InstallerInfoCard from '@/components/profile/InstallerInfoCard';
import ProfilePhotoEditor from '@/components/profile/ProfilePhotoEditor';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';

/**
 * Profile screen - Display installer profile, statistics, and settings
 */
export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const { installer: authInstaller, logout } = useAuth();
    const router = useRouter();

    // Use useInstaller to fetch full profile data (including profilePicture) which might be missing in auth/me
    const {
        installer: fetchedInstaller,
        loading: loadingInstaller,
        refetch: refetchInstaller
    } = useInstaller(authInstaller?._id || '');

    // Merge installers, prioritizing fetched data
    // fetchedInstaller has more complete data structure (like crewDetails)
    // authInstaller has the session state
    const installer = fetchedInstaller || authInstaller;

    // Modal states
    const [showPhotoEditor, setShowPhotoEditor] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    // Get installer's full name
    const fullName = installer ? `${installer.name} ${installer.surname}` : 'Usuario';

    // Get role/crew info
    // Handle both simpler Auth structure and populated Installer structure
    const installerAny = installer as any;
    const crewName = installerAny?.crewDetails?.name || installerAny?.crew?.name || installerAny?.crew || '';

    const roleText = crewName
        ? `Técnico • ${crewName}`
        : 'Técnico Instalador • ENLARED';

    // Get status from onDuty field (now a string: 'active' | 'inactive' | 'onDuty')
    const status = installer?.onDuty || 'inactive';

    // Handle photo update success
    const handlePhotoSuccess = () => {
        refetchInstaller();
    };

    // Handle profile update success
    const handleProfileSuccess = () => {
        refetchInstaller();
    };

    // Stats state
    const [stats, setStats] = useState({
        newToday: 0,
        totalPending: 0,
        completedToday: 0
    });

    // Fetch stats
    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                // Determine crew ID from various possible header fields
                const crewId =
                    installerAny?.crewDetails?._id ||
                    installerAny?.currentCrew ||
                    installerAny?.crew?._id ||
                    installerAny?.crew; // fallback if it's just an ID string

                if (!crewId) return;

                // Import dynamically to avoid circular dependencies if any
                const { getCrewOrders } = require('@/services/api/orders');

                // Fetch all orders for the crew (we filter client-side for now to avoid multiple requests)
                // In a large production app, we should have a specific /stats endpoint
                const response = await getCrewOrders(crewId);

                // Handle paginated response format
                const orders = response?.items || [];

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let newToday = 0;
                let totalPending = 0;
                let completedToday = 0;

                orders.forEach((order: any) => {
                    const createdDate = new Date(order.createdAt);
                    createdDate.setHours(0, 0, 0, 0);

                    // 1. New Orders Today
                    if (createdDate.getTime() === today.getTime()) {
                        newToday++;
                    }

                    // 2. Total Pending (pending, assigned, in_progress)
                    if (['pending', 'assigned', 'in_progress'].includes(order.status)) {
                        totalPending++;
                    }

                    // 3. Completed Orders Today
                    if (order.status === 'completed' && order.completionDate) {
                        const completionDate = new Date(order.completionDate);
                        completionDate.setHours(0, 0, 0, 0);
                        if (completionDate.getTime() === today.getTime()) {
                            completedToday++;
                        }
                    }
                });

                setStats({
                    newToday,
                    totalPending,
                    completedToday
                });

            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        if (installer) {
            fetchStats();
        }
    }, [installer]);

    // console.log('🖼️ [ProfileScreen] Rendering with picture:', installer?.profilePicture);

    return (
        <View style={styles.container}>
            {/* Profile Header */}
            <View style={{}}>
                <ProfileHeader
                    installerName={fullName}
                    role={roleText}
                    status={status}
                    avatarUri={installer?.profilePicture || undefined}
                    onCameraPress={() => setShowPhotoEditor(true)}
                />
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
                <StatsCard
                    label="Ordenes Nuevas Hoy"
                    value={stats.newToday.toString().padStart(2)}
                    highlighted={stats.newToday > 0}
                />
                <StatsCard
                    label="Ordenes Pendientes"
                    value={stats.totalPending.toString().padStart(2)}
                    highlighted={stats.totalPending > 0}
                />
                <StatsCard
                    label="Ordenes Finalizadas Hoy"
                    value={stats.completedToday.toString().padStart(2)}
                    highlighted={stats.completedToday > 0}
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
                alwaysBounceVertical={true}
            >
                {/* Settings Content */}
                <View style={styles.settingsContent}>
                    {/* Installer Info Card */}
                    <InstallerInfoCard
                        crewName={crewName}
                        email={installer?.email}
                        phone={installer?.phone}
                        username={installer?.username}
                    />

                    {/* Personal Configuration Section */}
                    <SettingsSection title="Configuración Personal">
                        <SettingsMenuItem
                            icon="user"
                            title="Datos Personales"
                            subtitle="Email y teléfono"
                            onPress={() => setShowEditProfile(true)}
                        />
                        <SettingsMenuItem
                            icon="shield"
                            title="Seguridad"
                            subtitle="Cambiar contraseña"
                            onPress={() => setShowChangePassword(true)}
                        />
                        <SettingsMenuItem
                            icon="camera"
                            title="Foto de Perfil"
                            subtitle="Cambiar o eliminar foto"
                            onPress={() => setShowPhotoEditor(true)}
                        />
                    </SettingsSection>

                    {/* Application Section */}
                    <SettingsSection title="Aplicación">
                        <SettingsMenuItem
                            icon="headphones"
                            title="Soporte Técnico"
                            subtitle="Ayuda con la aplicación"
                            onPress={() => console.log('Navigate to support')}
                        />
                    </SettingsSection>

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <FontAwesome name="power-off" size={14} color="#ef4444" />
                        <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </TouchableOpacity>

                    {/* Version Info */}
                    <Text style={styles.version}>SGO VERSION 1.0.4-ST</Text>
                </View>
            </ScrollView>

            {/* Modals */}
            <ProfilePhotoEditor
                visible={showPhotoEditor}
                onClose={() => setShowPhotoEditor(false)}
                installerId={installer?._id || ''}
                currentPhotoUrl={installer?.profilePicture || undefined}
                onSuccess={handlePhotoSuccess}
                onDelete={handlePhotoSuccess}
            />

            <EditProfileModal
                visible={showEditProfile}
                onClose={() => setShowEditProfile(false)}
                installerId={installer?._id || ''}
                currentEmail={installer?.email}
                currentPhone={installer?.phone}
                onSuccess={handleProfileSuccess}
            />

            <ChangePasswordModal
                visible={showChangePassword}
                onClose={() => setShowChangePassword(false)}
                installerId={installer?._id || ''}
                username={installer?.username || ''}
                onSuccess={handleProfileSuccess}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // slate-50
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 24,
        marginTop: -32,
        marginBottom: 24,
    },
    settingsContent: {
        paddingHorizontal: 24,
        paddingBottom: 120, // Fixed padding for tab bar clearance
        gap: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        backgroundColor: '#fef2f2', // red-50
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fee2e2', // red-100
        marginTop: 8,
    },
    logoutText: {
        color: '#ef4444', // red-500
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    version: {
        textAlign: 'center',
        fontSize: 9,
        fontWeight: 'bold',
        color: '#bcabae', // neutral
        opacity: 0.5,
        paddingTop: 16,
        paddingBottom: 24,
    },
});
