import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, StatusColors } from '@/constants/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps {
    /**
     * Variante del botón (define el estilo visual)
     */
    variant?: ButtonVariant;

    /**
     * Función callback cuando se presiona el botón
     */
    onPress: () => void;

    /**
     * Estado de carga - muestra un spinner
     */
    loading?: boolean;

    /**
     * Estado deshabilitado
     */
    disabled?: boolean;

    /**
     * Contenido del botón (texto o componentes)
     */
    children: React.ReactNode;

    /**
     * Icono opcional (componente de Ionicons)
     */
    icon?: keyof typeof Ionicons.glyphMap;

    /**
     * Tamaño del icono
     */
    iconSize?: number;
}

/**
 * Componente de botón reutilizable con variantes y estados
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onPress={handleSubmit}>
 *   Enviar
 * </Button>
 * 
 * <Button variant="danger" icon="trash" loading={isDeleting}>
 *   Eliminar
 * </Button>
 * ```
 */
export function Button({
    variant = 'primary',
    onPress,
    loading = false,
    disabled = false,
    children,
    icon,
    iconSize = 16,
}: ButtonProps) {
    const isDisabled = loading || disabled;

    // Determinar colores según la variante
    const getBackgroundColor = () => {
        if (isDisabled) return '#9e9e9e';

        switch (variant) {
            case 'primary':
                return BrandColors.primary;
            case 'secondary':
                return BrandColors.secondary;
            case 'danger':
                return StatusColors.error;
            default:
                return BrandColors.primary;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                isDisabled && styles.buttonDisabled
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.85}
        >
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.buttonText}>Cargando...</Text>
                </View>
            ) : (
                <View style={styles.contentContainer}>
                    {icon && (
                        <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
                    )}
                    <Text style={styles.buttonText}>{children}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    buttonDisabled: {
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
