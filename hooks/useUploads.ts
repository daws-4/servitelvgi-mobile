import { useState, useCallback } from 'react';
import uploadsService from '@/services/api/uploads';
import type {
  UploadResult,
  UploadOrderEvidenceInput,
  UploadProfilePhotoInput,
} from '@/types/uploads';

interface UseUploadsReturn {
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadEvidence: (input: Omit<UploadOrderEvidenceInput, 'installerId' | 'crewId'>, installerId: string, crewId: string) => Promise<UploadResult>;
  uploadProfilePhoto: (file: File | Blob, installerId: string) => Promise<UploadResult>;
  deleteEvidence: (recordId: string, orderId: string) => Promise<void>;
  deleteProfilePhoto: (installerId: string) => Promise<void>;
  getImageUrl: (recordId: string, thumb?: string) => Promise<string>;
  clearError: () => void;
}

/**
 * Hook for handling file uploads (order evidence and profile photos)
 */
export const useUploads = (): UseUploadsReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadEvidence = useCallback(async (
    input: Omit<UploadOrderEvidenceInput, 'installerId' | 'crewId'>,
    installerId: string,
    crewId: string
  ): Promise<UploadResult> => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const result = await uploadsService.uploadOrderEvidence({
        ...input,
        installerId,
        crewId,
      });

      setUploadProgress(100);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al subir evidencia';
      setError(errorMsg);
      console.error('Error uploading evidence:', err);
      throw new Error(errorMsg);
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadProfilePhoto = useCallback(async (
    file: File | Blob,
    installerId: string
  ): Promise<UploadResult> => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const result = await uploadsService.uploadProfilePhoto({ file, installerId });

      setUploadProgress(100);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al subir foto de perfil';
      setError(errorMsg);
      console.error('Error uploading profile photo:', err);
      throw new Error(errorMsg);
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteEvidence = useCallback(async (recordId: string, orderId: string): Promise<void> => {
    try {
      setError(null);
      await uploadsService.deleteOrderEvidence({ recordId, orderId });
    } catch (err: any) {
      const errorMsg = err.message || 'Error al eliminar evidencia';
      setError(errorMsg);
      console.error('Error deleting evidence:', err);
      throw new Error(errorMsg);
    }
  }, []);

  const deleteProfilePhoto = useCallback(async (installerId: string): Promise<void> => {
    try {
      setError(null);
      await uploadsService.deleteProfilePhoto({ installerId });
    } catch (err: any) {
      const errorMsg = err.message || 'Error al eliminar foto de perfil';
      setError(errorMsg);
      console.error('Error deleting profile photo:', err);
      throw new Error(errorMsg);
    }
  }, []);

  const getImageUrl = useCallback(async (recordId: string, thumb?: string): Promise<string> => {
    try {
      return await uploadsService.getImageUrl({ recordId, thumb });
    } catch (err: any) {
      console.error('Error getting image URL:', err);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploading,
    uploadProgress,
    error,
    uploadEvidence,
    uploadProfilePhoto,
    deleteEvidence,
    deleteProfilePhoto,
    getImageUrl,
    clearError,
  };
};
