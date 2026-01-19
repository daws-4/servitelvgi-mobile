import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import authService from '@/services/api/auth';
import apiClient from '@/services/api/client';
import installerService from '@/services/api/installers';
import type { InstallerProfile, AuthError } from '@/types/auth';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
    // Estado
    isAuthenticated: boolean;
    isLoading: boolean;
    installer: InstallerProfile | null;
    error: AuthError | null;

    // Métodos
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    clearError: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [installer, setInstaller] = useState<InstallerProfile | null>(null);
    const [error, setError] = useState<AuthError | null>(null);

    // Usar ref en lugar de state para evitar re-renders y problemas con useEffect
    const isLoggingOutRef = useRef(false);

    /**
     * Configurar callback para errores 401 del HTTP client
     */
    useEffect(() => {
        apiClient.setUnauthorizedCallback(() => {
            // Evitar loop infinito si ya estamos en proceso de logout
            if (isLoggingOutRef.current) {
                console.log('⚠️ Logout ya en progreso, ignorando callback 401');
                return;
            }
            console.log('Token expirado detectado por HTTP client, cerrando sesión...');
            logout();
        });
    }, []); // Solo configurar una vez al montar

    /**
     * Verificar si hay sesión guardada al iniciar la app
     */
    useEffect(() => {
        checkExistingSession();
    }, []);

    /**
     * Verificar sesión existente
     */
    const checkExistingSession = async () => {
        try {
            setIsLoading(true);

            // Verificar si hay token
            const hasToken = await authService.isAuthenticated();

            if (hasToken) {
                // Obtener perfil del instalador
                const profile = await authService.getMe();
                setInstaller(profile);
                setIsAuthenticated(true);
            }
        } catch (err) {
            // Si falla, limpiar sesión
            await authService.logout();
            setIsAuthenticated(false);
            setInstaller(null);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Login: autenticar instalador
     */
    const login = async (username: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);

            const response = await authService.login(username, password);

            // Actualizar status a 'active' al iniciar sesión
            // Esperar un momento para asegurar que el token esté guardado
            try {
                // Verificar que el token está disponible
                const hasToken = await authService.isAuthenticated();
                // console.log('🔐 [login] Token disponible:', hasToken);

                if (hasToken) {
                    await installerService.updateProfile(response.installer._id, {
                        onDuty: 'active'
                    });
                    // Actualizar el perfil local con el nuevo status
                    response.installer.onDuty = 'active';
                    // console.log('✅ [login] Status actualizado a active');
                } else {
                    // console.warn('⚠️ [login] Token no disponible, no se pudo actualizar status');
                }
            } catch (statusErr) {
                // console.warn('No se pudo actualizar status a activo:', statusErr);
            }

            setInstaller(response.installer);
            setIsAuthenticated(true);

            // Solicitar permisos de notificaciones y ubicación después del login exitoso
            requestPostLoginPermissions();
        } catch (err) {
            const authError = err as AuthError;
            setError(authError);
            setIsAuthenticated(false);
            setInstaller(null);
            throw authError;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Solicitar permisos de notificaciones, ubicación, cámara y galería después del login
     */
    const requestPostLoginPermissions = async () => {
        try {
            // 1. Solicitar permisos de notificaciones usando FCM
            try {
                const { getApp } = await import('@react-native-firebase/app');
                const { getMessaging, requestPermission, getToken } = await import('@react-native-firebase/messaging');
                const { Platform, PermissionsAndroid } = await import('react-native');

                const app = getApp();
                const messaging = getMessaging(app);

                // Para Android 13+
                if (Platform.OS === 'android' && Platform.Version >= 33) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    );
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        console.warn('⚠️ [PostLogin] Permiso de notificaciones denegado');
                    }
                }

                // Solicitar permiso FCM
                await requestPermission(messaging);

                // Obtener y registrar token
                const fcmToken = await getToken(messaging);
                if (fcmToken && installer?._id) {
                    await installerService.registerPushToken(fcmToken);
                    console.log('✅ [PostLogin] Token de notificaciones registrado');
                }
            } catch (notifErr) {
                console.warn('⚠️ [PostLogin] Error solicitando permisos de notificaciones:', notifErr);
            }

            // 2. Solicitar permisos de ubicación
            try {
                const Location = await import('expo-location');

                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status === 'granted') {
                    console.log('✅ [PostLogin] Permiso de ubicación otorgado');
                } else {
                    console.warn('⚠️ [PostLogin] Permiso de ubicación denegado');
                }
            } catch (locErr) {
                console.warn('⚠️ [PostLogin] Error solicitando permisos de ubicación:', locErr);
            }

            // 3. Solicitar permisos de cámara
            try {
                const ImagePicker = await import('expo-image-picker');

                const { status } = await ImagePicker.requestCameraPermissionsAsync();

                if (status === 'granted') {
                    console.log('✅ [PostLogin] Permiso de cámara otorgado');
                } else {
                    console.warn('⚠️ [PostLogin] Permiso de cámara denegado');
                }
            } catch (camErr) {
                console.warn('⚠️ [PostLogin] Error solicitando permiso de cámara:', camErr);
            }

            // 4. Solicitar permisos de galería/archivos multimedia
            try {
                const ImagePicker = await import('expo-image-picker');

                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (status === 'granted') {
                    console.log('✅ [PostLogin] Permiso de galería otorgado');
                } else {
                    console.warn('⚠️ [PostLogin] Permiso de galería denegado');
                }
            } catch (galleryErr) {
                console.warn('⚠️ [PostLogin] Error solicitando permiso de galería:', galleryErr);
            }
        } catch (err) {
            console.error('❌ [PostLogin] Error general solicitando permisos:', err);
        }
    };

    /**
     * Logout: cerrar sesión
     */
    const logout = async () => {
        // Evitar llamadas duplicadas de logout
        if (isLoggingOutRef.current) {
            console.log('⚠️ Logout ya en progreso, ignorando llamada duplicada');
            return;
        }

        try {
            isLoggingOutRef.current = true;
            setIsLoading(true);

            // Actualizar status a 'inactive' antes de cerrar sesión
            if (installer?._id) {
                try {
                    await installerService.updateProfile(installer._id, {
                        onDuty: 'inactive'
                    });
                } catch (statusErr) {
                    // Ignorar error silenciosamente (probablemente 401 si token expiró)
                    // console.warn('Error en logout del backend:', statusErr);
                }
            }

            await authService.logout();
        } catch (err) {
            console.error('Error en logout:', err);
        } finally {
            setIsAuthenticated(false);
            setInstaller(null);
            setError(null);
            setIsLoading(false);
            isLoggingOutRef.current = false;
        }
    };

    /**
     * Refrescar perfil del instalador
     */
    const refreshProfile = async () => {
        try {
            const profile = await authService.getMe();
            setInstaller(profile);
        } catch (err) {
            console.error('Error refrescando perfil:', err);
            // Si falla, probablemente el token expiró
            await logout();
        }
    };

    /**
     * Limpiar error
     */
    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        isAuthenticated,
        isLoading,
        installer,
        error,
        login,
        logout,
        refreshProfile,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }

    return context;
};

export default AuthContext;
