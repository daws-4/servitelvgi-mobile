import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export interface ProfileStatusBadgeProps {
    /**
     * Current status of the installer
     */
    status: 'active' | 'onduty' | 'inactive';

    /**
     * Display text for the status
     */
    statusText: string;
}

/**
 * Status indicator badge with animated pulse effect and glassmorphism
 * 
 * @example
 * ```tsx
 * <ProfileStatusBadge status="onduty" statusText="En Servicio" />
 * ```
 */
export default function ProfileStatusBadge({ status, statusText }: ProfileStatusBadgeProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (status === 'onduty' || status === 'active') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.3,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [status, pulseAnim]);

    const getIndicatorColor = () => {
        switch (status) {
            case 'onduty':
            case 'active':
                return '#4ade80'; // green-400
            case 'inactive':
                return '#94a3b8'; // slate-400
            default:
                return '#4ade80';
        }
    };

    return (
        <View style={styles.badge}>
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        backgroundColor: getIndicatorColor(),
                        transform: [{ scale: status === 'onduty' || status === 'active' ? pulseAnim : 1 }],
                    },
                ]}
            />
            <Text style={styles.text}>{statusText}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    text: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
