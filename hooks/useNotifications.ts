import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import installerService from '@/services/api/installers';
import { useAuth } from '@/app/contexts/AuthContext';

export interface UseNotificationsReturn {
  notificationsEnabled: boolean;
  registerForPushNotifications: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = (): UseNotificationsReturn => {
  const { installer } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize state based on installer profile
  useEffect(() => {
    if (installer?.pushToken) {
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
    }
  }, [installer?.pushToken]);

  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      setError('Las notificaciones push no funcionan en simuladores fisica');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      setError('Permiso para notificaciones denegado');
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // Ensure projectId is set if using EAS
      });
      return tokenData.data;
    } catch (e: any) {
      setError(`Error obteniendo token: ${e.message}`);
      return null;
    }
  };

  // Function to check and auto-register (safe to call repeatedly)
  const registerForPushNotifications = useCallback(async () => {
    // If we already have a token in the backend, skip registration 
    // UNLESS we want to ensure the device token hasn't changed.
    // Ideally we should always check permission status.
    
    setLoading(true);
    try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
            // Only update backend if we don't have a token or it's different (optional optimization)
            // For now, always register to ensure sync
            if (installer?.pushToken !== token) {
                 await installerService.registerPushToken(token);
                 setNotificationsEnabled(true);
                 console.log('✅ [useNotifications] Push token registered/updated');
            } else {
                 console.log('ℹ️ [useNotifications] Push token already synced');
            }
        }
    } catch (err: any) {
        console.error('❌ [useNotifications] Registration failed:', err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
  }, [installer?.pushToken]);

  return {
    notificationsEnabled,
    registerForPushNotifications,
    loading,
    error
  };
};
