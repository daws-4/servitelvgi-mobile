import { useState, useCallback } from 'react';
import inventoryService from '@/services/api/inventory';
import type { EquipmentInstance } from '@/types/Inventory';

interface UseEquipmentInstancesReturn {
  instances: EquipmentInstance[];
  loading: boolean;
  error: string | null;
  fetchInstances: (inventoryId: string, status?: string, crewId?: string) => Promise<void>;
}

/**
 * Hook for fetching equipment instances for a specific inventory item
 */
export const useEquipmentInstances = (): UseEquipmentInstancesReturn => {
  const [instances, setInstances] = useState<EquipmentInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = useCallback(async (inventoryId: string, status?: string, crewId?: string) => {
    // console.log('[useEquipmentInstances] fetchInstances called with:', { inventoryId, status, crewId });

    if (!inventoryId) {
      // console.log('[useEquipmentInstances] No inventoryId provided, clearing instances');
      setInstances([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // console.log('[useEquipmentInstances] Calling API...');
      let data = await inventoryService.getEquipmentInstances(inventoryId, status, crewId);
      // console.log('[useEquipmentInstances] Raw API response:', JSON.stringify(data, null, 2));
      // console.log('[useEquipmentInstances] Number of instances received:', data?.length || 0);

      // Client-side filtering as backup in case backend doesn't filter by crewId
      if (crewId && data && data.length > 0) {
        // console.log('[useEquipmentInstances] Applying client-side crewId filter:', crewId);
        const beforeFilter = data.length;
        data = data.filter(instance => {
          // Handle both populated object {_id: "..."} and string ID cases
          const rawCrewId = instance.assignedTo?.crewId;
          let instanceCrewId: string | undefined;

          if (typeof rawCrewId === 'string') {
            instanceCrewId = rawCrewId;
          } else if (rawCrewId && typeof rawCrewId === 'object') {
            instanceCrewId = (rawCrewId as any)._id?.toString() || (rawCrewId as any).toString();
          }

          console.log(`[useEquipmentInstances] Instance ${instance.uniqueId}: rawCrewId type=${typeof rawCrewId}, extracted=${instanceCrewId}, matches=${instanceCrewId === crewId}`);
          return instanceCrewId === crewId;
        });
        console.log(`[useEquipmentInstances] Filtered from ${beforeFilter} to ${data.length} instances`);
      }

      setInstances(data || []);
      console.log('[useEquipmentInstances] Final instances set:', data?.length || 0);
    } catch (err: any) {
      console.error('[useEquipmentInstances] Error:', err.message, err);
      setError(err.message || 'Error al cargar instancias');
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
