import { useState, useEffect, useCallback } from 'react';
import orderService from '@/services/api/orders';
import type { 
  Order, 
  OrderFilters, 
  OrderStatus, 
  OrderCompletionData,
  Coordinates,
  InternetTestResult,
  UpdateInternetTestData,
} from '@/types/Order';

interface UseOrdersReturn {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => void;
  selectOrder: (orderId: string | null) => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateCoordinates: (orderId: string, coordinates: Coordinates) => Promise<void>;
  updateInternetTest: (orderId: string, data: UpdateInternetTestData) => Promise<void>;
  startOrder: (orderId: string, coordinates?: Coordinates) => Promise<void>;
  completeOrder: (orderId: string, data: OrderCompletionData) => Promise<void>;
}

/**
 * Hook for managing orders for a crew
 * @param crewId - ID of the crew
 * @param filters - Optional filters for orders
 */
export const useOrders = (crewId: string, filters?: OrderFilters): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  // Reset pagination when filters or crewId change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setOrders([]);
    // We trigger fetch via a separate effect or direct call? 
    // Ideally, we want to reset and then fetch.
    // Let's modify the fetchOrders to handle the reset or rely on a `refresh` dependency
  }, [crewId, JSON.stringify(filters)]);

  // Fetch orders
  const fetchOrders = useCallback(async (reset = false) => {
    if (!crewId) {
      setLoading(false);
      return;
    }

    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const data = await orderService.getCrewOrders(crewId, filters, currentPage, LIMIT);
      
      // Add null safety checks
      if (data && data.items && Array.isArray(data.items)) {
        setOrders(prev => reset ? data.items : [...prev, ...data.items]);
        setHasMore(data.items.length === LIMIT);
        
        if (!reset) {
          setPage(prev => prev + 1);
        } else {
           // If reset, next page is 2
           setPage(2);
        }
      } else {
        // Fallback for unexpected response format
        console.warn('Unexpected API response format:', data);
        setOrders([]);
        setHasMore(false);
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar órdenes');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [crewId, filters, page]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
        fetchOrders(false);
    }
  }, [loading, loadingMore, hasMore, fetchOrders]);

  const refetch = useCallback(() => {
      return fetchOrders(true);
  }, [fetchOrders]);

  // Select an order by ID
  const selectOrder = useCallback(async (orderId: string | null) => {
    if (!orderId) {
      setSelectedOrder(null);
      return;
    }

    try {
      setError(null);
      const order = await orderService.getOrderById(orderId);
      setSelectedOrder(order);
    } catch (err: any) {
      setError(err.message || 'Error al cargar orden');
      console.error('Error selecting order:', err);
    }
  }, []);

  // Update order status
  const updateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      setError(null);
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      
      // Update in list
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      
      // Update selected if it's the same
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado');
      console.error('Error updating status:', err);
      throw err;
    }
  }, [selectedOrder]);

  // Update order coordinates
  const updateCoordinates = useCallback(async (orderId: string, coordinates: Coordinates) => {
    try {
      setError(null);
      const updatedOrder = await orderService.updateOrderCoordinates(orderId, coordinates);
      
      // Update in list
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      
      // Update selected if it's the same
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar coordenadas');
      console.error('Error updating coordinates:', err);
      throw err;
    }
  }, [selectedOrder]);

  // Update internet test data
  const updateInternetTest = useCallback(async (orderId: string, data: UpdateInternetTestData) => {
    try {
      setError(null);
      const updatedOrder = await orderService.updateInternetTest(orderId, data);
      
      // Update in list
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      
      // Update selected if it's the same
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar prueba de internet');
      console.error('Error updating internet test:', err);
      throw err;
    }
  }, [selectedOrder]);

  // Start an order (change to in_progress)
  const startOrder = useCallback(async (orderId: string, coordinates?: Coordinates) => {
    try {
      setError(null);
      const updatedOrder = await orderService.startOrder(orderId, coordinates);
      
      // Update in list
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      
      // Update selected if it's the same
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar orden');
      console.error('Error starting order:', err);
      throw err;
    }
  }, [selectedOrder]);

  // Complete an order
  const completeOrder = useCallback(async (orderId: string, data: OrderCompletionData) => {
    try {
      setError(null);
      const updatedOrder = await orderService.completeOrder(orderId, data);
      
      // Update in list
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      
      // Update selected if it's the same
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err: any) {
      setError(err.message || 'Error al completar orden');
      console.error('Error completing order:', err);
      throw err;
    }
  }, [selectedOrder]);

  // Fetch orders on mount and when filters change
  useEffect(() => {
    if (crewId) {
      fetchOrders(true); // Reset to page 1 when filters or crew change
    }
  }, [crewId, JSON.stringify(filters)]);

  return {
    orders,
    selectedOrder,
    loading,
    loadingMore,
    hasMore,
    error,
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
