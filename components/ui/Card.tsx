import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/app/contexts/ThemeColors';

export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
    /**
     * Contenido de la tarjeta
     */
    children: React.ReactNode;

    /**
     * Título opcional de la tarjeta
     */
    title?: string;

    /**
     * Si debe tener sombra elevada
     */
    elevated?: boolean;

    /**
     * Tamaño del padding interno
     */
    padding?: CardPadding;
}

/**
 * Componente de tarjeta base reutilizable
 * 
 * @example
 * ```tsx
 * <Card title="Información" elevated>
 *   <Text>Contenido de la tarjeta</Text>
 * </Card>
 * 
 * <Card padding="small">
 *   <CustomComponent />
 * </Card>
 * ```
 */
export function Card({
    children,
    title,
    elevated = true,
    padding = 'medium',
}: CardProps) {
    const { secondary, text, border, isDark } = useThemeColors();

    const getPadding = () => {
        switch (padding) {
            case 'none':
                return 0;
            case 'small':
                return 12;
            case 'medium':
                return 20;
            case 'large':
                return 32;
            default:
                return 20;
        }
    };

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: secondary,
                    borderColor: border,
                    padding: getPadding(),
                },
                elevated && styles.elevated,
            ]}
        >
            {title && (
                <Text style={[styles.title, { color: text }]}>{title}</Text>
            )}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
    },
    elevated: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});
