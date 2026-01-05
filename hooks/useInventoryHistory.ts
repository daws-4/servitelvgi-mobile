import { useState, useEffect, useCallback } from 'react';
import inventoryHistoryService from '@/services/api/inventoryHistory';
import type { InventoryHistory, InventoryHistoryFilters } from '@/types/inventoryHistory';

interface UseInventoryHistoryReturn {
  history: InventoryHistory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching inventory history
 * @param filters - Filters for inventory history
 */
export const useInventoryHistory = (filters?: InventoryHistoryFilters): UseInventoryHistoryReturn => {
  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryHistoryService.getInventoryHistories(filters);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar historial');
      console.error('Error fetching inventory history:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
};
