import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/app/contexts/AuthContext';
import { BrandColors } from '@/constants/colors';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsCard from '@/components/profile/StatsCard';
import SettingsSection from '@/components/profile/SettingsSection';
import SettingsMenuItem from '@/components/profile/SettingsMenuItem';

/**
 * Profile screen - Display installer profile, statistics, and settings
 */
export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const { installer, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    // Get installer's full name
    const fullName = installer ? `${installer.name} ${installer.surname}` : 'Usuario';

    // Get role/crew info
    const roleText = installer?.crew
        ? `Técnico • ${installer.crew.name}`
        : 'Técnico Instalador • Servitel';

    // Get status
    const status = installer?.onDuty ? 'onduty' : installer?.status === 'active' ? 'active' : 'inactive';

    return (
        <View style={styles.container}>
            {/* Profile Header */}
            <View style={{  }}>
                <ProfileHeader
                    installerName={fullName}
                    role={roleText}
                    status={status}
                />
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
                <StatsCard label="Órdenes Hoy" value="08" />
                <StatsCard label="Efectividad" value="98%" highlighted />
                <StatsCard label="Puntos" value="1.2k" />
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
                    {/* Personal Configuration Section */}
                    <SettingsSection title="Configuración Personal">
                        <SettingsMenuItem
                            icon="user"
                            title="Datos Personales"
                            subtitle="Nombre, teléfono y correo"
                            onPress={() => console.log('Navigate to personal data')}
                        />
                        <SettingsMenuItem
                            icon="shield"
                            title="Seguridad"
                            subtitle="Cambiar contraseña y PIN"
                            onPress={() => console.log('Navigate to security')}
                        />
                    </SettingsSection>

                    {/* Application Section */}
                    <SettingsSection title="Aplicación">
                        <SettingsMenuItem
                            icon="bell"
                            title="Notificaciones"
                            subtitle="Alertas de nuevas órdenes"
                            showToggle
                            toggleValue={true}
                            onToggleChange={(val) => console.log('Toggle notifications:', val)}
                        />
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
        marginBottom: 32,
    },
    settingsContent: {
        paddingHorizontal: 24,
        paddingBottom: 120, // Fixed padding for tab bar clearance
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
        marginTop: 24,
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
