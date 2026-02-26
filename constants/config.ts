import Constants from 'expo-constants';

/**
 * Configuración global de la aplicación
 * Valores cargados desde .env y constantes de la app
 */

// Obtener variables de entorno desde process.env
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

export const Config = {
  // ============================================================================
  // API CONFIGURATION
  // ============================================================================

  /**
   * Base URL del backend de Servitel
   * Debe configurarse en .env como API_BASE_URL
   * https://admin.servitelv.com
   */
  API_BASE_URL: getEnvVar('API_BASE_URL', 'https://admin.servitelv.com'),

  /**
   * Timeout para peticiones HTTP en milisegundos
   */
  API_TIMEOUT: 30000, // 30 segundos

  /**
   * URL de PocketBase para almacenamiento de archivos
   */
  POCKETBASE_URL: getEnvVar('POCKETBASE_URL', 'https://pb.servitelv.com'),

  // ============================================================================
  // GOOGLE MAPS
  // ============================================================================

  /**
   * API Key de Google Maps
   * Debe configurarse en .env como GOOGLE_MAPS_API_KEY
   */
  GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY', ''),

  /**
   * Configuración de mapa por defecto
   */
  MAP_DEFAULT_LOCATION: {
    latitude: 10.4806, // Caracas, Venezuela
    longitude: -66.9036,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },

  // ============================================================================
  // SPEED TEST
  // ============================================================================

  /**
   * URL del servicio de speed test (opcional)
   */
  SPEEDTEST_API_URL: getEnvVar('SPEEDTEST_API_URL'),

  // ============================================================================
  // APP INFO
  // ============================================================================

  /**
   * Versión de la aplicación
   */
  APP_VERSION: '1.1.0', // CAMBIAR AQUÍ LA VERSIÓN DE LA APP

  /**
   * Nombre de la aplicación
   */
  APP_NAME: Constants.expoConfig?.name || 'ENLARED TÉCNICOS',

  /**
   * Bundle ID
   */
  BUNDLE_ID: Constants.expoConfig?.ios?.bundleIdentifier ||
    Constants.expoConfig?.android?.package ||
    'com.servitelv.mobile',

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Duración del token JWT en días
   */
  JWT_EXPIRY_DAYS: 30,

  // ============================================================================
  // CACHE & STORAGE
  // ============================================================================

  /**
   * Tiempo de expiración de caché en minutos
   */
  CACHE_EXPIRY_MINUTES: 15,

  // ============================================================================
  // MEDIA & FILES
  // ============================================================================

  /**
   * Tamaño máximo de foto en MB
   */
  MAX_PHOTO_SIZE_MB: 5,

  /**
   * Cantidad máxima de fotos por orden
   */
  MAX_PHOTOS_PER_ORDER: 10,

  /**
   * Calidad de compresión de imágenes (0-1)
   */
  IMAGE_COMPRESSION_QUALITY: 0.8,

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  /**
   * Configuración de notificaciones
   */
  NOTIFICATIONS: {
    CHANNEL_ID: 'enlared-orders',
    CHANNEL_NAME: 'Órdenes de Servicio',
    ICON_COLOR: '#3e78b2',
  },

  // ============================================================================
  // DEVELOPMENT
  // ============================================================================

  /**
   * Modo de desarrollo
   */
  IS_DEV: __DEV__,

  /**
   * Habilitar logs de debug
   */
  ENABLE_DEBUG_LOGS: __DEV__,
} as const;

// Tipo para autocompletado
export type AppConfig = typeof Config;

// Validar configuración requerida
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Config.API_BASE_URL || Config.API_BASE_URL === 'https://admin.servitelv.com') {
    errors.push('API_BASE_URL no está configurado en .env');
  }

  if (!Config.GOOGLE_MAPS_API_KEY) {
    errors.push('GOOGLE_MAPS_API_KEY no está configurado en .env');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
