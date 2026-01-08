import { useState, useCallback } from 'react';
import inventoryService from '@/services/api/inventory';
import type { EquipmentInstance } from '@/types/Inventory';

interface UseEquipmentInstancesReturn {
  instances: EquipmentInstance[];
  loading: boolean;
  error: string | null;
  fetchInstances: (inventoryId: string, status?: string) => Promise<void>;
}

/**
 * Hook for fetching equipment instances for a specific inventory item
 */
export const useEquipmentInstances = (): UseEquipmentInstancesReturn => {
  const [instances, setInstances] = useState<EquipmentInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = useCallback(async (inventoryId: string, status?: string) => {
    if (!inventoryId) {
      setInstances([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getEquipmentInstances(inventoryId, status);
      setInstances(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar instancias');
      console.error('Error fetching equipment instances:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    instances,
    loading,
    error,
    fetchInstances,
  };
};
