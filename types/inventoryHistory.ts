/**
 * Types for Inventory History
 * Based on models/InventoryHistory.ts from backend
 */

import { InventoryItem } from './Inventory';

// History type enum
export type InventoryHistoryType =
  | 'entry'         // Entrada al inventario principal
  | 'assignment'    // Asignación a cuadrilla
  | 'return'        // Devolución de cuadrilla
  | 'usage_order'   // Uso en orden
  | 'adjustment';   // Ajuste manual

// Inventory history entry
export interface InventoryHistory {
  _id: string;
  item: string | InventoryItem; // Item ID or populated item
  type: InventoryHistoryType;
  quantityChange: number; // Positive for additions, negative for subtractions
  reason?: string;
  crew?: string; // Crew ID
  order?: string; // Order ID
  performedBy?: string; // User or Installer ID
  performedByModel?: 'User' | 'Installer';
  createdAt: string;
}

// Filters for fetching inventory history
export interface InventoryHistoryFilters {
  itemId?: string;
  crewId?: string;
  orderId?: string;
  type?: InventoryHistoryType;
  startDate?: string;
  endDate?: string;
}
