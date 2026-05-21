import * as Location from 'expo-location';
import { useState, useEffect, useCallback } from 'react';
import { Linking, Platform } from 'react-native';

export interface LocationPermissionState {
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
   * Solicitar permiso de ubicación
   */
  requestPermission: () => Promise<boolean>;

  /**
   * Abrir configuraciones de la app
   */
  openSettings: () => void;
}

/**
 * Hook para gestionar permisos de ubicación
 *
 * @example
 * ```tsx
 * import { useLocationPermission } from '@/hooks/useLocationPermission';
 *
 * function MapScreen() {
 *   const {
 *     hasPermission,
 *     requesting,
 *     requestPermission,
 *     permissionDenied
 *   } = useLocationPermission();
 *
 *   useEffect(() => {
 *     if (!hasPermission) {
 *       requestPermission();
 *     }
 *   }, []);
 *
 *   if (permissionDenied) {
 *     return <PermissionDeniedDialog type="location" />;
 *   }
 *
 *   return <MapView />;
 * }
 * ```
 */
export function useLocationPermission(): LocationPermissionState {
  const [hasPermission, setHasPermission] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Verificar permiso actual al montar
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      setPermissionDenied(status === 'denied');
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setRequesting(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      const granted = status === 'granted';
      setHasPermission(granted);
      setPermissionDenied(status === 'denied');

      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
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
    requestPermission,
    openSettings,
  };
}
