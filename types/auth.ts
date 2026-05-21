/**
 * Tipos TypeScript para autenticación móvil
 * Basados en los endpoints de /api/mobile/auth/
 */

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Payload para login
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Respuesta exitosa de login
 */
export interface LoginResponse {
  message: string;
  token: string;
  installer: InstallerProfile;
}

/**
 * Perfil del instalador autenticado
 */
export interface InstallerProfile {
  _id: string;
  username: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  status: InstallerStatus;
  onDuty: OnDutyStatus; // 'active' | 'inactive' | 'onDuty'
  showInventory: boolean;
  crew: CrewInfo | null;
  profilePicture?: string | null;
  pushToken?: string;
}

/**
 * Información básica de la cuadrilla
 */
export interface CrewInfo {
  _id: string;
  number: number;
}

/**
 * Estados posibles de un instalador
 */
export type InstallerStatus = 'active' | 'inactive' | 'suspended';

/**
 * Estado de servicio del instalador
 */
export type OnDutyStatus = 'active' | 'inactive' | 'onDuty';

// ============================================================================
// TOKEN TYPES
// ============================================================================

/**
 * Payload decodificado del JWT
 * (lo que contiene el token)
 */
export interface InstallerTokenPayload {
  sub: string; // Installer ID
  _id: string;
  username: string;
  name: string;
  surname: string;
  role: 'installer';
  crewId: string | null;
  crewNumber: number | null;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Códigos de error de autenticación
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'INSTALLER_INACTIVE'
  | 'INSTALLER_SUSPENDED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR';

/**
 * Error de autenticación
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
}
