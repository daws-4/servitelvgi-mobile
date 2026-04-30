import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import orderService from '@/services/api/orders';
import type {
  Order,
  OrderFilters,
  OrderStatus,
  OrderCompletionData,
  Coordinates,
  UpdateInternetTestData,
} from '@/types/Order';

interface UseOrdersReturn {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refetch: (options?: { silent?: boolean; force?: boolean }) => Promise<void>;
  loadMore: () => void;
  selectOrder: (orderId: string | null) => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateCoordinates: (orderId: string, coordinates: Coordinates) => Promise<void>;
  updateInternetTest: (orderId: string, data: UpdateInternetTestData) => Promise<void>;
  startOrder: (orderId: string, coordinates?: Coordinates) => Promise<void>;
  completeOrder: (orderId: string, data: OrderCompletionData, statusOverride?: string) => Promise<void>;
}

/**
 * Hook for managing orders for a crew
 * Uses React Query Infinite Scroll
 * @param crewId - ID of the crew
 * @param filters - Optional filters for orders
 */
export const useOrders = (crewId: string, filters?: OrderFilters, limit: number = 10): UseOrdersReturn => {
  const queryClient = useQueryClient();
  const LIMIT = limit;
  // Calculate 30 days ago for optimization - MEMOIZED to prevent infinite loop
  const effectiveFilters = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 40);

    // If searching, we want global history, so we skip the date filter
    if (filters?.search) {
      return { ...filters };
    }

    return {
      updatedAfter: thirtyDaysAgo.toISOString(),
      ...filters
    };
  }, [JSON.stringify(filters)]);

  // Key includes filters to separate lists
  const queryKey = ['orders', crewId, JSON.stringify(effectiveFilters), limit];

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Infinite Query for pagination
  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage: hasMore,
    error: queryError,
    fetchNextPage,
    refetch: queryRefetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      // If no crewId, return empty result strictly
      if (!crewId) return { items: [], total: 0 };

      const res = await orderService.getCrewOrders(crewId, effectiveFilters, pageParam as number, LIMIT);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.items || lastPage.items.length < LIMIT) {
        return undefined; // Reached end
      }
      return allPages.length + 1; // Next page index
    },
    enabled: !!crewId,
    staleTime: 1000 * 60 * 6, // 6 minutes - reduces Vercel API invocations
    gcTime: 1000 * 60 * 12,   // 12 minutes - keep cache warm between navigations
  });

  // Flatten items
  const orders = data?.pages.flatMap((page) => page.items) || [];

  // Helper to update an order in the cache (Optimistic Update pattern)
  const updateOrderInCache = useCallback((updatedOrder: Order) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((order: Order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          ),
        })),
      };
    });
  }, [queryClient, queryKey]);

  // Load More wrapper
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchNextPage();
    }
  }, [hasMore, loadingMore, loading, fetchNextPage]);

  // Refetch wrapper
  const refetch = async (options?: { silent?: boolean; force?: boolean }) => {
    await queryRefetch();
  };

  // Select Order
  const selectOrder = useCallback(async (orderId: string | null) => {
    if (!orderId) {
      setSelectedOrder(null);
      return;
    }

    // 1. Try to find in cache first
    const cachedOrder = orders.find(o => o._id === orderId);
    if (cachedOrder) {
      setSelectedOrder(cachedOrder);
    }

    // 2. Refresh details from API (keep existing logic)
    try {
      const order = await orderService.getOrderById(orderId);
      setSelectedOrder(order);
    } catch (err) {
      console.error('Error fetching order details:', err);
      // Keep cached version if fetch fails
    }
  }, [orders]);


  // Update Status
  const updateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      updateOrderInCache(updatedOrder);
      if (selectedOrder?._id === orderId) setSelectedOrder(updatedOrder);
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  }, [updateOrderInCache, selectedOrder]);

  // Update Coordinates
  const updateCoordinates = useCallback(async (orderId: string, coordinates: Coordinates) => {
    try {
      const updatedOrder = await orderService.updateOrderCoordinates(orderId, coordinates);
      updateOrderInCache(updatedOrder);
      if (selectedOrder?._id === orderId) setSelectedOrder(updatedOrder);
    } catch (err) {
      console.error('Error updating coordinates:', err);
      throw err;
    }
  }, [updateOrderInCache, selectedOrder]);

  // Update Internet Test
  const updateInternetTest = useCallback(async (orderId: string, data: UpdateInternetTestData) => {
    try {
      const updatedOrder = await orderService.updateInternetTest(orderId, data);
      updateOrderInCache(updatedOrder);
      if (selectedOrder?._id === orderId) setSelectedOrder(updatedOrder);
    } catch (err) {
      console.error('Error updating internet test:', err);
      throw err;
    }
  }, [updateOrderInCache, selectedOrder]);

  // Start Order
  const startOrder = useCallback(async (orderId: string, coordinates?: Coordinates) => {
    try {
      const updatedOrder = await orderService.startOrder(orderId, coordinates);
      updateOrderInCache(updatedOrder);
      if (selectedOrder?._id === orderId) setSelectedOrder(updatedOrder);
    } catch (err) {
      console.error('Error starting order:', err);
      throw err;
    }
  }, [updateOrderInCache, selectedOrder]);

  // Complete Order
  const completeOrder = useCallback(async (orderId: string, data: OrderCompletionData, statusOverride?: string) => {
    try {
      const updatedOrder = await orderService.completeOrder(orderId, data, statusOverride);
      updateOrderInCache(updatedOrder);
      if (selectedOrder?._id === orderId) setSelectedOrder(updatedOrder);
    } catch (err) {
      console.error('Error completing order:', err);
      throw err;
    }
  }, [updateOrderInCache, selectedOrder]);

  return {
    orders,
    selectedOrder,
    loading,
    loadingMore, // isFetchingNextPage
    hasMore,
    error: queryError ? (queryError as Error).message : null,
    refetch,
    loadMore,
    selectOrder,
    updateStatus,
    updateCoordinates,
    updateInternetTest,
    startOrder,
    completeOrder,
  };
};
