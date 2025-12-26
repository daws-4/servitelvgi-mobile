/**
 * Tipos genéricos para respuestas de API
 */

// ============================================================================
// RESPONSE WRAPPERS
// ============================================================================

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Respuesta con metadatos
 */
export interface ResponseWithMeta<T, M = any> {
  data: T;
  meta: M;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error de la API
 */
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: any;
}

/**
 * Error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: ValidationError[];
}

// ============================================================================
// REQUEST HELPERS
// ============================================================================

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Parámetros de búsqueda
 */
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
}

// ============================================================================
// STATUS RESPONSES
// ============================================================================

/**
 * Respuesta de operación exitosa simple
 */
export interface SuccessResponse {
  success: true;
  message: string;
}

/**
 * Respuesta de operación fallida
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}
