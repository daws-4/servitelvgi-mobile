import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

export interface SettingsMenuItemProps {
    /**
     * FontAwesome icon name
     */
    icon: string;

    /**
     * Menu item title
     */
    title: string;

    /**
     * Description text
     */
    subtitle: string;

    /**
     * Press callback
     */
    onPress?: () => void;

    /**
     * Show chevron on the right
     */
    showChevron?: boolean;

    /**
     * Show toggle switch instead of chevron
     */
    showToggle?: boolean;

    /**
     * Toggle state (if showToggle is true)
     */
    toggleValue?: boolean;

    /**
     * Toggle change callback
     */
    onToggleChange?: (value: boolean) => void;
}

/**
 * Menu item for settings options with icon, title, subtitle, and action
 * 
 * @example
 * ```tsx
 * <SettingsMenuItem
 *   icon="user-pen"
 *   title="Datos Personales"
 *   subtitle="Nombre, teléfono y correo"
 *   onPress={() => console.log('Navigate to personal data')}
 * />
 * 
 * <SettingsMenuItem
 *   icon="bell"
 *   title="Notificaciones"
 *   subtitle="Alertas de nuevas órdenes"
 *   showToggle
 *   toggleValue={true}
 *   onToggleChange={(val) => console.log('Toggle:', val)}
 * />
 * ```
 */
export default function SettingsMenuItem({
    icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    showToggle = false,
    toggleValue = false,
    onToggleChange,
}: SettingsMenuItemProps) {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleToggle = () => {
        if (onToggleChange) {
            onToggleChange(!toggleValue);
        }
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={showToggle ? handleToggle : onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                <View style={styles.leftSection}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name={icon as any} size={16} color={BrandColors.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </View>
                </View>

                {/* Right Action */}
                {showToggle ? (
                    <View style={[styles.toggle, toggleValue && styles.toggleActive]}>
                        <View
                            style={[
                                styles.toggleThumb,
                                toggleValue && styles.toggleThumbActive,
                            ]}
                        />
                    </View>
                ) : showChevron ? (
                    <FontAwesome name="chevron-right" size={12} color="#cbd5e1" />
                ) : null}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f8fafc', // slate-50
        borderRadius: 16,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#f1f5f9', // slate-100
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: BrandColors.dark,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 10,
        color: '#94a3b8', // slate-400
        fontWeight: '500',
    },
    toggle: {
        width: 32,
        height: 16,
        borderRadius: 8,
        backgroundColor: BrandColors.background,
        justifyContent: 'center',
        position: 'relative',
    },
    toggleActive: {
        backgroundColor: BrandColors.background,
    },
    toggleThumb: {
        position: 'absolute',
        left: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleThumbActive: {
        right: 2,
        left: 'auto',
        backgroundColor: BrandColors.secondary,
    },
});
