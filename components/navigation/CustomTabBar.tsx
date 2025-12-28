import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/app/contexts/ThemeColors';
import { BrandColors } from '@/constants/colors';

/**
 * Custom Tab Bar Component
 * Adapted from BottomBar.tsx with glassmorphism design
 */
export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const colors = useThemeColors();

    // Map route names to icons
    const getTabIcon = (routeName: string): keyof typeof Feather.glyphMap => {
        switch (routeName) {
            case 'orders':
                return 'list';
            case 'inventory':
                return 'package';
            case 'profile':
                return 'user';
            case 'map':
                return 'map';
            default:
                return 'circle';
        }
    };

    // Get tab label
    const getTabLabel = (routeName: string): string => {
        switch (routeName) {
            case 'orders':
                return 'Órdenes';
            case 'inventory':
                return 'Inventario';
            case 'profile':
                return 'Perfil';
            case 'map':
                return 'Mapa';
            default:
                return routeName;
        }
    };

    return (
        <View className="p-4 flex-row items-center justify-center bg-background">
            <View
                style={{
                    elevation: 10,
                    shadowColor: 'black',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                }}
                className="rounded-full border border-white/20"
            >
                <BlurView
                    tint="dark"
                    intensity={10}
                    className="flex-row py-1.5 px-1 overflow-hidden rounded-full items-center justify-between bg-black/50"
                    style={{ width: Math.min(state.routes.length * 75, 320) }}
                >
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

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

                        const onLongPress = () => {
                            navigation.emit({
                                type: 'tabLongPress',
                                target: route.key,
                            });
                        };

                        return (
                            <TabBarItem
                                key={route.key}
                                icon={getTabIcon(route.name)}
                                title={getTabLabel(route.name)}
                                isActive={isFocused}
                                onPress={onPress}
                                onLongPress={onLongPress}
                                badge={route.name === 'orders' ? 0 : undefined} // TODO: Connect to real badge data
                            />
                        );
                    })}
                </BlurView>
            </View>
        </View>
    );
}

/**
 * Individual Tab Bar Item
 */
interface TabBarItemProps {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    isActive: boolean;
    onPress: () => void;
    onLongPress: () => void;
    badge?: number;
}

const TabBarItem = ({ icon, title, isActive, onPress, onLongPress, badge }: TabBarItemProps) => {
    const colors = useThemeColors();
    const widthAnim = useRef(new Animated.Value(isActive ? 100 : 40)).current;
    const textOpacityAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(widthAnim, {
                toValue: isActive ? 100 : 40,
                duration: 400,
                easing: Easing.bezier(0.1, 1, 0.94, 1),
                useNativeDriver: false,
            }),
            Animated.timing(textOpacityAnim, {
                toValue: isActive ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isActive, widthAnim, textOpacityAnim]);

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            className={`flex-row items-center rounded-full transition-all duration-300 ${isActive ? 'bg-black/40' : 'bg-black/0'} mx-[2px] overflow-hidden`}
        >
            <Animated.View className="items-center flex-row" style={{ width: widthAnim }}>
                <View className="w-[40px] h-[40px] items-center justify-center">
                    <Feather name={icon} size={15} color={isActive ? BrandColors.primary : 'white'} />
                    {/* Badge indicator */}
                    {badge !== undefined && badge > 0 && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: BrandColors.primary,
                                borderRadius: 10,
                                minWidth: 16,
                                height: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 4,
                            }}
                        >
                            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
                                {badge > 99 ? '99+' : badge}
                            </Text>
                        </View>
                    )}
                </View>
                <Animated.View
                    style={{
                        opacity: textOpacityAnim,
                        transform: [
                            {
                                translateX: textOpacityAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0],
                                }),
                            },
                        ],
                    }}
                >
                    <Text
                        className="text-center items-center justify-center whitespace-nowrap flex-shrink-0 text-white text-xs"
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};
