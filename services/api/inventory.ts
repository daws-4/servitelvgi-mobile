import { httpClient } from './client';
import type {
  InventoryItem,
  InventoryBatch,
  InventoryHistoryEntry,
  InventoryHistoryFilters,
  AssignedInventoryItem,
} from '@/types/Inventory';

/**
 * Servicio de Inventario
 * Consume los endpoints de /api/web/inventory
 */
class InventoryService {
  /**
   * GET /api/web/inventory
   * Obtener inventario de la cuadrilla
   */
  async getCrewInventory(crewId: string): Promise<AssignedInventoryItem[]> {
    const response = await httpClient.get<{ assignedInventory: AssignedInventoryItem[] }>(
      `/api/web/crews/${crewId}`
    );
    
    return response.data.assignedInventory || [];
  }

  /**
   * GET /api/web/inventory/batches?crewId=<crewId>
   * Obtener bobinas asignadas a la cuadrilla
   */
  async getCrewBatches(crewId: string): Promise<InventoryBatch[]> {
    const response = await httpClient.get<InventoryBatch[]>(
      '/api/web/inventory/batches',
      { params: { crewId } }
    );
    
    return response.data;
  }

  /**
   * GET /api/web/inventory/history?crewId=<crewId>
   * Obtener historial de movimientos de inventario
   */
  async getInventoryHistory(
    crewId: string,
    filters?: InventoryHistoryFilters
  ): Promise<InventoryHistoryEntry[]> {
    const params: any = { crewId };
    
    if (filters?.itemId) params.itemId = filters.itemId;
    if (filters?.type) params.type = filters.type;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    
    const response = await httpClient.get<InventoryHistoryEntry[]>(
      '/api/web/inventory/history',
      { params }
    );
    
    return response.data;
  }

  /**
   * GET /api/web/inventory/:id
   * Obtener detalle de un ítem de inventario
   */
  async getInventoryItemById(itemId: string): Promise<InventoryItem> {
    const response = await httpClient.get<InventoryItem>(
      `/api/web/inventory/${itemId}`
    );
    
    return response.data;
  }

  /**
   * GET /api/web/inventory/batches/:batchCode
   * Obtener detalle de un lote/bobina
   */
  async getBatchByCode(batchCode: string): Promise<InventoryBatch> {
    const response = await httpClient.get<InventoryBatch>(
      `/api/web/inventory/batches/${batchCode}`
    );
    
    return response.data;
  }
}

// Crear instancia singleton
const inventoryService = new InventoryService();

// Exportar servicio y métodos
export default inventoryService;

export const {
  getCrewInventory,
  getCrewBatches,
  getInventoryHistory,
  getInventoryItemById,
  getBatchByCode,
} = inventoryService;
