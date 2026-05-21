/**
 * Tipos TypeScript para Instaladores
 * Adaptados de /lib/api_reference/models/Installer.ts
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Estado de un instalador
 */
export type InstallerStatus = 'active' | 'inactive' | 'suspended';

/**
 * Estado de servicio del instalador
 */
export type OnDutyStatus = 'active' | 'inactive' | 'onDuty';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Instalador (técnico de campo)
 */
export interface Installer {
  _id: string;
  username: string; // Usuario para login
  name: string; // Nombre
  surname: string; // Apellido
  email?: string; // Email
  phone?: string; // Teléfono
  status: InstallerStatus; // Estado
  onDuty: OnDutyStatus; // Estado de servicio ('active' | 'inactive' | 'onDuty')
  showInventory: boolean; // Mostrar tab de inventario
  currentCrew?: string; // ID de cuadrilla actual (ObjectId)
  crewDetails?: {
    // Detalles de cuadrilla (populado)
    _id: string;
    number: number;
  };
  pushToken?: string; // Token de notificaciones push
  profilePicture?: string; // URL de foto de perfil
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Datos para actualizar perfil de instalador
 */
export interface UpdateInstallerProfile {
  email?: string;
  phone?: string;
  onDuty?: OnDutyStatus; // 'active' | 'inactive' | 'onDuty'
  password?: string; // For password updates (hashed server-side)
  profilePicture?: string; // URL de foto de perfil
}

/**
 * Datos para cambiar contraseña (con verificación)
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
