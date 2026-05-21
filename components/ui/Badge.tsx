import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { StatusColors } from '@/constants/colors';

export type BadgeStatus =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'active'
  | 'inactive';

export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  /**
   * Estado del badge (define el color)
   */
  status: BadgeStatus;

  /**
   * Texto a mostrar en el badge
   */
  text: string;

  /**
   * Tamaño del badge
   */
  size?: BadgeSize;
}

/**
 * Componente de badge para indicadores de estado
 *
 * @example
 * ```tsx
 * <Badge status="success" text="Completado" />
 * <Badge status="pending" text="Pendiente" size="small" />
 * <Badge status="error" text="Error" size="large" />
 * ```
 */
export function Badge({ status, text, size = 'medium' }: BadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'active':
        return StatusColors.success;
      case 'warning':
      case 'pending':
        return StatusColors.warning;
      case 'error':
        return StatusColors.error;
      case 'info':
        return StatusColors.info;
      case 'inactive':
        return StatusColors.inactive;
      default:
        return StatusColors.info;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          fontSize: 11,
        };
      case 'medium':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: 13,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          fontSize: 14,
        };
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: 13,
        };
    }
  };

  const statusColor = getStatusColor();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${statusColor}20`,
          borderColor: statusColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
      ]}>
      <Text
        style={[
          styles.text,
          {
            color: statusColor,
            fontSize: sizeStyles.fontSize,
          },
        ]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
