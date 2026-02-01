import { httpClient } from './client';
import type {
  InventoryItem,
  InventoryBatch,
  InventoryHistoryEntry,
  InventoryHistoryFilters,
  AssignedInventoryItem,
  EquipmentInstance,
} from '@/types/Inventory';

/**
 * Servicio de Inventario
 * Consume los endpoints de /api/web/inventory
 */
class InventoryService {
  /**
   * GET /api/web/crews?id=<crewId>
   * Obtener inventario de la cuadrilla
   */
  async getCrewInventory(crewId: string): Promise<AssignedInventoryItem[]> {
    // El API devuelve el objeto crew directamente con assignedInventory como propiedad
    const response = await httpClient.get<any>(
      `/api/web/crews?id=${crewId}`
    );

    // La respuesta puede tener la estructura { assignedInventory: [...] } o ser el crew completo
    const crew = response.data;

    // Verificar si es un array (lista de crews) o un objeto (crew individual)
    if (Array.isArray(crew)) {
      console.warn('Se esperaba un crew individual, se recibió un array');
      return [];
    }

    // Retornar el inventario asignado o array vacío
    return crew?.assignedInventory || [];
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
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const response = await httpClient.get<InventoryHistoryEntry[] | { data: InventoryHistoryEntry[], pagination: any }>(
      '/api/web/inventory-histories',
      { params }
    );

    // Si retorna paginación, devolver solo data (o adaptar según necesites)
    if (!Array.isArray(response.data) && 'data' in response.data) {
      return (response.data as any).data;
    }
    return response.data as InventoryHistoryEntry[];
  }

  /**
   * GET /api/web/inventory/:id
   * Obtener detalle de un ítem de inventario
   */
  async getInventoryItemById(itemId: string): Promise<InventoryItem> {
    const response = await httpClient.get<InventoryItem>(
      `/api/web/inventory?id=${itemId}`
    );

    return response.data;
  }

  /**
   * GET /api/web/inventory/batches/:batchCode
   * Obtener detalle de un lote/bobina
   */
  async getBatchByCode(batchCode: string): Promise<InventoryBatch> {
    const response = await httpClient.get<InventoryBatch>(
      `/api/web/inventory/batches?code=${batchCode}`
    );

    return response.data;
  }

  /**
   * GET /api/web/inventory/instances?inventoryId=<id>&status=<status>
   * Obtener instancias de un equipo
   */
  async getEquipmentInstances(inventoryId: string, status?: string, crewId?: string): Promise<EquipmentInstance[]> {
    const params: any = { inventoryId };
    if (status) params.status = status;
    if (crewId) params.crewId = crewId;

    console.log('[inventoryService.getEquipmentInstances] Request params:', params);

    const response = await httpClient.get<{ success: boolean; instances: EquipmentInstance[] }>(
      '/api/web/inventory/instances',
      { params }
    );

    // console.log('[inventoryService.getEquipmentInstances] Response:', {
    //   success: response.data.success,
    //   instanceCount: response.data.instances?.length || 0,
    //   instances: response.data.instances
    // });

    return response.data.instances || [];
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
  getEquipmentInstances,
} = inventoryService;
