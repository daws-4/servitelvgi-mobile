import { useState, useCallback } from 'react';

import uploadsService from '@/services/api/uploads';

interface UseOrderEvidenceReturn {
  uploading: boolean;
  deleting: boolean;
  error: string | null;
  uploadEvidence: (
    orderId: string,
    installerId: string,
    crewId: string,
    imageUri: string
  ) => Promise<{ success: boolean; recordId?: string; url?: string; error?: string }>;
  deleteEvidence: (
    recordId: string,
    orderId: string
  ) => Promise<{ success: boolean; error?: string }>;
  getImageUrl: (recordId: string, thumb?: string) => Promise<string>;
  clearError: () => void;
}

/**
 * Hook for handling order photo evidence uploads via backend service
 * Uses /api/web/orders/uploads endpoints
 */
export const useOrderEvidence = (): UseOrderEvidenceReturn => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload photo evidence via backend
   */
  const uploadEvidence = useCallback(
    async (
      orderId: string,
      installerId: string,
      crewId: string,
      imageUri: string
    ): Promise<{ success: boolean; recordId?: string; url?: string; error?: string }> => {
      try {
        setUploading(true);
        setError(null);

        // Create file object for React Native
        const timestamp = Date.now();
        const fileName = `evidence_${orderId}_${timestamp}.jpg`;

        const file = {
          uri: imageUri,
          type: 'image/jpeg',
          name: fileName,
        };

        const result = await uploadsService.uploadOrderEvidence({
          file,
          orderId,
          installerId,
          crewId,
        });

        return {
          success: true,
          recordId: result.recordId,
          url: result.url,
        };
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || err.message || 'Error al subir la evidencia';
        console.error('❌ [useOrderEvidence] Upload failed:', err);
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setUploading(false);
      }
    },
    []
  );

  /**
   * Delete photo evidence via backend
   */
  const deleteEvidence = useCallback(
    async (recordId: string, orderId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setDeleting(true);
        setError(null);

        await uploadsService.deleteOrderEvidence({
          recordId,
          orderId,
        });

        return { success: true };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error || err.message || 'Error al eliminar la evidencia';
        console.error('❌ [useOrderEvidence] Delete failed:', err);
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setDeleting(false);
      }
    },
    []
  );

  /**
   * Get image URL from recordId
   */
  const getImageUrl = useCallback(async (recordId: string, thumb?: string): Promise<string> => {
    try {
      return await uploadsService.getImageUrl({ recordId, thumb });
    } catch (err: any) {
      // Use warn instead of error to avoid Red Box in development for expected missing images
      console.warn('⚠️ [useOrderEvidence] getImageUrl failed (handled):', err.message);
      return '';
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploading,
    deleting,
    error,
    uploadEvidence,
    deleteEvidence,
    getImageUrl,
    clearError,
  };
};
