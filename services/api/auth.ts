import apiClient, { httpClient, ApiError } from './client';
import type { 
  LoginRequest, 
  LoginResponse, 
  InstallerProfile,
  AuthError,
  AuthErrorCode 
} from '@/types/auth';

/**
 * Servicio de Autenticación
 * Consume los endpoints de /api/mobile/auth/
 */
class AuthService {
  /**
   * POST /api/mobile/auth/login
   * Autenticar instalador con username y password
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const payload: LoginRequest = { username, password };
      
      const response = await httpClient.post<LoginResponse>(
        '/api/mobile/auth/login',
        payload
      );

      // Guardar token en secure storage
      if (response.data.token) {
        await apiClient.setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error as ApiError);
    }
  }

  /**
   * POST /api/mobile/auth/logout
   * Cerrar sesión del instalador
   */
  async logout(): Promise<void> {
    try {
      await httpClient.post('/api/mobile/auth/logout');
    } catch (error) {
      // Ignorar errores de logout en backend
      console.warn('Error en logout del backend:', error);
    } finally {
      // Siempre limpiar token local
      await apiClient.clearToken();
    }
  }

  /**
   * GET /api/mobile/auth/me
   * Obtener perfil del instalador autenticado
   */
  async getMe(): Promise<InstallerProfile> {
    try {
      const response = await httpClient.get<{ installer: InstallerProfile }>(
        '/api/mobile/auth/me'
      );

      return response.data.installer;
    } catch (error) {
      throw this.handleAuthError(error as ApiError);
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * (Tiene token guardado)
   */
  async isAuthenticated(): Promise<boolean> {
    return await apiClient.hasToken();
  }

  /**
   * Obtener token guardado
   */
  async getToken(): Promise<string | null> {
    const hasToken = await apiClient.hasToken();
    if (!hasToken) return null;
    
    // El token está en memoria después de hasToken()
    return apiClient.getClient().defaults.headers.common['Authorization'] as string | null;
  }

  /**
   * Manejar errores de autenticación y convertirlos a formato consistente
   */
  private handleAuthError(error: ApiError): AuthError {
    let code: AuthErrorCode;
    let message: string = error.message;

    // Mapear códigos de error del backend
    if (error.code === 'INSTALLER_INACTIVE') {
      code = 'INSTALLER_INACTIVE';
      message = 'Su cuenta está inactiva. Contacte al administrador.';
    } else if (error.status === 401) {
      code = 'INVALID_CREDENTIALS';
      message = 'Usuario o contraseña incorrectos';
    } else if (error.status === 0) {
      code = 'NETWORK_ERROR';
      message = 'No se pudo conectar con el servidor. Verifique su conexión.';
    } else if (error.status >= 500) {
      code = 'SERVER_ERROR';
      message = 'Error del servidor. Intente nuevamente más tarde.';
    } else {
      code = 'SERVER_ERROR';
    }

    return { code, message };
  }
}

// Crear instancia singleton
const authService = new AuthService();

// Exportar servicio y métodos individuales
export default authService;

// También exportar métodos individuales para facilitar uso
export const {
  login,
  logout,
  getMe,
  isAuthenticated,
  getToken,
} = authService;
