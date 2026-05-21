import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

import { useOffline } from '@/app/contexts/OfflineContext';
import { StatusColors } from '@/constants/colors';

/**
 * Banner que aparece en la parte superior cuando no hay conexión
 *
 * @example
 * ```tsx
 * <OfflineBanner />
 * ```
 */
export function OfflineBanner() {
  const { isConnected } = useOffline();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isConnected === false) {
      // Mostrar banner con animación
      setIsVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
    } else if (isConnected === true && isVisible) {
      // Ocultar banner con animación
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [isConnected]);

  if (!isVisible && isConnected !== false) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
      <Text style={styles.text}>Sin conexión a internet</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: StatusColors.warning,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
