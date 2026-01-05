import { useState, useEffect, useCallback } from 'react';
import installerService from '@/services/api/installers';
import type { Installer, UpdateInstallerProfile } from '@/types/Installer';

interface UseInstallerReturn {
  installer: Installer | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: UpdateInstallerProfile) => Promise<void>;
  updateOnDutyStatus: (onDuty: import('@/types/Installer').OnDutyStatus) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing installer profile
 * @param installerId - ID of the installer
 */
export const useInstaller = (installerId: string): UseInstallerReturn => {
  const [installer, setInstaller] = useState<Installer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstaller = useCallback(async () => {
    if (!installerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await installerService.getInstallerById(installerId);
      setInstaller(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar perfil');
      console.error('Error fetching installer:', err);
    } finally {
      setLoading(false);
    }
  }, [installerId]);

  const updateProfile = useCallback(async (data: UpdateInstallerProfile) => {
    if (!installerId) return;

    try {
      setError(null);
      const updated = await installerService.updateProfile(installerId, data);
      setInstaller(updated);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
      console.error('Error updating profile:', err);
      throw err;
    }
  }, [installerId]);

  const updateOnDutyStatus = useCallback(async (onDuty: import('@/types/Installer').OnDutyStatus) => {
    if (!installerId) return;

    try {
      setError(null);
      const updated = await installerService.updateOnDutyStatus(installerId, onDuty);
      setInstaller(updated);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado');
      console.error('Error updating onDuty:', err);
      throw err;
    }
  }, [installerId]);

  useEffect(() => {
    fetchInstaller();
  }, [fetchInstaller]);

  return {
    installer,
    loading,
    error,
    updateProfile,
    updateOnDutyStatus,
    refetch: fetchInstaller,
  };
};
