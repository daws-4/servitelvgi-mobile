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

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Instalador (técnico de campo)
 */
export interface Installer {
  _id: string;
  username: string;                // Usuario para login
  name: string;                    // Nombre
  surname: string;                 // Apellido
  email?: string;                  // Email
  phone?: string;                  // Teléfono
  status: InstallerStatus;         // Estado
  onDuty: boolean;                 // En servicio actualmente
  showInventory: boolean;          // Mostrar tab de inventario
  currentCrew?: string;            // ID de cuadrilla actual
  crewDetails?: {                  // Detalles de cuadrilla (populado)
    _id: string;
    name: string;
  };
  pushToken?: string;              // Token de notificaciones push
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Datos para actualizar perfil de instalador
 */
export interface UpdateInstallerProfile {
  email?: string;
  phone?: string;
  onDuty?: boolean;
}
