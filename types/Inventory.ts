/**
 * Tipos TypeScript para Inventario
 * Adaptados de /lib/api_reference/models/Inventory.ts
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Tipo de ítem de inventario
 */
export type InventoryType = 'material' | 'equipment';

/**
 * Estado de un lote/bobina
 */
export type BatchStatus = 'active' | 'depleted' | 'returned';

/**
 * Ubicación de un lote
 */
export type BatchLocation = 'warehouse' | 'crew';

/**
 * Estado de una instancia de equipo
 */
export type EquipmentStatus = 'in-stock' | 'assigned' | 'installed';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Ítem de inventario base
 */
export interface InventoryItem {
  _id: string;
  code: string;                    // Código único
  description: string;             // Descripción del material
  type: InventoryType;             // material o equipment
  unit: string;                    // Unidad (metros, unidades, etc.)
  currentStock: number;            // Stock actual en bodega
  minimumStock: number;            // Stock mínimo
  category?: string;               // Categoría
  instances?: EquipmentInstance[]; // Solo para equipment
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Lote o bobina de material (para cable, fibra, etc.)
 */
export interface InventoryBatch {
  _id: string;
  batchCode: string;               // Código del lote (ej: "BOB-001")
  item: string;                    // ID del ítem de inventario
  initialQuantity: number;         // Cantidad inicial (metros)
  currentQuantity: number;         // Cantidad actual disponible
  unit: string;                    // Unidad (metros)
  supplier?: string;               // Proveedor
  acquisitionDate: Date | string;  // Fecha de adquisición
  location: BatchLocation;         // warehouse o crew
  crew?: string;                   // ID de cuadrilla (si location = 'crew')
  status: BatchStatus;             // Estado del lote
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Instancia individual de equipo (ONT, módem, etc.)
 */
export interface EquipmentInstance {
  uniqueId: string;                // ID único (ej: "ONT-001")
  serialNumber?: string;           // Número de serie
  macAddress?: string;             // Dirección MAC
  status: EquipmentStatus;         // Estado
  assignedTo?: {
    crewId: string;
    assignedAt: Date | string;
  };
  installedAt?: {
    orderId: string;
    installedDate: Date | string;
    location: string;              // Dirección de instalación
  };
  notes?: string;
  createdAt?: Date | string;
}

/**
 * Ítem de inventario asignado a una cuadrilla
 */
export interface AssignedInventoryItem {
  item: string;                    // ID del ítem
  itemDetails?: InventoryItem;     // Detalles (populado)
  quantity: number;                // Cantidad asignada
  lastUpdate: Date | string;       // Última actualización
}

/**
 * Entrada del historial de inventario
 */
export interface InventoryHistoryEntry {
  _id: string;
  item: string | { _id: string; code: string; description: string }; // ID or Populated Item
  itemDetails?: InventoryItem;     // Deprecated/Unused if item is populated directly
  batch?: string;                  // ID del lote (opcional)
  type: InventoryMovementType;     // Tipo de movimiento
  quantityChange: number;          // Cambio de cantidad (+ o -)
  reason: string;                  // Razón del movimiento
  crew?: string | { _id: string; name: string };
  order?: string | { _id: string; subscriberNumber: string; ticket_id?: string };
  performedBy?: string | { _id: string; name?: string; surname?: string; username?: string };
  createdAt: Date | string;
}

/**
 * Tipo de movimiento de inventario
 */
export type InventoryMovementType =
  | 'entry'          // Ingreso a bodega
  | 'assignment'     // Asignación a cuadrilla
  | 'usage_order'    // Uso en orden
  | 'return'         // Devolución a bodega
  | 'adjustment';    // Ajuste manual

/**
 * Filtros para historial de inventario
 */
export interface InventoryHistoryFilters {
  crewId?: string;
  itemId?: string;
  type?: InventoryMovementType;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
}

// ============================================================================
// INPUT TYPES FOR EQUIPMENT INSTANCE MANAGEMENT
// ============================================================================

/**
 * Input para crear una nueva instancia de equipo
 */
export interface CreateInstanceInput {
  uniqueId: string;
  serialNumber?: string;
  macAddress?: string;
  notes?: string;
}

/**
 * Input para asignar una instancia a una cuadrilla/orden
 */
export interface AssignInstanceInput {
  instanceId: string;
  crewId: string;
  orderId?: string;
}

/**
 * Input para marcar una instancia como instalada
 */
export interface InstallInstanceInput {
  instanceId: string;
  orderId: string;
  location: string;
  installedDate?: Date | string;
}
