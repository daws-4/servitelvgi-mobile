import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { BrandColors } from '@/constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importar componentes modulares
import { LoginLogo } from '@/components/LoginLogo';
import { LoginCard } from '@/components/LoginCard';
import { LoginInput } from '@/components/LoginInput';
import { LoginButton } from '@/components/LoginButton';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const {
        login,
        isAuthenticated,
        isLoading,
        error,
        clearError,
        isBiometricAvailable,
        isBiometricEnabled,
        loginWithBiometrics,
        disableBiometrics, // Import disable function
        biometricType
    } = useAuth();
    const router = useRouter();

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)/orders');
        }
    }, [isAuthenticated]);

    // Handlers para limpiar errores al escribir
    const handleUsernameChange = (text: string) => {
        setUsername(text);
        if (localError || error) {
            setLocalError('');
            clearError?.();
        }
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (localError || error) {
            setLocalError('');
            clearError?.();
        }
    };

    /**
     * Validar campos antes de enviar
     */
    const validateFields = (): boolean => {
        if (!username || username.trim().length < 3) {
            setLocalError('El usuario debe tener al menos 3 caracteres');
            return false;
        }

        if (!password || password.length < 6) {
            setLocalError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        return true;
    };

    /**
     * Manejar login
     */
    const handleLogin = async () => {
        // Validar campos
        if (!validateFields()) {
            return;
        }

        try {
            await login(username.trim(), password);
            // AuthContext maneja la navegación automáticamente
        } catch (err) {
            // Error ya está en AuthContext.error, no necesitamos lanzar un error rojo
            console.warn('Login fallido (manejado):', err);
            // Opcional: setLocalError si queremos asegurar feedback inmediato
        }
    };

    /**
     * Obtener mensaje de error legible
     */
    const getErrorMessage = (): string => {
        if (localError) return localError;
        if (!error) return '';

        switch (error.code) {
            case 'INSTALLER_INACTIVE':
                return 'Su cuenta está inactiva. Contacte al administrador.';
            case 'INVALID_CREDENTIALS':
                return 'Usuario o contraseña incorrectos';
            case 'NETWORK_ERROR':
                return 'No hay conexión a internet. Verifique su conexión.';
            case 'SERVER_ERROR':
                return 'Error del servidor. Intente nuevamente más tarde.';
            default:
                return error.message || 'Error al iniciar sesión';
        }
    };

    const errorMessage = getErrorMessage();

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    {/* Logo y encabezado */}
                    <LoginLogo />

                    {/* Tarjeta del formulario */}
                    <LoginCard title="Acceso al Sistema">
                        {/* Campo de usuario */}
                        <LoginInput
                            key="username-input"
                            label="Usuario"
                            icon="person"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChangeText={handleUsernameChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoFocus={false}
                            editable={!isLoading}
                            testID="username-input"
                            keyboardType="default"
                            returnKeyType="next"
                        />

                        {/* Campo de contraseña */}
                        <LoginInput
                            key="password-input"
                            label="Contraseña"
                            icon="lock-closed"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={handlePasswordChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoFocus={false}
                            editable={!isLoading}
                            testID="password-input"
                            keyboardType="default"
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                            isPassword
                        />

                        {/* Mensaje de error */}
                        <ErrorAlert message={errorMessage} />

                        {/* Botón de login */}
                        <LoginButton
                            onPress={handleLogin}
                            loading={isLoading}
                            text="Iniciar Sesión"
                        />
                    </LoginCard>

                    {/* Biometric Login Button */}
                    {isBiometricAvailable && (
                        <View style={styles.biometricContainer}>
                            <TouchableOpacity
                                style={styles.biometricButton}
                                onPress={() => {
                                    if (isBiometricEnabled) {
                                        loginWithBiometrics();
                                    } else {
                                        Alert.alert(
                                            'Biometría no configurada',
                                            'Por favor, inicia sesión con tu usuario y contraseña para habilitar el acceso biométrico.'
                                        );
                                    }
                                }}
                                disabled={isLoading}
                            >
                                <MaterialCommunityIcons
                                    name={Platform.OS === 'ios' ? 'face-recognition' : 'fingerprint'}
                                    size={24}
                                    color={isBiometricEnabled ? BrandColors.primary : '#94a3b8'}
                                />
                                <Text style={[styles.biometricText, !isBiometricEnabled && { color: '#64748b' }]}>
                                    {isBiometricEnabled
                                        ? `Ingresar con ${biometricType || 'Biometría'}`
                                        : `Habilitar ${biometricType || 'Biometría'}`
                                    }
                                </Text>
                            </TouchableOpacity>

                            {/* Delete Button (User Request: "botón con una X ... para borrar inicio de sesión") */}
                            {isBiometricEnabled && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        Alert.alert(
                                            'Borrar datos biométricos',
                                            '¿Deseas borrar el inicio de sesión con biometría?',
                                            [
                                                { text: 'Cancelar', style: 'cancel' },
                                                {
                                                    text: 'Borrar',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        await disableBiometrics();
                                                        // Optional: feedback
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <MaterialCommunityIcons name="close-circle" size={24} color={BrandColors.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Problemas con tu acceso?</Text>
                        <Text style={styles.footerLink}>Contactar a Soporte Técnico</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // slate-50 background like HTML
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#94a3b8', // slate-400
        textAlign: 'center',
    },
    footerLink: {
        fontSize: 14,
        color: BrandColors.primary,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    biometricContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        marginHorizontal: 24,
        gap: 12, // Space between main button and delete button
    },
    biometricButton: {
        flex: 1, // Take available space
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#e0f2fe', // sky-100
        borderRadius: 12,
        gap: 8,
    },
    deleteButton: {
        padding: 12,
        backgroundColor: '#f1f5f9', // slate-100 (Neutral)
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    biometricText: {
        color: BrandColors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});
