import { useState, useCallback } from 'react';
import orderService from '@/services/api/orders';

interface UseSignatureReturn {
  uploading: boolean;
  deleting: boolean;
  error: string | null;
  uploadSignature: (orderId: string, imageUri: string) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
  deleteSignature: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

/**
 * Hook for handling signature uploads
 * Adopts the pattern from useProfilePhoto (Backend Proxy)
 */
export const useSignature = (): UseSignatureReturn => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadSignature = useCallback(async (
    orderId: string,
    imageUri: string
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    try {
      setUploading(true);
      setError(null);

      console.log('📸 [useSignature] Uploading via OrderService (Backend Proxy)...');
      
      const imageUrl = await orderService.uploadSignature(orderId, imageUri);

      if (imageUrl) {
        console.log('✅ [useSignature] Upload successful');
        return {
          success: true,
          imageUrl: imageUrl
        };
      } else {
        throw new Error('No se recibió URL de la firma');
      }

    } catch (err: any) {
      const errorMsg = err.message || 'Error al subir la firma';
      console.error('❌ [useSignature] Upload failed:', err);
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteSignature = useCallback(async (
    orderId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setDeleting(true);
      setError(null);

      console.log('🗑️ [useSignature] Deleting via OrderService...');
      
      await orderService.deleteSignature(orderId);
      
      console.log('✅ [useSignature] Delete successful');
      return { success: true };

    } catch (err: any) {
      const errorMsg = err.message || 'Error al eliminar la firma';
      console.error('❌ [useSignature] Delete failed:', err);
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setDeleting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploading,
    deleting,
    error,
    uploadSignature,
    deleteSignature,
    clearError,
  };
};
