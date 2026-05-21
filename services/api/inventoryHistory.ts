import { httpClient } from './client';

import type { InventoryHistory, InventoryHistoryFilters } from '@/types/inventoryHistory';

/**
 * Service for Inventory History
 * Consumes /api/web/inventory-histories endpoints
 */
class InventoryHistoryService {
  /**
   * GET /api/web/inventory-histories
   * Get inventory history with optional filters
   */
  async getInventoryHistories(filters?: InventoryHistoryFilters): Promise<InventoryHistory[]> {
    const params: any = {};

    if (filters?.itemId) params.itemId = filters.itemId;
    if (filters?.crewId) params.crewId = filters.crewId;
    if (filters?.orderId) params.orderId = filters.orderId;
    if (filters?.type) params.type = filters.type;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const response = await httpClient.get<InventoryHistory[]>('/api/web/inventory-histories', {
      params,
    });
    return response.data;
  }

  /**
   * GET /api/web/inventory-histories?crewId=xxx
   * Get history for a specific crew
   */
  async getInventoryHistoryByCrewId(
    crewId: string,
    filters?: Omit<InventoryHistoryFilters, 'crewId'>
  ): Promise<InventoryHistory[]> {
    return this.getInventoryHistories({ ...filters, crewId });
  }

  /**
   * GET /api/web/inventory-histories?itemId=xxx
   * Get history for a specific item
   */
  async getInventoryHistoryByItemId(
    itemId: string,
    filters?: Omit<InventoryHistoryFilters, 'itemId'>
  ): Promise<InventoryHistory[]> {
    return this.getInventoryHistories({ ...filters, itemId });
  }

  /**
   * GET /api/web/inventory-histories?orderId=xxx
   * Get history for a specific order
   */
  async getInventoryHistoryByOrderId(
    orderId: string,
    filters?: Omit<InventoryHistoryFilters, 'orderId'>
  ): Promise<InventoryHistory[]> {
    return this.getInventoryHistories({ ...filters, orderId });
  }
}

// Create singleton instance
const inventoryHistoryService = new InventoryHistoryService();

// Export service and methods
export default inventoryHistoryService;

export const {
  getInventoryHistories,
  getInventoryHistoryByCrewId,
  getInventoryHistoryByItemId,
  getInventoryHistoryByOrderId,
} = inventoryHistoryService;
