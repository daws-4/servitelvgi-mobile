import { useState, useEffect, useCallback } from 'react';
import crewService from '@/services/api/crews';
import type { Crew } from '@/types/Crew';
import type { Installer } from '@/types/Installer';
import type { AssignedInventoryItem } from '@/types/Inventory';

interface UseCrewReturn {
  crew: Crew | null;
  members: Installer[];
  inventory: AssignedInventoryItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching crew details
 * @param crewId - ID of the crew
 */
export const useCrew = (crewId: string): UseCrewReturn => {
  const [crew, setCrew] = useState<Crew | null>(null);
  const [members, setMembers] = useState<Installer[]>([]);
  const [inventory, setInventory] = useState<AssignedInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrew = useCallback(async () => {
    if (!crewId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [crewData, crewMembers] = await Promise.all([
        crewService.getCrewById(crewId),
        crewService.getCrewMembers(crewId),
      ]);
      
      setCrew(crewData);
      setMembers(crewMembers);
      setInventory(crewData.assignedInventory || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cuadrilla');
      console.error('Error fetching crew:', err);
    } finally {
      setLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  return {
    crew,
    members,
    inventory,
    loading,
    error,
    refetch: fetchCrew,
  };
};
