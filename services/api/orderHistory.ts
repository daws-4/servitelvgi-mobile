import { httpClient } from './client';
import type { OrderHistory, OrderHistoryFilters } from '@/types/orderHistory';

/**
 * Service for Order History
 * Consumes /api/web/order-histories endpoints
 */
class OrderHistoryService {
  /**
   * GET /api/web/order-histories
   * Get order history with optional filters
   */
  async getOrderHistories(filters?: OrderHistoryFilters): Promise<OrderHistory[]> {
    const params: any = {};
    
    if (filters?.orderId) params.orderId = filters.orderId;
    if (filters?.crewId) params.crewId = filters.crewId;
    if (filters?.changeType) params.changeType = filters.changeType;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    
    const response = await httpClient.get<OrderHistory[]>('/api/web/order-histories', { params });
    return response.data;
  }

  /**
   * GET /api/web/order-histories?orderId=xxx
   * Get history for a specific order
   */
  async getOrderHistoryByOrderId(orderId: string): Promise<OrderHistory[]> {
    return this.getOrderHistories({ orderId });
  }

  /**
   * GET /api/web/order-histories?crewId=xxx
   * Get history for a specific crew
   */
  async getOrderHistoryByCrewId(crewId: string, filters?: Omit<OrderHistoryFilters, 'crewId'>): Promise<OrderHistory[]> {
    return this.getOrderHistories({ ...filters, crewId });
  }
}

// Create singleton instance
const orderHistoryService = new OrderHistoryService();

// Export service and methods
export default orderHistoryService;

export const {
  getOrderHistories,
  getOrderHistoryByOrderId,
  getOrderHistoryByCrewId,
} = orderHistoryService;
