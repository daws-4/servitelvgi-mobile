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
  | 'cancelled'     // Cancelada
  | 'hard'          // Hard
  | 'visita';       // Visita técnica

/**
 * Tipos de orden
 */
export type OrderType =
  | 'instalacion'   // Instalación nueva
  | 'averia'        // Reparación/avería
  | 'recuperacion'  // Recuperación de equipos
  | 'otro';         // Otro tipo

/**
 * Prioridad de la orden
 */
export type OrderPriority = 'low' | 'medium' | 'high';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Coordenadas geográficas (formato del backend)
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Material usado en una orden
 */
export interface MaterialUsed {
  item: string;           // ID del ítem de inventario
  quantity: number;       // Cantidad usada
  batchCode?: string;     // Código de lote (para bobinas)
  description?: string;   // Descripción (populada desde backend)
  instanceIds?: string[]; // IDs de instancias de equipos
  instanceDetails?: Array<{ // Detalles de instancias para visualización
    uniqueId: string;
    serialNumber: string;
  }>;
}

/**
 * Entrada de bitácora del instalador
 */
export interface InstallerLog {
  timestamp: Date | string;
  log: string;
  status: OrderStatus;
}

/**
 * Resultado de prueba de internet (formato del backend)
 */
export interface InternetTestResult {
  downloadSpeed?: number;     // Mbps
  uploadSpeed?: number;       // Mbps
  ping?: number;              // ms
  provider?: string;          // Proveedor de internet
  wifiSSID?: string;          // Nombre de la red WiFi
  frecuency?: string;         // Frecuencia WiFi (2.4GHz, 5GHz)
  coordinates?: Coordinates;  // Coordenadas donde se realizó la prueba
}

/**
 * Datos del equipo ONT recuperado (solo para registro, NO se añade al inventario)
 */
export interface EquipmentRecovered {
  ontId: string;              // ID de la ONT (obligatorio)
  serialNumber?: string;      // Número de serie
  macAddress?: string;        // Dirección MAC
  model?: string;             // Modelo del equipo
  condition?: 'good' | 'damaged' | 'defective'; // Estado del equipo
  notes?: string;             // Observaciones adicionales
}

/**
 * Orden de servicio completa
 */
export interface Order {
  _id: string;

  // Información del abonado
  subscriberNumber: string;     // N° de abonado (único)
  ticket_id?: string;           // ID del ticket asociado
  subscriberName: string;       // Nombre del abonado
  address: string;              // Dirección completa
  phones?: string[];            // Teléfonos del abonado
  email?: string;               // Correo electrónico

  // Coordenadas de la orden
  coordinates?: Coordinates;    // Coordenadas GPS de la ubicación

  // Tipo y estado
  type: OrderType;              // Tipo de orden
  status: OrderStatus;          // Estado actual
  priority?: OrderPriority;     // Prioridad

  // Datos técnicos
  node?: string;                // Nodo de red
  servicesToInstall?: string[]; // Servicios a instalar

  // Asignación y programación
  assignedTo?: string;          // ID de la cuadrilla asignada
  assignedToName?: string;      // Nombre de la cuadrilla (populado)
  receptionDate?: Date | string;  // Fecha de recepción
  assignmentDate?: Date | string; // Fecha de asignación

  // Completado
  completionDate?: Date | string;  // Fecha de completado
  completedBy?: string;            // ID del instalador que completó

  // Datos de cierre
  reportDetails?: string;          // Detalles del reporte
  materialsUsed?: MaterialUsed[];  // Materiales usados
  installerLog?: InstallerLog[];   // Bitácora del instalador
  photoEvidence?: string[];        // URLs de fotos (formato backend)
  customerSignature?: string;      // Firma del cliente (base64)
  internetTest?: InternetTestResult; // Resultado de prueba de internet
  equipmentRecovered?: EquipmentRecovered; // Equipo recuperado (solo para recuperación)

  // Control de reporte
  googleFormReported?: boolean;    // Reportado a Google Form

  // Datos Técnicos Adicionales
  powerNap?: string;             // Potencia en NAP
  powerRoseta?: string;          // Potencia en Roseta
  remainingPorts?: number;       // Puertos restantes
  visitCount?: number;           // Contador de visitas

  // Información adicional
  description?: string;         // Descripción/notas
  notes?: string;               // Notas adicionales

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;

  // Etiqueta
  etiqueta?: {
    color?: 'verde' | 'rojo' | 'azul';
    numero?: number;
  };
}

/**
 * Datos para completar una orden
 */
export interface OrderCompletionData {
  materialsUsed?: MaterialUsed[];  // Opcional para recuperación
  photoEvidence: string[];         // IDs de PocketBase (recordId:filename)
  customerSignature?: string;      // Base64 de la firma (no aplica para recuperación)
  internetTest?: InternetTestResult; // Resultado de prueba de internet (no aplica para recuperación)
  equipmentRecovered?: EquipmentRecovered; // Equipo recuperado (solo para recuperación)
  reportDetails?: string;          // Detalles del reporte
  coordinates?: Coordinates;       // Coordenadas de cierre
}

/**
 * Datos para actualizar prueba de internet
 */
export interface UpdateInternetTestData {
  internetTest: InternetTestResult;
  coordinates?: Coordinates;       // Coordenadas de la orden actualizadas
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
  receptionDate?: Date | string;
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
