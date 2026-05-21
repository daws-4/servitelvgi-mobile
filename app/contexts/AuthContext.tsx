import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

import authService from '@/services/api/auth';
import apiClient from '@/services/api/client';
import installerService from '@/services/api/installers';
import { biometricService } from '@/services/biometricService';
import type { InstallerProfile, AuthError } from '@/types/auth';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

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

  // Biometría
  isBiometricAvailable: boolean;
  biometricType?: string;
  isBiometricEnabled: boolean;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
  loginWithBiometrics: () => Promise<boolean>;
  enrollBiometrics: (u: string, p: string) => Promise<void>;
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

  // Biometric State
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | undefined>();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Usar ref en lugar de state para evitar re-renders y problemas con useEffect
  const isLoggingOutRef = useRef(false);
  // Cache password for current session to allow biometric enrollment
  const currentPasswordRef = useRef<string | null>(null);

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
   * Verificar sesión existente y biometría al montar
   */
  useEffect(() => {
    const init = async () => {
      await checkExistingSession();
      await checkBiometrics();
    };
    init();
  }, []);

  /**
   * Check permissions and previous enrollment
   */
  const checkBiometrics = async () => {
    const status = await biometricService.checkAvailability();
    setIsBiometricAvailable(status.available);
    setBiometricType(biometricService.getBiometryLabel(status.biometryType));

    if (status.available) {
      // Check if user has enabled it previously (stored credentials)
      const stored = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      setIsBiometricEnabled(!!stored);
    }
  };

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

      // Cache password for session
      currentPasswordRef.current = password;

      // Auto-enroll biometrics if available (User Request: "pide las credenciales para guardarlas")
      // effectively meaning: when they validly login, we save them for next time.
      if (isBiometricAvailable) {
        await enrollBiometrics(username, password);
      }

      // Actualizar status a 'active' al iniciar sesión
      try {
        const hasToken = await authService.isAuthenticated();
        if (hasToken) {
          await installerService.updateProfile(response.installer._id, {
            onDuty: 'active',
          });
          response.installer.onDuty = 'active';
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
        const { getMessaging, requestPermission, getToken } =
          await import('@react-native-firebase/messaging');
        const { Platform, PermissionsAndroid } = await import('react-native');

        const app = getApp();
        const messaging = getMessaging(app);

        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('⚠️ [PostLogin] Permiso de notificaciones denegado');
          }
        }

        await requestPermission(messaging);
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
    if (isLoggingOutRef.current) {
      console.log('⚠️ Logout ya en progreso, ignorando llamada duplicada');
      return;
    }

    try {
      isLoggingOutRef.current = true;
      setIsLoading(true);

      if (installer?._id) {
        try {
          await installerService.updateProfile(installer._id, {
            onDuty: 'inactive',
          });
        } catch (statusErr) {
          // Ignorar error silenciosamente
        }
      }

      await authService.logout();

      // Clear the order config cache on logout to ensure fresh configuration
      // upon next login (either manual or via biometrics)
      try {
        await AsyncStorage.removeItem('@order_config_v1');
      } catch (cacheErr) {
        console.warn('Could not clear order config cache:', cacheErr);
      }
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      currentPasswordRef.current = null; // Clear password cache
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
      await logout();
    }
  };

  /**
   * Limpiar error
   */
  const clearError = () => {
    setError(null);
  };

  // ============================================================================
  // BIOMETRIC METHODS
  // ============================================================================

  const enableBiometrics = async (): Promise<boolean> => {
    if (!installer || !isBiometricAvailable) return false;

    const success = await biometricService.authenticate('Confirma para habilitar biometría');
    if (success) {
      // Even if enabled via toggle, we need credentials.
      // If called from settings and we have passwordRef, re-save.
      if (currentPasswordRef.current && installer.username) {
        await enrollBiometrics(installer.username, currentPasswordRef.current);
      }
      setIsBiometricEnabled(true);
      return true;
    }
    return false;
  };

  const enrollBiometrics = async (username: string, pass: string) => {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify({ username, pass }));
      setIsBiometricEnabled(true);
    } catch (e) {
      console.error('Failed to secure store creds', e);
    }
  };

  const disableBiometrics = async () => {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    setIsBiometricEnabled(false);
  };

  const loginWithBiometrics = async (): Promise<boolean> => {
    if (!isBiometricAvailable) return false;

    const stored = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (!stored) {
      setIsBiometricEnabled(false);
      return false;
    }

    const success = await biometricService.authenticate();
    if (success) {
      try {
        const { username, pass } = JSON.parse(stored);
        await login(username, pass);
        return true;
      } catch (e) {
        console.error('Biometric Login Error', e);
        return false;
      }
    }
    return false;
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

    // Biometric exports
    isBiometricAvailable,
    biometricType,
    isBiometricEnabled,
    enableBiometrics,
    disableBiometrics,
    loginWithBiometrics,
    enrollBiometrics,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
};

export default AuthContext;
