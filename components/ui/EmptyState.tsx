import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Button } from './Button';

import { useThemeColors } from '@/app/contexts/ThemeColors';

export interface EmptyStateProps {
  /**
   * Nombre del icono de Ionicons
   */
  icon: keyof typeof Ionicons.glyphMap;

  /**
   * Título del estado vacío
   */
  title: string;

  /**
   * Mensaje descriptivo
   */
  message: string;

  /**
   * Texto del botón de acción (opcional)
   */
  actionText?: string;

  /**
   * Callback cuando se presiona el botón de acción
   */
  onActionPress?: () => void;
}

/**
 * Componente de estado vacío para listas sin datos
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="folder-open-outline"
 *   title="No hay órdenes"
 *   message="No se encontraron órdenes para mostrar"
 *   actionText="Crear orden"
 *   onActionPress={handleCreateOrder}
 * />
 * ```
 */
export function EmptyState({ icon, title, message, actionText, onActionPress }: EmptyStateProps) {
  const { text, isDark } = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={80} color={isDark ? '#555' : '#ccc'} />
      </View>

      <Text style={[styles.title, { color: text }]}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionText && onActionPress && (
        <View style={styles.actionContainer}>
          <Button variant="primary" onPress={onActionPress}>
            {actionText}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionContainer: {
    marginTop: 16,
    width: '100%',
  },
});
