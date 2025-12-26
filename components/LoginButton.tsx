import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

interface LoginButtonProps {
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    text?: string;
}

/**
 * Botón principal para login con estados de carga
 */
export function LoginButton({
    onPress,
    loading = false,
    disabled = false,
    text = 'Iniciar Sesión'
}: LoginButtonProps) {
    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isDisabled && styles.buttonDisabled
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.85}
        >
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.buttonText}>Verificando...</Text>
                </View>
            ) : (
                <View style={styles.contentContainer}>
                    <Text style={styles.buttonText}>{text}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: BrandColors.primary,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 24,
        marginTop: 16,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    buttonDisabled: {
        backgroundColor: BrandColors.neutral,
        shadowOpacity: 0,
        elevation: 0,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
