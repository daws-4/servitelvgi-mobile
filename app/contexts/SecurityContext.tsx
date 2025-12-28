import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import { showWarningToast } from '@/components/ui/Toast';

// Configuraciones de timeout
const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 días en ms (604800000)
const CHECK_INTERVAL = 60 * 1000; // Verificar cada 1 minuto
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // Advertir 5 minutos antes

interface SecurityContextValue {
    /**
     * Timestamp de la última actividad del usuario
     */
    lastActivityTime: number;

    /**
     * Timestamp de cuándo expira la sesión
     */
    sessionExpiresAt: number;

    /**
     * Si la sesión ha expirado
     */
    isSessionExpired: boolean;

    /**
     * Resetear el timer de actividad
     */
    resetActivityTimer: () => void;
}

const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

interface SecurityProviderProps {
    children: ReactNode;
}

/**
 * Provider de seguridad que maneja auto-logout por inactividad
 * 
 * @example
 * ```tsx
 * // En _layout.tsx
 * <SecurityProvider>
 *   <AuthProvider>
 *     {children}
 *   </AuthProvider>
 * </SecurityProvider>
 * ```
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
    const { isAuthenticated, logout } = useAuth();
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const [hasShownWarning, setHasShownWarning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Calcular cuándo expira la sesión
    const sessionExpiresAt = lastActivityTime + SESSION_TIMEOUT;

    /**
     * Resetear timer de actividad
     */
    const resetActivityTimer = () => {
        if (isAuthenticated) {
            setLastActivityTime(Date.now());
            setHasShownWarning(false);
        }
    };

    /**
     * Verificar si la sesión ha expirado
     */
    const checkSessionExpiry = useCallback(() => {
        if (!isAuthenticated) return;

        const now = Date.now();
        const timeUntilExpiry = sessionExpiresAt - now;

        // Sesión expirada
        if (timeUntilExpiry <= 0) {
            setIsSessionExpired(true);
            showWarningToast(
                'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.',
                'Sesión Expirada'
            );
            logout();
            return;
        }

        // Advertencia antes de expirar
        if (timeUntilExpiry <= WARNING_BEFORE_EXPIRY && !hasShownWarning) {
            setHasShownWarning(true);
            const minutesLeft = Math.ceil(timeUntilExpiry / 60000);
            showWarningToast(
                `Tu sesión expirará en ${minutesLeft} minuto${minutesLeft > 1 ? 's' : ''}`,
                'Sesión por expirar'
            );
        }
    }, [isAuthenticated, sessionExpiresAt, hasShownWarning, logout]);

    /**
     * Configurar verificación periódica
     */
    useEffect(() => {
        if (isAuthenticated) {
            // Verificar inmediatamente
            checkSessionExpiry();

            // Configurar intervalo
            intervalRef.current = setInterval(checkSessionExpiry, CHECK_INTERVAL);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        } else {
            // Limpiar interval si no está autenticado
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setIsSessionExpired(false);
            setHasShownWarning(false);
        }
    }, [isAuthenticated, checkSessionExpiry]);

    /**
     * Resetear actividad cuando la app vuelve al foreground
     */
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active' && isAuthenticated) {
                resetActivityTimer();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [isAuthenticated]);

    const value: SecurityContextValue = {
        lastActivityTime,
        sessionExpiresAt,
        isSessionExpired,
        resetActivityTimer,
    };

    return (
        <SecurityContext.Provider value={value}>
            {children}
        </SecurityContext.Provider>
    );
}

/**
 * Hook para acceder al contexto de seguridad
 * 
 * @example
 * ```tsx
 * import { useSecurity } from '@/hooks/useSecurity';
 * 
 * function SomeComponent() {
 *   const { resetActivityTimer, sessionExpiresAt } = useSecurity();
 *   
 *   const handleImportantAction = () => {
 *     resetActivityTimer();
 *     // ... acción
 *   };
 * }
 * ```
 */
export function useSecurity(): SecurityContextValue {
    const context = useContext(SecurityContext);
    if (context === undefined) {
        throw new Error('useSecurity must be used within a SecurityProvider');
    }
    return context;
}
