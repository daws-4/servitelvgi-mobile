/**
 * Constantes y configuración de estados de órdenes
 */

import type { OrderStatus, OrderType, OrderPriority } from '@/types/Order';

// ============================================================================
// ESTADOS DE ÓRDENES
// ============================================================================

/**
 * Valores de estados de órdenes
 */
export const ORDER_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  HARD: 'hard',
} as const;

/**
 * Etiquetas legibles de estados
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  assigned: 'Asignada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  hard: 'Hard',
};

/**
 * Colores para cada estado de orden
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#ff9800',       // Naranja
  assigned: '#2196f3',      // Azul
  in_progress: '#9c27b0',   // Púrpura
  completed: '#4caf50',     // Verde
  cancelled: '#757575',     // Gris
  hard: '#f44336',          // Rojo
};

/**
 * Íconos para cada estado (nombre de ícono de lucide-react-native)
 */
export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  pending: 'clock',
  assigned: 'user-check',
  in_progress: 'truck',
  completed: 'check-circle',
  cancelled: 'x-circle',
  hard: 'alert-triangle',
};

// ============================================================================
// TIPOS DE ÓRDENES
// ============================================================================

/**
 * Valores de tipos de órdenes
 */
export const ORDER_TYPES = {
  INSTALLATION: 'instalacion',
  REPAIR: 'averia',
  OTHER: 'otro',
} as const;

/**
 * Etiquetas legibles de tipos
 */
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  instalacion: 'Instalación',
  averia: 'Avería/Reparación',
  otro: 'Otro',
};

/**
 * Colores para cada tipo
 */
export const ORDER_TYPE_COLORS: Record<OrderType, string> = {
  instalacion: '#4caf50',    // Verde
  averia: '#ff9800',         // Naranja
  otro: '#9e9e9e',           // Gris
};

/**
 * Íconos para cada tipo
 */
export const ORDER_TYPE_ICONS: Record<OrderType, string> = {
  instalacion: 'home',
  averia: 'tool',
  otro: 'file-text',
};

// ============================================================================
// PRIORIDADES DE ÓRDENES
// ============================================================================

/**
 * Valores de prioridades
 */
export const ORDER_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

/**
 * Etiquetas legibles de prioridades
 */
export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

/**
 * Colores para cada prioridad
 */
export const ORDER_PRIORITY_COLORS: Record<OrderPriority, string> = {
  low: '#4caf50',      // Verde
  medium: '#ff9800',   // Naranja
  high: '#f44336',     // Rojo
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtener configuración de un estado
 */
export const getOrderStatusConfig = (status: OrderStatus) => ({
  label: ORDER_STATUS_LABELS[status],
  color: ORDER_STATUS_COLORS[status],
  icon: ORDER_STATUS_ICONS[status],
});

/**
 * Obtener configuración de un tipo
 */
export const getOrderTypeConfig = (type: OrderType) => ({
  label: ORDER_TYPE_LABELS[type],
  color: ORDER_TYPE_COLORS[type],
  icon: ORDER_TYPE_ICONS[type],
});

/**
 * Obtener configuración de una prioridad
 */
export const getOrderPriorityConfig = (priority: OrderPriority) => ({
  label: ORDER_PRIORITY_LABELS[priority],
  color: ORDER_PRIORITY_COLORS[priority],
});
