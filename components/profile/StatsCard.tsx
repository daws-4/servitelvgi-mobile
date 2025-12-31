import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandColors } from '@/constants/colors';

export interface StatsCardProps {
    /**
     * Label for the statistic
     */
    label: string;

    /**
     * Value to display
     */
    value: string | number;

    /**
     * Use tea green background for emphasis
     */
    highlighted?: boolean;
}

/**
 * Compact card for displaying a single statistic
 * 
 * @example
 * ```tsx
 * <StatsCard label="Órdenes Hoy" value="08" />
 * <StatsCard label="Efectividad" value="98%" highlighted />
 * ```
 */
export default function StatsCard({ label, value, highlighted = false }: StatsCardProps) {
    return (
        <View
            style={[
                styles.card,
                highlighted ? styles.highlightedCard : styles.normalCard,
            ]}
        >
            <Text style={[styles.label, highlighted && styles.highlightedLabel]}>
                {label}
            </Text>
            <Text style={[styles.value, highlighted && styles.highlightedValue]}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    normalCard: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#f1f5f9', // slate-100
    },
    highlightedCard: {
        backgroundColor: BrandColors.background,
        borderWidth: 1,
        borderColor: BrandColors.background,
    },
    label: {
        fontSize: 9,
        fontWeight: '900',
        color: '#94a3b8', // slate-400
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    highlightedLabel: {
        color: BrandColors.secondary,
    },
    value: {
        fontSize: 20,
        fontWeight: '900',
        color: BrandColors.primary,
    },
    highlightedValue: {
        color: BrandColors.secondary,
    },
});
