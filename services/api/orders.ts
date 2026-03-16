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
   * GET /api/web/orders?assignedTo=<crewId>&page=1&limit=10
   * Obtener órdenes asignadas a una cuadrilla con paginación
   * Note: Handles both old (array) and new (paginated) response formats
   */
  async getCrewOrders(crewId: string, filters?: OrderFilters, page: number = 1, limit: number = 50): Promise<{ items: Order[], total: number }> {
    const params: any = { assignedTo: crewId, page, limit, sort: '-createdAt' };

    if (filters?.status) {
      params.status = Array.isArray(filters.status)
        ? filters.status.join(',')
        : filters.status;
    }
    if (filters?.type) params.type = filters.type;
    if (filters?.updatedAfter) params.updatedAfter = filters.updatedAfter;
    if (filters?.search) params.search = filters.search;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const response = await httpClient.get<any>('/api/web/orders', { params });

    // Handle both old (array) and new (paginated object) response formats
    if (Array.isArray(response.data)) {
      // Old format - just an array, do client-side pagination
      const start = (page - 1) * limit;
      const items = response.data.slice(start, start + limit);
      return { items, total: response.data.length };
    } else if (response.data && response.data.data && response.data.pagination) {
      // New format - universal backend pagination
      return {
        items: response.data.data,
        total: response.data.pagination.total
      };
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      // Alternate new format 
      return response.data;
    } else {
      // Unexpected format
      console.error('Unexpected API response:', response.data);
      return { items: [], total: 0 };
    }
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
  async completeOrder(orderId: string, data: OrderCompletionData, statusOverride?: 'completed' | 'completed_special'): Promise<Order> {
    const payload: Partial<Order> = {
      status: (statusOverride || 'completed') as OrderStatus,
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
   * POST /api/web/orders
   * Crear una nueva orden (principalmente para órdenes de recuperación)
   */
  async createOrder(data: Partial<Order>): Promise<Order> {
    const response = await httpClient.post<Order>('/api/web/orders', data);
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

  /**
   * DELETE /api/web/upload/signature?orderId=xxx
   * Eliminar firma del cliente
   */
  async deleteSignature(orderId: string): Promise<void> {
    await httpClient.delete('/api/web/upload/signature', {
      params: { orderId }
    });
  }

  /**
   * POST /api/web/upload/signature
   * Subir firma del cliente a PocketBase
   */
  async uploadSignature(orderId: string, imageUri: string): Promise<string> {
    const formData = new FormData();
    formData.append('order_id', orderId);

    // Create file object for React Native
    const file = {
      uri: imageUri,
      type: 'image/jpeg', // We convert to jpeg in UI
      name: `signature_${orderId}_${Date.now()}.jpg`,
    } as any;

    formData.append('image', file);

    console.log('📝 [OrderService] Uploading signature via Backend Proxy...');
    console.log('📝 [OrderService] URI:', imageUri);

    const apiResponse = await httpClient.post<{ success: boolean; url: string }>('/api/web/upload/signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return apiResponse.data.url;
  }

  /**
   * POST /api/web/upload/signature (Mobile Flow)
   * Notificar al backend que se subió una firma a PocketBase (isobile=true)
   */
  async saveSignatureUrl(orderId: string, signatureUrl: string): Promise<void> {
    const formData = new FormData();
    formData.append('order_id', orderId);
    formData.append('mobile', 'true');
    formData.append('signature_url', signatureUrl);

    await httpClient.post('/api/web/upload/signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  createOrder,
  getAvailableOrders,
  saveSignatureUrl,
  uploadSignature,
  deleteSignature,
} = orderService;

