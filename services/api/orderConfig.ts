import { httpClient } from './client';

/**
 * Tipos de la configuración del servidor
 */
export interface ServerStatusConfig {
  label: string;
  color: string;
  icon: string;
  badgeClass?: string;
  dotColor?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  description?: string;
  isTerminal: boolean;
  countsAsCompleted: boolean;
  chipVariant?: string;
}

export interface ServerTypeConfig {
  label: string;
  icon: string;
  color: string;
}

export interface OrderConfigResponse {
  success: boolean;
  data: {
    statuses: Record<string, ServerStatusConfig>;
    types: Record<string, ServerTypeConfig>;
    validStatuses: string[];
    completedStatuses: string[];
    terminalStatuses: string[];
  };
}

/**
 * Servicio para obtener la configuración dinámica de statuses y tipos de orden
 * desde el endpoint GET /api/web/order-config
 */
class OrderConfigService {
  /**
   * GET /api/web/order-config
   * Obtiene configuración completa de statuses y tipos
   */
  async getOrderConfig(): Promise<OrderConfigResponse['data']> {
    const response = await httpClient.get<OrderConfigResponse>('/api/web/order-config');

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error('Invalid order config response');
  }
}

const orderConfigService = new OrderConfigService();
export default orderConfigService;
