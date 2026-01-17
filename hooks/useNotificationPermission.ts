import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';

const NOTIFICATION_PERMISSION_KEY = '@enlared/notification_permission_asked';

export interface NotificationPermissionState {
  /**
   * Si el permiso ha sido concedido
   */
  hasPermission: boolean;
  
  /**
   * Si está en proceso de solicitar el permiso
   */
  requesting: boolean;
  
  /**
   * Si el permiso fue denegado
   */
  permissionDenied: boolean;
  
  /**
   * Si ya se solicitó el permiso anteriormente
   */
  alreadyAsked: boolean;
  
  /**
   * Solicitar permiso de notificaciones
   */
  requestPermission: () => Promise<boolean>;
  
  /**
   * Abrir configuraciones de la app
   */
  openSettings: () => void;
}

/**
 * Hook para gestionar permisos de notificaciones
 * 
 * @example
 * ```tsx
 * import { useNotificationPermission } from '@/hooks/useNotificationPermission';
 * 
 * function LoginScreen() {
 *   const { requestPermission, alreadyAsked } = useNotificationPermission();
 * 
 *   const handleLogin = async () => {
 *     // ... login logic
 *     
 *     // Solicitar notificaciones solo la primera vez
 *     if (!alreadyAsked) {
 *       await requestPermission();
 *     }
 *   };
 * }
 * ```
 */
export function useNotificationPermission(): NotificationPermissionState {
  const [hasPermission, setHasPermission] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [alreadyAsked, setAlreadyAsked] = useState(false);

  // Verificar permiso y preferencias al montar
  useEffect(() => {
    checkPermissionAndPreference();
  }, []);

  const checkPermissionAndPreference = async () => {
    try {
      // Verificar si ya se solicitó antes
      const asked = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      setAlreadyAsked(asked === 'true');

      // Verificar estado actual del permiso
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');
      setPermissionDenied(status === 'denied');
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setRequesting(true);
      
      const { status } = await Notifications.requestPermissionsAsync();
      
      const granted = status === 'granted';
      setHasPermission(granted);
      setPermissionDenied(status === 'denied');
      
      // Guardar que ya se solicitó
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
      setAlreadyAsked(true);
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setRequesting(false);
    }
  }, []);

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  return {
    hasPermission,
    requesting,
    permissionDenied,
    alreadyAsked,
    requestPermission,
    openSettings,
  };
}
