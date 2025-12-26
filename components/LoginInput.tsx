import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '@/constants/colors';

interface LoginInputProps extends TextInputProps {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    error?: boolean;
    isPassword?: boolean;
}

/**
 * Input reutilizable para el formulario de login
 * con icono, label y opción de mostrar/ocultar contraseña
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

            {/* Input con icono */}
            <View style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
                error && styles.inputWrapperError
            ]}>
                {/* Icono izquierdo */}
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? BrandColors.primary : '#cbd5e1'} // slate-300
                    />
                </View>

                {/* Input de texto */}
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#94a3b8" // slate-400
                    {...textInputProps}
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={(e) => {
                        setIsFocused(true);
                        textInputProps.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        textInputProps.onBlur?.(e);
                    }}
                />

                {/* Botón toggle password (solo si isPassword) */}
                {isPassword && (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.6}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color="#94a3b8"
                        />
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
        color: '#94a3b8', // slate-400
        letterSpacing: 1.2,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc', // slate-50
        borderWidth: 1,
        borderColor: '#e2e8f0', // slate-200
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputWrapperFocused: {
        borderColor: BrandColors.primary,
        backgroundColor: '#ffffff',
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    inputWrapperError: {
        borderColor: '#f44336', // Red error color
    },
    iconContainer: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: BrandColors.dark,
        paddingVertical: 0, // Necesario para centrar verticalmente en Android
    },
    eyeButton: {
        padding: 8,
        marginLeft: 8,
    },
});
