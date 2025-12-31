import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandColors } from '@/constants/colors';

export interface SettingsSectionProps {
    /**
     * Section title
     */
    title: string;

    /**
     * Menu items to display in this section
     */
    children: React.ReactNode;
}

/**
 * Section container with title for grouping settings menu items
 * 
 * @example
 * ```tsx
 * <SettingsSection title="Configuración Personal">
 *   <SettingsMenuItem ... />
 *   <SettingsMenuItem ... />
 * </SettingsSection>
 * ```
 */
export default function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <View style={styles.section}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    title: {
        fontSize: 10,
        fontWeight: '900',
        color: BrandColors.neutral,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 16,
        marginLeft: 8,
    },
    content: {
        gap: 8,
    },
});
