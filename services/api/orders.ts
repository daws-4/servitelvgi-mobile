import { httpClient } from './client';
import type { 
  Order, 
  OrderSummary,
  OrderFilters, 
  OrderCompletionData,
  OrderStatus 
} from '@/types/Order';
import type { ApiResponse } from '@/types/api';

/**
 * Servicio de Órdenes
 * Consume los endpoints de /api/web/orders
 */
class OrderService {
  /**
   * GET /api/web/orders?assignedTo=<crewId>
   * Obtener órdenes asignadas a una cuadrilla
   */
  async getCrewOrders(crewId: string, filters?: OrderFilters): Promise<Order[]> {
    const params: any = { assignedTo: crewId };
    
    if (filters?.status) {
      params.status = Array.isArray(filters.status) 
        ? filters.status.join(',') 
        : filters.status;
    }
    if (filters?.type) params.type = filters.type;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    
    const response = await httpClient.get<Order[]>('/api/web/orders', { params });
    return response.data;
  }

  /**
   * GET /api/web/orders/:id
   * Obtener detalle de una orden
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await httpClient.get<Order>(`/api/web/orders/${orderId}`);
    return response.data;
  }

  /**
   * PUT /api/web/orders/:id
   * Actualizar estado y datos de una orden
   */
  async updateOrder(orderId: string, data: Partial<Order>): Promise<Order> {
    const response = await httpClient.put<Order>(`/api/web/orders/${orderId}`, data);
    return response.data;
  }

  /**
   * PUT /api/web/orders/:id
   * Actualizar estado de una orden
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return this.updateOrder(orderId, { status });
  }

  /**
   * PUT /api/web/orders/:id
   * Completar una orden con materiales, fotos y firma
   */
  async completeOrder(orderId: string, data: OrderCompletionData): Promise<Order> {
    const payload = {
      status: 'completed' as OrderStatus,
      materialsUsed: data.materialsUsed,
      photos: data.photos,
      signature: data.signature,
      speedTest: data.speedTest,
      notes: data.notes,
      completionDate: new Date().toISOString(),
    };

    const response = await httpClient.put<Order>(
      `/api/web/orders/${orderId}`,
      payload
    );
    
    return response.data;
  }

  /**
   * GET /api/web/orders (sin filtros de crew)
   * Obtener todas las órdenes disponibles (para asignar)
   */
  async getAvailableOrders(): Promise<Order[]> {
    const response = await httpClient.get<Order[]>('/api/web/orders', {
      params: { status: 'pending' }
    });
    return response.data;
  }
}

// Crear instancia singleton
const orderService = new OrderService();

// Exportar servicio y métodos
export default orderService;

export const {
  getCrewOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  completeOrder,
  getAvailableOrders,
} = orderService;
