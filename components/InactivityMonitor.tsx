import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useSecurity } from '@/app/contexts/SecurityContext';

/**
 * Componente invisible que monitorea la actividad del usuario
 * Actualiza el timer de inactividad en cada interacción
 *
 * @example
 * ```tsx
 * // En _layout.tsx
 * <SecurityProvider>
 *   <InactivityMonitor />
 *   {children}
 * </SecurityProvider>
 * ```
 */
export function InactivityMonitor({ children }: { children: React.ReactNode }) {
  const { resetActivityTimer } = useSecurity();

  // Crear gesture para detectar toques
  const tapGesture = Gesture.Tap().onStart(() => {
    runOnJS(resetActivityTimer)();
  });

  // También resetear en scroll/pan
  const panGesture = Gesture.Pan().onStart(() => {
    runOnJS(resetActivityTimer)();
  });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
