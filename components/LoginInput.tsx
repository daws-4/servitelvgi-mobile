import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';

import { BrandColors } from '@/constants/colors';

interface LoginInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: boolean;
  isPassword?: boolean;
}

/**
 * Input reutilizable para el formulario de login
 * VERSIÓN SIMPLIFICADA - Sin Views que interfieran con touch events
 */
export function LoginInput({
  label,
  icon,
  error = false,
  isPassword = false,
  ...textInputProps
}: LoginInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label.toUpperCase()}</Text>

      {/* Container absoluto para el icono y botón - NO interfiere con input */}
      <View style={styles.inputContainer}>
        {/* Input de texto - ELEMENTO PRINCIPAL */}
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused, error && styles.inputError]}
          placeholderTextColor="#94a3b8"
          autoFocus={false}
          {...textInputProps}
          secureTextEntry={isPassword && !showPassword}
          blurOnSubmit={false}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />

        {/* Icono - posicionado absolutamente sobre el input */}
        <View style={styles.iconOverlay} pointerEvents="none">
          <Ionicons name={icon} size={20} color={isFocused ? BrandColors.primary : '#cbd5e1'} />
        </View>

        {/* Botón eye - posicionado absolutamente */}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeOverlay}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.6}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingLeft: 48, // Espacio para el icono
    paddingRight: 48, // Espacio para el botón eye (si existe)
    paddingVertical: 16,
    height: 56,
    fontSize: 16,
    color: BrandColors.dark,
  },
  inputFocused: {
    borderColor: BrandColors.primary,
    backgroundColor: '#ffffff',
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    borderColor: '#f44336',
  },
  iconOverlay: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeOverlay: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 8,
  },
});
