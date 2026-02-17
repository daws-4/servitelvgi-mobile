import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';
import EnlaredLogo from '@/public/logo_bgless.png';

/**
 * Logo y encabezado para la pantalla de login
 */
export function LoginLogo() {
    return (
        <View style={styles.container}>
            {/* Icono con rotación sutil */}
            <View style={styles.iconContainer}>
                {/* <EnlaredLogo width={142} height={142} fill="#FFFFFF" /> */}
                <Image
                    source={EnlaredLogo}
                    style={{ width: 142, height: 142 }}
                    resizeMode="contain"
                />
            </View>

            {/* Título principal */}
            <Text style={styles.logoText}>ENLARED</Text>

            {/* Subtítulo */}
            <Text style={styles.subtitle}>Gestión de Instaladores</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 20, // Reduced from 40
    },
    iconContainer: {
        width: 142,
        height: 142,
        // backgroundColor: BrandColors.primary,
        // borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0, // Reduced from 16/1
        // transform: [{ rotate: '3deg' }],
        // shadowColor: BrandColors.primary,
        // shadowOffset: { width: 0, height: 8 },
        // shadowOpacity: 0.2,
        // shadowRadius: 16,
        // elevation: 8,
    },
    icon: {
        // transform: [{ rotate: '-3deg' }],
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: BrandColors.dark,
        letterSpacing: 1,
        marginBottom: -5, // Negative margin to pull subtitle closer
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b', // slate-500
        fontWeight: '500',
        marginTop: 4,
    },
});
