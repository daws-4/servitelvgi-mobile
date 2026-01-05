import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

    /**
     * Configurar callback para errores 401 del HTTP client
     */
    useEffect(() => {
        apiClient.setUnauthorizedCallback(() => {
            console.log('Token expirado detectado por HTTP client, cerrando sesión...');
            logout();
        });
    }, []);

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
     * Logout: cerrar sesión
     */
    const logout = async () => {
        try {
            setIsLoading(true);

            // Actualizar status a 'inactive' antes de cerrar sesión
            if (installer?._id) {
                try {
                    await installerService.updateProfile(installer._id, {
                        onDuty: 'inactive'
                    });
                } catch (statusErr) {
                    console.warn('No se pudo actualizar status a inactivo:', statusErr);
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
