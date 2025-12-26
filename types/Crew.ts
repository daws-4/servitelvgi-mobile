/**
 * Tipos TypeScript para Cuadrillas
 * Adaptados de /lib/api_reference/models/Crew.ts
 */

import type { AssignedInventoryItem } from './Inventory';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Información del vehículo de la cuadrilla
 */
export interface Vehicle {
  plate: string;           // Placa
  model: string;           // Modelo
  year?: number;           // Año
}

/**
 * Cuadrilla de instaladores
 */
export interface Crew {
  _id: string;
  name: string;                              // Nombre de la cuadrilla
  leader: string;                            // ID del líder
  leaderDetails?: InstallerBasic;            // Detalles del líder (populado)
  members: string[];                         // IDs de miembros
  memberDetails?: InstallerBasic[];          // Detalles de miembros (populado)
  isActive: boolean;                         // Cuadrilla activa
  assignedInventory: AssignedInventoryItem[]; // Inventario asignado
  vehicle?: Vehicle;                         // Información del vehículo
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Información básica de un instalador (para populación)
 */
export interface InstallerBasic {
  _id: string;
  name: string;
  surname: string;
  phone?: string;
}

/**
 * Cuadrilla resumida (para listas)
 */
export interface CrewSummary {
  _id: string;
  name: string;
  leaderName: string;
  memberCount: number;
  isActive: boolean;
  vehiclePlate?: string;
}
