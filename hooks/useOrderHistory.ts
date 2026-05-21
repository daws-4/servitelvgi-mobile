import { useState, useEffect, useCallback } from 'react';

import orderHistoryService from '@/services/api/orderHistory';
import type { OrderHistory, OrderHistoryFilters } from '@/types/orderHistory';

interface UseOrderHistoryReturn {
  history: OrderHistory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching order history
 * @param orderId - Optional order ID to filter by
 * @param filters - Optional additional filters
 */
export const useOrderHistory = (
  orderId?: string,
  filters?: OrderHistoryFilters
): UseOrderHistoryReturn => {
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters = { ...filters, orderId };
      const data = await orderHistoryService.getOrderHistories(combinedFilters);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar historial');
      console.error('Error fetching order history:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId, filters]);

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
