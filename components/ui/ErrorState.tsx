import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusColors } from '@/constants/colors';
import { useThemeColors } from '@/app/contexts/ThemeColors';
import { Button } from './Button';

export interface ErrorStateProps {
    /**
     * Título del error
     */
    title: string;

    /**
     * Mensaje de error descriptivo
     */
    message: string;

    /**
     * Callback para reintentar (opcional)
     */
    onRetry?: () => void;

    /**
     * Texto del botón de reintentar
     */
    retryText?: string;
}

/**
 * Componente de estado de error con opción de reintentar
 * 
 * @example
 * ```tsx
 * <ErrorState
 *   title="Error al cargar"
 *   message="No se pudieron cargar los datos. Verifica tu conexión."
 *   onRetry={handleRetry}
 * />
 * ```
 */
export function ErrorState({
    title,
    message,
    onRetry,
    retryText = 'Reintentar',
}: ErrorStateProps) {
    const { text } = useThemeColors();

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name="alert-circle"
                    size={80}
                    color={StatusColors.error}
                />
            </View>

            <Text style={[styles.title, { color: text }]}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {onRetry && (
                <View style={styles.actionContainer}>
                    <Button variant="primary" onPress={onRetry} icon="refresh">
                        {retryText}
                    </Button>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    actionContainer: {
        marginTop: 16,
        width: '100%',
    },
});
