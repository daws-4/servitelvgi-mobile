import '../global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { OfflineBanner } from '@/components/OfflineBanner';
import { InactivityMonitor } from '@/components/InactivityMonitor';
import useThemedNavigation from './hooks/useThemedNavigation';
import { BandwidthSync } from '@/components/BandwidthSync';

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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,  // 10 minutes
      retry: 2,
    },
  },
});


/**
 * Layout raíz de la aplicación
 */
export default function RootLayout() {
  const { screenOptions } = useThemedNavigation();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SecurityProvider>
            <ThemeProvider>
              <OfflineProvider>
                <ProtectedLayout>
                  <BandwidthSync />
                  <InactivityMonitor>
                    <OfflineBanner />
                    <StatusBar style="dark" />
                    <Stack screenOptions={screenOptions}>
                      <Stack.Screen
                        name="login"
                        options={{
                          headerShown: false,
                          animation: 'fade'
                        }}
                      />
                      <Stack.Screen
                        name="(tabs)"
                        options={{
                          headerShown: false
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
                  </InactivityMonitor>
                </ProtectedLayout>
              </OfflineProvider>
            </ThemeProvider>
          </SecurityProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
