import { useQuery, useQueryClient } from '@tanstack/react-query';

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
 * Uses React Query for caching
 * @param crewId - ID of the crew
 */
export const useInventory = (crewId: string): UseInventoryReturn => {
  const queryClient = useQueryClient();

  const {
    data: inventory = [],
    isLoading: loading,
    error: queryError,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ['inventory', crewId],
    queryFn: () => inventoryService.getCrewInventory(crewId),
    enabled: !!crewId,
    staleTime: 1000 * 60 * 6, // 6 minutes - reduces Vercel API invocations
  });

  // Wrapper for refetch to match Promise<void> signature
  const refetch = async () => {
    await queryRefetch();
  };

  return {
    inventory,
    loading,
    error: queryError ? (queryError as Error).message : null,
    refetch,
  };
};
