import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '@/constants/config';

// Token storage keys
const TOKEN_KEY = 'enlared_auth_token';

/**
 * Cliente HTTP base configurado con:
 * - Base URL desde config
 * - Interceptores para JWT
 * - Manejo de errores global
 * - Timeout configurado
 */
class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private onUnauthorized?: () => void;

  constructor() {
    this.client = axios.create({
      baseURL: Config.API_BASE_URL,
      timeout: Config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configurar interceptores de request y response
   */
  private setupInterceptors() {
    // Request interceptor: agregar token JWT automáticamente
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Obtener token del estado o de secure storage
        if (!this.token) {
          this.token = await this.getStoredToken();
        }

        // Agregar Authorization header si hay token
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: manejar errores globales
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Error 401: token inválido o expirado
        if (error.response?.status === 401) {
          // Limpiar token
          await this.clearToken();

          // Notificar al AuthContext para logout
          if (this.onUnauthorized) {
            this.onUnauthorized();
          } else {
            console.warn('Token inválido o expirado. Usuario debe re-autenticarse.');
          }
        }

        // Re-lanzar el error para que lo maneje el caller
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Formatear errores de axios a un formato consistente
   */
  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      // El servidor respondió con un código de error
      return {
        message: (error.response.data as any)?.message || error.message,
        code: (error.response.data as any)?.code,
        status: error.response.status,
      };
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return {
        message: 'No se pudo conectar con el servidor',
        status: 0,
      };
    } else {
      // Error al configurar la petición
      return {
        message: error.message,
        status: 0,
      };
    }
  }

  /**
   * Obtener token almacenado en secure storage
   */
  private async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Guardar token en secure storage y en memoria
   */
  public async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error guardando token:', error);
      throw error;
    }
  }

  /**
   * Eliminar token de secure storage y memoria
   */
  public async clearToken(): Promise<void> {
    this.token = null;
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  }

  /**
   * Obtener instancia de axios configurada
   */
  public getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Establecer callback para errores 401
   * Permite coordinar logout con AuthContext
   */
  public setUnauthorizedCallback(callback: () => void): void {
    this.onUnauthorized = callback;
  }

  /**
   * Verificar si hay un token guardado
   */
  public async hasToken(): Promise<boolean> {
    if (this.token) return true;

    const storedToken = await this.getStoredToken();
    if (storedToken) {
      this.token = storedToken;
      return true;
    }

    return false;
  }
}

// Tipos de error personalizados
export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

// Crear instancia singleton
const apiClient = new ApiClient();

// Exportar cliente y métodos útiles
export default apiClient;
export const httpClient = apiClient.getClient();
