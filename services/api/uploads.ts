import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import { httpClient } from './client';

import type {
  UploadResult,
  UploadOrderEvidenceInput,
  UploadProfilePhotoInput,
  GetImageUrlInput,
  DeleteEvidenceInput,
  DeleteProfilePhotoInput,
} from '@/types/uploads';

/**
 * Service for File Uploads (PocketBase)
 * Handles order photo evidences and installer profile photos
 */
class UploadsService {
  /**
   * Helper to compress image before upload
   * Resizes to max width 1024px and compresses to 0.7 quality
   */
  private async compressImage(uri: string): Promise<string> {
    try {
      console.log('🔄 [UploadsService] Compressing image...', uri);
      const result = await manipulateAsync(uri, [{ resize: { width: 1024 } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
      });
      console.log('✅ [UploadsService] Image compressed:', result.uri);
      return result.uri;
    } catch (error) {
      console.warn('⚠️ [UploadsService] Compression failed, using original:', error);
      return uri;
    }
  }

  // ============================================================================
  // ORDER PHOTO EVIDENCE
  // ============================================================================

  /**
   * POST /api/web/orders/uploads
   * Upload photo evidence for an order
   */
  async uploadOrderEvidence(input: UploadOrderEvidenceInput): Promise<UploadResult> {
    const compressedUri = await this.compressImage(input.file.uri);

    const formData = new FormData();
    // Update the file URI with the compressed one
    const file = {
      ...input.file,
      uri: compressedUri,
      name: 'evidence.jpg', // Ensure valid extension
      type: 'image/jpeg',
    };

    formData.append('imagen', file as any);
    formData.append('order_id', input.orderId);
    formData.append('installer_id', input.installerId);
    formData.append('crew_id', input.crewId);

    const response = await httpClient.post<UploadResult>('/api/web/orders/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * GET /api/web/orders/uploads?recordId=xxx&thumb=xxx
   * Get image URL from PocketBase
   */
  async getImageUrl(input: GetImageUrlInput): Promise<string> {
    const params: any = { recordId: input.recordId };
    if (input.thumb) params.thumb = input.thumb;

    const response = await httpClient.get<{ success: boolean; url: string }>(
      '/api/web/orders/uploads',
      { params }
    );

    return response.data.url;
  }

  /**
   * DELETE /api/web/orders/uploads?recordId=xxx&orderId=yyy
   * Delete photo evidence
   */
  async deleteOrderEvidence(input: DeleteEvidenceInput): Promise<void> {
    await httpClient.delete('/api/web/orders/uploads', {
      params: {
        recordId: input.recordId,
        orderId: input.orderId,
      },
    });
  }

  // ============================================================================
  // PROFILE PHOTOS
  // ============================================================================

  /**
   * POST /api/web/installers/profile-photo
   * Upload installer profile photo
   */
  async uploadProfilePhoto(input: UploadProfilePhotoInput): Promise<UploadResult> {
    const compressedUri = await this.compressImage(input.file.uri);

    const formData = new FormData();

    const file = {
      ...input.file,
      uri: compressedUri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    };

    formData.append('imagen', file as any);
    formData.append('installer_id', input.installerId);

    const response = await httpClient.post<UploadResult>(
      '/api/web/installers/profile-photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * DELETE /api/web/installers/profile-photo?installerId=xxx
   * Delete installer profile photo
   */
  async deleteProfilePhoto(input: DeleteProfilePhotoInput): Promise<void> {
    await httpClient.delete('/api/web/installers/profile-photo', {
      params: {
        installerId: input.installerId,
      },
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Parse photo evidence string to get recordId and filename
   * Format: "recordId:filename"
   */
  parsePhotoEvidenceId(photoEvidenceId: string): { recordId: string; filename: string } {
    const [recordId, filename] = photoEvidenceId.split(':');
    return { recordId, filename };
  }

  /**
   * Build photo evidence ID string
   */
  buildPhotoEvidenceId(recordId: string, filename: string): string {
    return `${recordId}:${filename}`;
  }

  /**
   * Get thumbnail URL for a photo evidence
   */
  async getThumbnailUrl(photoEvidenceId: string, size: string = '100x100'): Promise<string> {
    const { recordId } = this.parsePhotoEvidenceId(photoEvidenceId);
    return this.getImageUrl({ recordId, thumb: size });
  }

  /**
   * Get full size URL for a photo evidence
   */
  async getFullSizeUrl(photoEvidenceId: string): Promise<string> {
    const { recordId } = this.parsePhotoEvidenceId(photoEvidenceId);
    return this.getImageUrl({ recordId });
  }
}

// Create singleton instance
const uploadsService = new UploadsService();

// Export service and methods
export default uploadsService;

export const {
  uploadOrderEvidence,
  getImageUrl,
  deleteOrderEvidence,
  uploadProfilePhoto,
  deleteProfilePhoto,
  parsePhotoEvidenceId,
  buildPhotoEvidenceId,
  getThumbnailUrl,
  getFullSizeUrl,
} = uploadsService;
