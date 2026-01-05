import { httpClient } from './client';
import type { 
  Order, 
  OrderSummary,
  OrderFilters, 
  OrderCompletionData,
  OrderStatus,
  Coordinates,
  InternetTestResult,
  UpdateInternetTestData,
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
    const response = await httpClient.get<Order>(`/api/web/orders?id=${orderId}`);
    return response.data;
  }

  /**
   * PUT /api/web/orders/:id
   * Actualizar estado y datos de una orden
   */
  async updateOrder(orderId: string, data: Partial<Order>): Promise<Order> {
    // Backend expects ID in the body for PUT requests, similar to installers
    const payload = {
      _id: orderId,
      ...data
    };
    const response = await httpClient.put<Order>('/api/web/orders', payload);
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
   * Actualizar coordenadas de una orden
   */
  async updateOrderCoordinates(orderId: string, coordinates: Coordinates): Promise<Order> {
    return this.updateOrder(orderId, { coordinates });
  }

  /**
   * PUT /api/web/orders/:id
   * Actualizar prueba de internet de una orden
   */
  async updateInternetTest(orderId: string, data: UpdateInternetTestData): Promise<Order> {
    const payload: Partial<Order> = {
      internetTest: data.internetTest,
    };
    
    // Si se proporcionan coordenadas, actualizarlas también
    if (data.coordinates) {
      payload.coordinates = data.coordinates;
    }
    
    return this.updateOrder(orderId, payload);
  }

  /**
   * PUT /api/web/orders/:id
   * Iniciar una orden (cambiar a in_progress)
   */
  async startOrder(orderId: string, coordinates?: Coordinates): Promise<Order> {
    const payload: Partial<Order> = {
      status: 'in_progress' as OrderStatus,
    };
    
    if (coordinates) {
      payload.coordinates = coordinates;
    }
    
    return this.updateOrder(orderId, payload);
  }

  /**
   * PUT /api/web/orders/:id
   * Completar una orden con materiales, fotos, firma y prueba de internet
   */
  async completeOrder(orderId: string, data: OrderCompletionData): Promise<Order> {
    const payload: Partial<Order> = {
      status: 'completed' as OrderStatus,
      materialsUsed: data.materialsUsed,
      photoEvidence: data.photoEvidence,
      customerSignature: data.customerSignature,
      completionDate: new Date().toISOString(),
    };

    // Agregar prueba de internet si existe
    if (data.internetTest) {
      payload.internetTest = data.internetTest;
    }

    // Agregar detalles del reporte si existen
    if (data.reportDetails) {
      payload.reportDetails = data.reportDetails;
    }

    // Agregar coordenadas de cierre si existen
    if (data.coordinates) {
      payload.coordinates = data.coordinates;
    }

    // Include _id in the payload for the backend to identify the order
    (payload as any)._id = orderId;

    const response = await httpClient.put<Order>(
      '/api/web/orders',
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
  updateOrderCoordinates,
  updateInternetTest,
  startOrder,
  completeOrder,
  getAvailableOrders,
} = orderService;
