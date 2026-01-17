import { useState, useEffect, useCallback } from 'react';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  setBackgroundMessageHandler,
  onMessage,
  hasPermission,
  requestPermission,
  getToken,
  AuthorizationStatus
} from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, PermissionsAndroid } from 'react-native';
import installerService from '@/services/api/installers';
import { useAuth } from '@/app/contexts/AuthContext';

export interface UseNotificationsReturn {
  notificationsEnabled: boolean;
  registerForPushNotifications: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Configure how notifications are handled when app is in foreground
// Enable only essential properties - no manual scheduling to avoid duplicates
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // Show alert
    shouldPlaySound: true,      // Play sound
    shouldSetBadge: true,      // Don't update app badge
    shouldShowBanner: true,    // Don't show banner to avoid duplicates
    shouldShowList: true,      // Don't show in list to avoid duplicates
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

  // Configure background message handler
  useEffect(() => {
    // Track shown notification IDs to prevent duplicates
    const shownNotifications = new Set<string>();

    // Get Firebase messaging instance
    const app = getApp();
    const messaging = getMessaging(app);

    // Handle background messages
    setBackgroundMessageHandler(messaging, async remoteMessage => {
      // console.log('═══════════════════════════════════════════════════');
      // console.log('📨 [FCM Background] Mensaje recibido en background');
      // console.log('Title:', remoteMessage.notification?.title);
      // console.log('Body:', remoteMessage.notification?.body);
      // console.log('Data:', JSON.stringify(remoteMessage.data, null, 2));
      // console.log('═══════════════════════════════════════════════════');
    });

    // Handle foreground messages - Manual scheduling with content-based deduplication
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      // console.log('═══════════════════════════════════════════════════');
      // console.log('📨 [FCM Foreground] Mensaje recibido en foreground');
      // console.log('Title:', remoteMessage.notification?.title);
      // console.log('Body:', remoteMessage.notification?.body);
      // console.log('Data:', JSON.stringify(remoteMessage.data, null, 2));
      // console.log('═══════════════════════════════════════════════════');

      // Create unique ID based on notification content
      const notificationId = `${remoteMessage.notification?.title}-${remoteMessage.notification?.body}-${Date.now()}`;

      // Check if we already showed this notification
      if (shownNotifications.has(notificationId)) {
        // console.log('⚠️ [FCM] Duplicate notification detected, skipping...');
        return;
      }

      // Mark as shown
      shownNotifications.add(notificationId);

      // Clean up old IDs after 5 seconds
      setTimeout(() => {
        shownNotifications.delete(notificationId);
      }, 5000);

      // Manually schedule notification for foreground display
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification?.title || 'Nueva notificación',
            body: remoteMessage.notification?.body || '',
            data: remoteMessage.data,
            sound: true,
          },
          trigger: null, // Show immediately
        });
        // console.log('✅ [FCM] Notification scheduled successfully');
      } catch (error) {
        console.error('❌ [FCM] Error scheduling notification:', error);
      }
    });

    return unsubscribe;
  }, []);

  const registerForPushNotificationsAsync = async () => {
    // console.log('📱 [useNotifications] Iniciando registro de notificaciones FCM...');

    if (!Device.isDevice) {
      const errorMsg = 'Las notificaciones push no funcionan en simuladores';
      console.error('❌ [useNotifications]', errorMsg);
      setError(errorMsg);
      return null;
    }

    // console.log('✅ [useNotifications] Dispositivo físico detectado');

    try {
      // Get Firebase messaging instance
      const app = getApp();
      const messaging = getMessaging(app);

      // Request permission (Android 13+ / iOS)
      let authStatus = await hasPermission(messaging);

      if (authStatus !== AuthorizationStatus.AUTHORIZED &&
        authStatus !== AuthorizationStatus.PROVISIONAL) {
        // console.log('⚠️ [useNotifications] Solicitando permisos FCM...');

        if (Platform.OS === 'android') {
          if (Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              const errorMsg = 'Permiso para notificaciones denegado';
              console.error('❌ [useNotifications]', errorMsg);
              setError(errorMsg);
              return null;
            }
          }
        }

        authStatus = await requestPermission(messaging);
      }

      // console.log('🔐 [useNotifications] Estado de permisos FCM:', authStatus);

      if (authStatus !== AuthorizationStatus.AUTHORIZED &&
        authStatus !== AuthorizationStatus.PROVISIONAL) {
        const errorMsg = 'Permiso para notificaciones denegado';
        console.error('❌ [useNotifications]', errorMsg);
        setError(errorMsg);
        return null;
      }

      // Get FCM token
      // console.log('🎫 [useNotifications] Obteniendo FCM Token nativo...');
      const fcmToken = await getToken(messaging);

      // console.log('═══════════════════════════════════════════════════');
      // console.log('🎉 [useNotifications] FCM TOKEN NATIVO OBTENIDO:');
      // console.log('📋 TOKEN (primeros 50 chars):', fcmToken.substring(0, 50) + '...');
      // console.log('📏 Longitud:', fcmToken.length, 'caracteres');
      // console.log('═══════════════════════════════════════════════════');

      return fcmToken;
    } catch (e: any) {
      const errorMsg = `Error obteniendo token FCM: ${e.message}`;
      console.error('❌ [useNotifications]', errorMsg);
      console.error('Stack:', e);
      setError(errorMsg);
      return null;
    }
  };

  // Function to check and auto-register (safe to call repeatedly)
  const registerForPushNotifications = useCallback(async () => {
    // console.log('🚀 [useNotifications] registerForPushNotifications llamado');
    // console.log('👤 [useNotifications] Instalador actual:', installer?._id);
    // console.log('🎫 [useNotifications] Push token en backend:', installer?.pushToken?.substring(0, 50) + '...');

    // No intentar registrar si no hay instalador autenticado
    if (!installer) {
      // console.log('⚠️ [useNotifications] No hay instalador autenticado, omitiendo registro');
      return;
    }

    setLoading(true);
    try {
      const token = await registerForPushNotificationsAsync();

      if (token) {
        // console.log('🔍 [useNotifications] Comparando tokens...');
        // console.log('  - Nuevo token (50 chars):', token.substring(0, 50) + '...');
        // console.log('  - Token guardado (50 chars):', installer?.pushToken?.substring(0, 50) + '...');

        // Only update backend if we don't have a token or it's different
        if (installer?.pushToken !== token) {
          // console.log('💾 [useNotifications] Registrando token en backend...');
          await installerService.registerPushToken(token);
          setNotificationsEnabled(true);
          // console.log('✅ [useNotifications] FCM token registered/updated');
        } else {
          // console.log('ℹ️ [useNotifications] FCM token already synced');
        }
      } else {
        console.warn('⚠️ [useNotifications] No se pudo obtener el token');
      }
    } catch (err: any) {
      console.error('❌ [useNotifications] Registration failed:', err);
      console.error('Error completo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      // console.log('🏁 [useNotifications] Proceso de registro finalizado');
    }
  }, [installer]);

  return {
    notificationsEnabled,
    registerForPushNotifications,
    loading,
    error
  };
};
