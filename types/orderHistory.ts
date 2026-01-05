/**
 * Types for Order History
 * Based on models/OrderHistory.ts from backend
 */

// Change type enum
export type OrderHistoryChangeType =
  | 'status_change'
  | 'crew_assignment'
  | 'materials_added'
  | 'completed'
  | 'cancelled'
  | 'created'
  | 'updated';

// Order history entry
export interface OrderHistory {
  _id: string;
  order: string; // Order ID
  changeType: OrderHistoryChangeType;
  previousValue?: any;
  newValue?: any;
  description: string;
  crew?: string; // Crew ID
  changedBy?: string; // User or Installer ID
  changedByModel?: 'User' | 'Installer';
  createdAt: string;
}

// Filters for fetching order history
export interface OrderHistoryFilters {
  orderId?: string;
  crewId?: string;
  changeType?: OrderHistoryChangeType;
  startDate?: string;
  endDate?: string;
}
