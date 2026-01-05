/**
 * Types for File Uploads (PocketBase)
 * Handles order photo evidence and installer profile photos
 */

// Upload result from PocketBase
export interface UploadResult {
  success: boolean;
  recordId: string;
  collectionId: string;
  filename: string;
  url: string;
  order_id?: string;
  installer_id?: string;
  crew_id?: string;
}

// Input for uploading order evidence
export interface UploadOrderEvidenceInput {
  file: File | Blob;
  orderId: string;
  installerId: string;
  crewId: string;
}

// Input for uploading profile photo
export interface UploadProfilePhotoInput {
  file: any; // React Native file object { uri, type, name }
  installerId: string;
}

// Image URL request
export interface GetImageUrlInput {
  recordId: string;
  thumb?: string; // e.g., "100x100" for thumbnails
}

// Delete evidence request
export interface DeleteEvidenceInput {
  recordId: string;
  orderId: string;
}

// Delete profile photo request
export interface DeleteProfilePhotoInput {
  installerId: string;
}

// Upload progress
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
