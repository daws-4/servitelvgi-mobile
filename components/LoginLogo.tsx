import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

/**
 * Logo y encabezado para la pantalla de login
 */
export function LoginLogo() {
    return (
        <View style={styles.container}>
            {/* Icono con rotación sutil */}
            <View style={styles.iconContainer}>
                <Ionicons
                    name="construct"
                    size={48}
                    color="#FFFFFF"
                    style={styles.icon}
                />
            </View>

            {/* Título principal */}
            <Text style={styles.logoText}>SERVITEL</Text>

            {/* Subtítulo */}
            <Text style={styles.subtitle}>Gestión de Instaladores</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: BrandColors.primary,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        transform: [{ rotate: '3deg' }],
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    icon: {
        transform: [{ rotate: '-3deg' }],
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: BrandColors.dark,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b', // slate-500
        fontWeight: '500',
        marginTop: 4,
    },
});
