import { useState, useCallback } from 'react';

import { UploadProfilePhotoResult } from '@/services/api/pocketbase'; // Keeping type for now or redefine
import uploadsService from '@/services/api/uploads';

// Defining compatible return type based on usage
interface UseProfilePhotoReturn {
  uploading: boolean;
  deleting: boolean;
  error: string | null;
  uploadPhoto: (
    userId: string,
    imageUri: string
  ) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
  deletePhoto: (userId: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

/**
 * Hook for handling profile photo uploads via backend service
 * Uses /api/web/installers/profile-photo endpoints
 */
export const useProfilePhoto = (): UseProfilePhotoReturn => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload profile photo via backend
   */
  const uploadPhoto = useCallback(
    async (
      userId: string,
      imageUri: string
    ): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
      try {
        setUploading(true);
        setError(null);

        // Create file object for React Native
        const timestamp = Date.now();
        const fileName = `profile_${userId}_${timestamp}.jpg`;

        const file = {
          uri: imageUri,
          type: 'image/jpeg',
          name: fileName,
        };

        console.log('📸 [useProfilePhoto] Uploading via Backend Service...');

        // Call backend upload service
        // This endpoint handles PB upload AND MongoDB update
        const result = await uploadsService.uploadProfilePhoto({
          installerId: userId,
          file,
        });

        console.log('✅ [useProfilePhoto] Backend upload successful', result);

        return {
          success: true,
          imageUrl: result.url,
        };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error || err.message || 'Error al subir la foto de perfil';
        console.error('❌ [useProfilePhoto] Upload failed:', err);
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
   * Delete profile photo via backend
   */
  const deletePhoto = useCallback(
    async (userId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setDeleting(true);
        setError(null);

        console.log('🗑️ [useProfilePhoto] Deleting via Backend Service...');

        // Call backend delete service
        // This endpoint handles PB delete AND MongoDB update
        await uploadsService.deleteProfilePhoto({
          installerId: userId,
        });

        console.log('✅ [useProfilePhoto] Backend delete successful');

        return { success: true };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error || err.message || 'Error al eliminar la foto de perfil';
        console.error('❌ [useProfilePhoto] Delete failed:', err);
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploading,
    deleting,
    error,
    uploadPhoto,
    deletePhoto,
    clearError,
  };
};
