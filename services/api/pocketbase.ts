import { Config } from '@/constants/config';

/**
 * PocketBase Client for Direct Uploads
 * Handles profile photo uploads directly to PocketBase
 */

const POCKETBASE_URL = Config.POCKETBASE_URL;
const COLLECTION_NAME = 'profile_installer';

export interface PocketBaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  user_id: string;
  image: string;
  mobile?: boolean;
}

export interface UploadProfilePhotoResult {
  success: boolean;
  record?: PocketBaseRecord;
  imageUrl?: string;
  error?: string;
}

/**
 * PocketBase Service for Profile Photos
 */
class PocketBaseService {
  private baseUrl: string;
  // Hardcoded credentials as requested
  private adminEmail = 'casaos@admin.local';
  private adminPass = 'Enlared2026';
  private adminToken: string | null = null;

  /**
   * Authenticate as admin to get token
   */
  /**
   * Authenticate as admin (or user) to get token
   */
  private async getAdminToken(): Promise<string | null> {
    if (this.adminToken) return this.adminToken;

    const baseUrl = this.baseUrl || Config.POCKETBASE_URL || 'https://images.endlaredve.com';

    // 1. Try Admin Auth
    try {
      console.log('🔑 [PocketBase] Authenticating as admin...');
      const response = await fetch(`${baseUrl}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: this.adminEmail,
          password: this.adminPass,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.adminToken = data.token;
        console.log('✅ [PocketBase] Admin authenticated.');
        return this.adminToken;
      } else {
         console.warn(`⚠️ [PocketBase] Admin auth failed with status ${response.status}. Trying user auth...`);
      }
    } catch (error) {
       console.error('❌ [PocketBase] Admin auth network error:', error);
    }

    // 2. Fallback: Try User Auth (users collection)
    try {
       console.log('🔑 [PocketBase] Attempting auth as user (fallback)...');
       const response = await fetch(`${baseUrl}/api/collections/users/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: this.adminEmail, // Reusing credential
          password: this.adminPass,
        }),
      });

      if (response.ok) {
         const data = await response.json();
         this.adminToken = data.token;
         console.log('✅ [PocketBase] User/Admin authenticated via users collection.');
         return this.adminToken;
      } else {
         console.error(`❌ [PocketBase] User auth failed with status ${response.status}`);
         return null;
      }
    } catch (error) {
       console.error('❌ [PocketBase] User auth network error:', error);
       return null;
    }
  }

  constructor() {
    this.baseUrl = Config.POCKETBASE_URL || 'https://images.enlaredve.com';
    console.log('📝 [PocketBase] Service initialized with URL:', this.baseUrl);
  }

  /**
   * Get the full URL for an image in PocketBase
   */
  getImageUrl(record: PocketBaseRecord, filename?: string): string {
    const imageName = filename || record.image;
    const collection = record.collectionId || record.collectionName || COLLECTION_NAME;
    return `${this.baseUrl}/api/files/${collection}/${record.id}/${imageName}`;
  }

  /**
   * Upload profile photo directly to PocketBase
   * Creates or updates a record in profile_installer collection
   */
  async uploadProfilePhoto(
    userId: string,
    imageUri: string,
    imageName: string = 'profile.jpg'
  ): Promise<UploadProfilePhotoResult> {
    try {
      // First, check if a record already exists for this user
      const existingRecord = await this.findRecordByUserId(userId);

      // Prepare FormData
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('mobile', 'true'); // Always true for mobile uploads
      
      // Create file object for React Native
      const file = {
        uri: imageUri,
        type: 'image/jpeg',
        name: imageName,
      } as any;
      formData.append('image', file);

      let response: Response;
      let record: PocketBaseRecord;

      if (existingRecord) {
        // Update existing record
        response = await fetch(
          `${this.baseUrl}/api/collections/${COLLECTION_NAME}/records/${existingRecord.id}`,
          {
            method: 'PATCH',
            body: formData,
          }
        );
      } else {
        // Create new record
        response = await fetch(
          `${this.baseUrl}/api/collections/${COLLECTION_NAME}/records`,
          {
            method: 'POST',
            body: formData,
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('PocketBase error:', errorData);
        return {
          success: false,
          error: errorData.message || `Error ${response.status}: ${response.statusText}`,
        };
      }

      record = await response.json();
      const imageUrl = this.getImageUrl(record);

      return {
        success: true,
        record,
        imageUrl,
      };
    } catch (error: any) {
      console.error('Error uploading to PocketBase:', error);
      return {
        success: false,
        error: error.message || 'Error al subir la imagen',
      };
    }
  }

  /**
   * Find existing record by user_id
   */
  async findRecordByUserId(userId: string): Promise<PocketBaseRecord | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/collections/${COLLECTION_NAME}/records?filter=(user_id='${userId}')`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        console.log(`✅ [PocketBase] Found record: ${data.items[0].id}`);
        return data.items[0] as PocketBaseRecord;
      }

      console.log('⚠️ [PocketBase] No record found for user');
      return null;
    } catch (error) {
      console.error('Error finding PocketBase record:', error);
      return null;
    }
  }

  /**
   * Delete profile photo from PocketBase
   */
  async deleteProfilePhoto(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const existingRecord = await this.findRecordByUserId(userId);

      if (!existingRecord) {
        console.log('ℹ️ [PocketBase] No record to delete (idempotent success)');
        return { success: true }; // No record to delete
      }

      console.log(`🗑️ [PocketBase] Deleting record ${existingRecord.id}...`);
      const response = await fetch(
        `${this.baseUrl}/api/collections/${COLLECTION_NAME}/records/${existingRecord.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `Error ${response.status}`,
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting from PocketBase:', error);
      return {
        success: false,
        error: error.message || 'Error al eliminar la imagen',
      };
    }
  }

  /**
   * Get profile photo URL for a user
   */
  async getProfilePhotoUrl(userId: string): Promise<string | null> {
    try {
      const record = await this.findRecordByUserId(userId);
      
      if (record && record.image) {
        return this.getImageUrl(record);
      }

      return null;
    } catch (error) {
      console.error('Error getting profile photo URL:', error);
      return null;
    }
  }

  /**
   * Upload signature directly to PocketBase
   * Creates or updates a record in customers_signatures collection
   */
  uploadSignature = async (
    orderId: string,
    imageUri: string
  ): Promise<UploadProfilePhotoResult> => {
    try {
      // Get admin token first
      const token = await this.getAdminToken();
      
      // Prepare FormData
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('mobile', 'true');
      
      // Create file object
      const file = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `signature_${orderId}_${Date.now()}.jpg`,
      } as any;
      formData.append('image', file);

      // Robust baseUrl
      const baseUrl = this.baseUrl || Config.POCKETBASE_URL || 'https://pb.servitelv.com';

      const headers: HeadersInit = {};
      if (token) {
        // PocketBase standard: Authorization: <token>
        headers['Authorization'] = token; 
      }

      console.log('📝 [PocketBase] Uploading Signature with Admin Token...');
      
      const response = await fetch(
        `${baseUrl}/api/collections/customers_signatures/records`,
        {
          method: 'POST',
          headers: headers, // Add headers with auth
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('PocketBase signature upload error:', errorData);
        return {
          success: false,
          error: errorData.message || `Error ${response.status}: ${response.statusText}`,
        };
      }

      const record: PocketBaseRecord = await response.json();
      const imageUrl = this.getImageUrl(record);

      return {
        success: true,
        record,
        imageUrl,
      };
    } catch (error: any) {
      console.error('Error uploading signature to PocketBase:', error);
      return {
        success: false,
        error: error.message || 'Error al subir la firma',
      };
    }
  }
}

// Singleton instance
const pocketBaseService = new PocketBaseService();

export default pocketBaseService;

export const {
  uploadProfilePhoto,
  deleteProfilePhoto,
  getProfilePhotoUrl,
  findRecordByUserId,
  getImageUrl,
  uploadSignature,
} = pocketBaseService;
