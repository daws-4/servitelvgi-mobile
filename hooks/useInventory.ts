import { useState, useEffect, useCallback } from 'react';
import inventoryService from '@/services/api/inventory';
import type { AssignedInventoryItem } from '@/types/Inventory';

interface UseInventoryReturn {
  inventory: AssignedInventoryItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing crew inventory
 * @param crewId - ID of the crew
 */
export const useInventory = (crewId: string): UseInventoryReturn => {
  const [inventory, setInventory] = useState<AssignedInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    if (!crewId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getCrewInventory(crewId);
      setInventory(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar inventario');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
  };
};
