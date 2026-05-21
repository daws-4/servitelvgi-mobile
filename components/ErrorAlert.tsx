import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { StatusColors } from '@/constants/colors';

interface ErrorAlertProps {
  message: string;
}

/**
 * Alerta de error para mostrar mensajes de validación
 */
export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={20} color={StatusColors.error} />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: `${StatusColors.error}15`,
    borderLeftWidth: 4,
    borderLeftColor: StatusColors.error,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    color: StatusColors.error,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
