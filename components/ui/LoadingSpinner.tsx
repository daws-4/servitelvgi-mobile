import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { BrandColors } from '@/constants/colors';

export type SpinnerSize = 'small' | 'medium' | 'large';

export interface LoadingSpinnerProps {
    /**
     * Tamaño del spinner
     */
    size?: SpinnerSize;

    /**
     * Color del spinner
     */
    color?: string;

    /**
     * Texto opcional debajo del spinner
     */
    text?: string;
}

/**
 * Componente de spinner de carga reutilizable
 * 
 * @example
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner size="large" text="Cargando datos..." />
 * <LoadingSpinner size="small" color="#ff0000" />
 * ```
 */
export function LoadingSpinner({
    size = 'medium',
    color = BrandColors.primary,
    text,
}: LoadingSpinnerProps) {
    const getActivityIndicatorSize = (): 'small' | 'large' => {
        return size === 'large' ? 'large' : 'small';
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator
                size={getActivityIndicatorSize()}
                color={color}
                style={styles.spinner}
            />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        marginVertical: 12,
    },
    text: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
});
