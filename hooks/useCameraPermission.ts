import { useState, useEffect, useCallback } from 'react';
import * as Camera from 'expo-camera';
import { Linking, Platform } from 'react-native';

export interface CameraPermissionState {
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
   * Solicitar permiso de cámara
   */
  requestPermission: () => Promise<boolean>;
  
  /**
   * Abrir configuraciones de la app
   */
  openSettings: () => void;
}

/**
 * Hook para gestionar permisos de cámara
 * 
 * @example
 * ```tsx
 * import { useCameraPermission } from '@/hooks/useCameraPermission';
 * 
 * function PhotoCapture() {
 *   const { requestPermission, hasPermission, permissionDenied } = useCameraPermission();
 * 
 *   const handleTakePhoto = async () => {
 *     const granted = await requestPermission();
 *     if (granted) {
 *       // Abrir cámara
 *       const result = await ImagePicker.launchCameraAsync();
 *     }
 *   };
 * 
 *   if (permissionDenied) {
 *     return <PermissionDeniedDialog type="camera" />;
 *   }
 * 
 *   return <Button onPress={handleTakePhoto}>Tomar Foto</Button>;
 * }
 * ```
 */
export function useCameraPermission(): CameraPermissionState {
  const [hasPermission, setHasPermission] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Verificar permiso actual al montar
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const { status } = await Camera.Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setPermissionDenied(status === 'denied');
    } catch (error) {
      console.error('Error checking camera permission:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setRequesting(true);
      
      const { status } = await Camera.Camera.requestCameraPermissionsAsync();
      
      const granted = status === 'granted';
      setHasPermission(granted);
      setPermissionDenied(status === 'denied');
      
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
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
