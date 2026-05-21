import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BrandColors } from '@/constants/colors';

interface LoginCardProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * Tarjeta contenedora para el formulario de login
 */
export function LoginCard({ title = 'Acceso al Sistema', children }: LoginCardProps) {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate-100
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BrandColors.dark,
    textAlign: 'center',
    marginBottom: 24,
  },
});
