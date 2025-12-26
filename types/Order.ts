/**
 * Tipos TypeScript para Órdenes de Servicio
 * Adaptados de /lib/api_reference/models/Order.ts
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Estados posibles de una orden
 */
export type OrderStatus = 
  | 'pending'       // Pendiente
  | 'assigned'      // Asignada a cuadrilla
  | 'in_progress'   // En progreso
  | 'completed'     // Completada
  | 'cancelled';    // Cancelada

/**
 * Tipos de orden
 */
export type OrderType = 
  | 'instalacion'   // Instalación nueva
  | 'averia'        // Reparación/avería
  | 'otro';         // Otro tipo

/**
 * Prioridad de la orden
 */
export type OrderPriority = 'low' | 'medium' | 'high';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Coordenadas geográficas
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Material usado en una orden
 */
export interface MaterialUsed {
  item: string;           // ID del ítem de inventario
  quantity: number;       // Cantidad usada
  batchCode?: string;     // Código de lote (para bobinas)
  description?: string;   // Descripción (populada desde backend)
}

/**
 * Resultado de prueba de velocidad
 */
export interface SpeedTestResult {
  download: number;       // Mbps
  upload: number;         // Mbps
  ping: number;           // ms
  jitter: number;         // ms
  server?: string;        // Servidor usado
  testedAt: Date | string; // Timestamp de la prueba
}

/**
 * Orden de servicio completa
 */
export interface Order {
  _id: string;
  
  // Información del abonado
  subscriberNumber: string;     // N° de abonado (único)
  subscriberName: string;       // Nombre del abonado
  address: string;              // Dirección completa
  coordinates?: Coordinates;    // Coordenadas GPS
  
  // Tipo y estado
  type: OrderType;              // Tipo de orden
  status: OrderStatus;          // Estado actual
  priority?: OrderPriority;     // Prioridad
  
  // Asignación y programación
  assignedTo?: string;          // ID de la cuadrilla asignada
  assignedToName?: string;      // Nombre de la cuadrilla (populado)
  assignmentDate?: Date | string;  // Fecha de asignación
  scheduledDate?: Date | string;   // Fecha programada
  
  // Completado
  completionDate?: Date | string;  // Fecha de completado
  completedBy?: string;            // ID del instalador que completó
  materialsUsed?: MaterialUsed[];  // Materiales usados
  photos?: string[];               // URLs de fotos
  signature?: string;              // Firma del cliente (base64)
  speedTest?: SpeedTestResult;     // Resultado de speed test
  
  // Información adicional
  description?: string;         // Descripción/notas
  notes?: string;               // Notas adicionales
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Datos para completar una orden
 */
export interface OrderCompletionData {
  materialsUsed: MaterialUsed[];
  photos: string[];               // Base64 o URLs
  signature: string;              // Base64 de la firma
  speedTest?: SpeedTestResult;    // Resultado opcional de speed test
  notes?: string;                 // Notas finales
}

/**
 * Filtros para listar órdenes
 */
export interface OrderFilters {
  status?: OrderStatus | OrderStatus[];
  type?: OrderType;
  assignedTo?: string;            // Crew ID
  startDate?: Date | string;
  endDate?: Date | string;
  priority?: OrderPriority;
  search?: string;                // Buscar por subscriber name/number
}

/**
 * Orden resumida (para listas)
 */
export interface OrderSummary {
  _id: string;
  subscriberNumber: string;
  subscriberName: string;
  address: string;
  type: OrderType;
  status: OrderStatus;
  priority?: OrderPriority;
  scheduledDate?: Date | string;
  assignedToName?: string;
}

/**
 * Estadísticas de órdenes
 */
export interface OrderStats {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}
