import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '@/constants/colors';

// Mapeo preciso de íconos según tabs.html
// Inicio: fa-house
// Stock: fa-boxes-stacked
// Perfil: fa-circle-user
const ICONS: Record<string, keyof typeof FontAwesome.glyphMap> = {
    orders: 'home',
    'orders/index': 'home', // Handle index routes
    inventory: 'dropbox',
    'inventory/index': 'dropbox', // Handle index routes
    profile: 'user-circle',
    'profile/index': 'user-circle', // Handle index routes
    map: 'map',
    'map/index': 'map', // Handle index routes
};

// Fallback labels (should use options.tabBarLabel instead)
const LABELS: Record<string, string> = {
    orders: 'Inicio',
    'orders/index': 'Inicio',
    inventory: 'Stock',
    'inventory/index': 'Stock',
    profile: 'Perfil',
    'profile/index': 'Perfil',
    map: 'Mapa',
    'map/index': 'Mapa',
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    console.log('🎯 CustomTabBar RENDERED - This component is being used!');
    console.log('📋 Total routes received:', state.routes.length);
    const insets = useSafeAreaInsets();

    // Filter routes (in case we need to hide tabs in the future)
    const filteredRoutes = state.routes.filter((route) => {
        const { options } = descriptors[route.key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyOptions = options as any;

        const href = anyOptions?.href;
        const tabBarButton = anyOptions?.tabBarButton;

        console.log(`🔍 Filtering "${route.name}":`, { href, hasTabBarButton: !!tabBarButton });

        // Hide if href is explicitly null
        if (href === null) {
            console.log(`❌ HIDING "${route.name}" - href is null`);
            return false;
        }

        // Hide if tabBarButton returns null
        if (typeof tabBarButton === 'function') {
            try {
                const result = tabBarButton({});
                if (result === null) {
                    console.log(`❌ HIDING "${route.name}" - tabBarButton returns null`);
                    return false;
                }
            } catch (e) {
                // Ignore errors
            }
        }

        console.log(`✅ SHOWING "${route.name}"`);
        return true;
    });

    console.log('✅ CustomTabBar - Filtered tabs:', filteredRoutes.map(r => r.name).join(', '));
    console.log('📊 Total filtered routes:', filteredRoutes.length);

    return (
        <View pointerEvents="box-none" style={[styles.container, { height: 64, paddingBottom: Math.max(insets.bottom, 16) }]}>
            {filteredRoutes
                .map((route) => {
                    const { options } = descriptors[route.key];
                    // Check if this route is the currently focused one
                    const isFocused = state.routes[state.index].key === route.key;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    // Get icon from the mapping or default to 'circle'
                    const iconName = ICONS[route.name] || 'circle';

                    // CRITICAL FIX: Get label from options instead of hardcoded LABELS
                    // Try multiple sources: tabBarLabel, title, or fallback to route name
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const anyOptions = options as any;
                    const tabBarLabel = anyOptions?.tabBarLabel;
                    const title = anyOptions?.title;

                    // Fallback to LABELS mapping if options are not set
                    const label = tabBarLabel || title || LABELS[route.name] || route.name;

                    console.log(`🏷️ Route "${route.name}":`, {
                        tabBarLabel,
                        title,
                        finalLabel: label,
                        hasOptions: !!options,
                        allOptions: Object.keys(anyOptions || {})
                    });

                    // Casting options to any because tabBarTestID is not in the default types but is used
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const optionsWithTestID = options as any;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"

                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={optionsWithTestID.tabBarTestID}
                            onPress={onPress}
                            style={styles.tabButton}
                        >
                            <View style={styles.iconContainer}>
                                <FontAwesome
                                    name={iconName}
                                    size={20}
                                    color={isFocused ? BrandColors.primary : '#cbd5e1'} // slate-300
                                />
                            </View>
                            <Text style={[
                                styles.label,
                                { color: isFocused ? BrandColors.primary : '#94a3b8' } // slate-400
                            ]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 64,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9', // slate-100
        paddingTop: 16,
        paddingHorizontal: 16,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 5,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 4,
    },
    iconContainer: {
        marginBottom: 2,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});
