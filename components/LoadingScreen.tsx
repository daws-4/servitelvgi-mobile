import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Colors } from '@/constants/colors';

/**
 * Pantalla de carga mostrada mientras AuthContext verifica la sesión
 */
export function LoadingScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Logo de Servitel */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>SERVITEL</Text>
                    <Text style={styles.subtitle}>Instaladores</Text>
                </View>

                {/* Indicador de carga */}
                <ActivityIndicator
                    size="large"
                    color={Colors.primary}
                    style={styles.spinner}
                />

                <Text style={styles.loadingText}>Verificando sesión...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.secondary,
        marginTop: 8,
        fontWeight: '600',
    },
    spinner: {
        marginVertical: 20,
    },
    loadingText: {
        fontSize: 16,
        color: Colors.neutral,
        marginTop: 12,
    },
});
