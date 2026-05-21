/**
 * Tipos TypeScript para Usuarios
 * Adaptados de /lib/api_reference/models/User.ts
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Roles de usuario en el sistema
 */
export type UserRole = 'admin' | 'manager' | 'installer';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Usuario del sistema
 */
export interface User {
  _id: string;
  email: string; // Email único
  password?: string; // Password (normalmente no se envía desde backend)
  name: string; // Nombre completo
  role: UserRole; // Rol
  isActive: boolean; // Usuario activo
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Usuario sin información sensible (para respuestas)
 */
export type SafeUser = Omit<User, 'password'>;
