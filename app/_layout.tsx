import '../global.css';
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { OfflineBanner } from '@/components/OfflineBanner';
import useThemedNavigation from './hooks/useThemedNavigation';

/**
 * Componente que protege las rutas y maneja redirecciones
 */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que termine la verificación inicial
    if (isLoading) return;

    // Verificar en qué grupo de rutas estamos
    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // No autenticado y no en login -> redirigir a login
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Autenticado pero en login -> redirigir a app
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Mostrar splash mientras verifica sesión
  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

/**
 * Layout raíz de la aplicación
 */
export default function RootLayout() {
  const { screenOptions } = useThemedNavigation();

  return (
    <AuthProvider>
      <ThemeProvider>
        <OfflineProvider>
          <ProtectedLayout>
            <OfflineBanner />
            <Stack screenOptions={screenOptions}>
              <Stack.Screen
                name="login"
                options={{
                  headerShown: false,
                  animation: 'fade'
                }}
              />
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false
                }}
              />
            </Stack>
            <Toast />
          </ProtectedLayout>
        </OfflineProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
