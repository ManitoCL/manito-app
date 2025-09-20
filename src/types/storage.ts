// =============================================================================
// STORAGE TYPES - ENTERPRISE STORAGE INFRASTRUCTURE
// Epic #2: Profile Management - TypeScript Types
// =============================================================================
// Comprehensive type definitions for Chilean marketplace storage
// Author: Supabase Infrastructure Specialist
// Created: 2025-09-19

export type StorageBucket = 'avatars' | 'portfolios' | 'documents' | 'job-photos';

export type ImageType = 'avatar' | 'portfolio' | 'document' | 'jobPhoto';

export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'preview';

export type UploadStatus = 'uploading' | 'uploaded' | 'processing' | 'optimized' | 'verified' | 'failed';

export type DocumentType =
  | 'cedula_front'
  | 'cedula_back'
  | 'selfie'
  | 'certificate'
  | 'rut_certificate'
  | 'criminal_background_check'
  | 'tax_certificate'
  | 'work_permit'
  | 'business_license'
  | 'insurance_certificate';

export type PhotoType = 'before' | 'during' | 'after' | 'damage' | 'completion';

// =============================================================================
// CORE STORAGE INTERFACES
// =============================================================================

export interface StorageFile {
  id: string;
  name: string;
  bucket: StorageBucket;
  path: string;
  size: number;
  mimeType: string;
  lastModified: Date;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: string;
}

export interface ChileanComplianceMetadata {
  dataResidency: 'Chile';
  regulation: 'Ley 19.628 de Protección de Datos Personales';
  retentionPolicy: string;
  encryptionStandard: 'AES-256';
  processingLocation: 'Santiago, Chile';
  processedAt?: string;
  consentGiven?: boolean;
  consentDate?: string;
}

// =============================================================================
// DATABASE ENTITY INTERFACES
// =============================================================================

export interface UserAvatar {
  id: string;
  user_id: string;
  storage_bucket: StorageBucket;
  file_path: string;
  thumbnail_path?: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  image_dimensions?: ImageDimensions;
  is_current: boolean;
  upload_status: UploadStatus;
  created_at: string;
  updated_at: string;
}

export interface PortfolioImage {
  id: string;
  provider_id: string;
  project_type?: string;
  title?: string;
  description?: string;
  storage_bucket: StorageBucket;
  file_path: string;
  thumbnail_path?: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  image_dimensions?: ImageDimensions;
  is_before_photo: boolean;
  is_after_photo: boolean;
  is_featured: boolean;
  sort_order: number;
  upload_status: UploadStatus;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocument {
  id: string;
  provider_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  file_size: number;
  storage_bucket: StorageBucket;
  storage_object_path?: string;
  thumbnail_path?: string;
  mime_type?: string;
  upload_status: UploadStatus;
  verification_result?: Record<string, any>;
  compliance_metadata: ChileanComplianceMetadata;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JobPhoto {
  id: string;
  booking_id?: string;
  provider_id: string;
  customer_id: string;
  photo_type: PhotoType;
  storage_bucket: StorageBucket;
  file_path: string;
  thumbnail_path?: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  image_dimensions?: ImageDimensions;
  caption?: string;
  taken_at: string;
  geo_location?: GeoLocation;
  upload_status: UploadStatus;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// API REQUEST/RESPONSE INTERFACES
// =============================================================================

export interface UploadRequest {
  file: File;
  bucket: StorageBucket;
  folder?: string;
  imageType?: ImageType;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    path: string;
    fullPath: string;
    publicUrl?: string;
  };
  error?: string;
}

export interface ImageProcessingRequest {
  bucket: StorageBucket;
  objectPath: string;
  imageType: ImageType;
  userId: string;
  metadata?: Record<string, any>;
}

export interface ProcessingResult {
  success: boolean;
  originalPath: string;
  processedImages: Array<{
    name: string;
    path: string;
    size: ImageDimensions;
    fileSize: number;
  }>;
  thumbnailPath?: string;
  error?: string;
  complianceMetadata: ChileanComplianceMetadata;
}

export interface DeleteRequest {
  bucket: StorageBucket;
  paths: string[];
}

export interface DeleteResponse {
  success: boolean;
  deletedPaths: string[];
  failedPaths: string[];
  error?: string;
}

// =============================================================================
// CONFIGURATION INTERFACES
// =============================================================================

export interface ImageConfig {
  sizes: Array<{
    name: string;
    width: number;
    height: number;
  }>;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
  bucket: StorageBucket;
}

export interface StorageConfig {
  buckets: {
    [K in StorageBucket]: {
      public: boolean;
      maxFileSize: number; // in bytes
      allowedMimeTypes: string[];
      imageConfig?: ImageConfig;
    };
  };
  cdnUrl: string;
  processingFunction: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type StorageEventType =
  | 'upload_started'
  | 'upload_progress'
  | 'upload_completed'
  | 'upload_failed'
  | 'processing_started'
  | 'processing_completed'
  | 'processing_failed'
  | 'delete_completed'
  | 'delete_failed';

export interface StorageEvent {
  type: StorageEventType;
  bucket: StorageBucket;
  path: string;
  progress?: number;
  data?: any;
  error?: string;
  timestamp: string;
}

export type StorageEventListener = (event: StorageEvent) => void;

// =============================================================================
// SEARCH AND FILTERING TYPES
// =============================================================================

export interface PortfolioFilter {
  provider_id?: string;
  project_type?: string;
  is_featured?: boolean;
  photo_type?: 'before' | 'after' | 'both';
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'sort_order' | 'is_featured';
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentFilter {
  provider_id?: string;
  document_type?: DocumentType | DocumentType[];
  upload_status?: UploadStatus | UploadStatus[];
  verification_status?: 'pending' | 'verified' | 'rejected';
  limit?: number;
  offset?: number;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface StorageError {
  code: string;
  message: string;
  details?: any;
  bucket?: StorageBucket;
  path?: string;
  operation?: 'upload' | 'download' | 'delete' | 'process';
}

export type StorageErrorCode =
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'UPLOAD_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'DELETE_FAILED'
  | 'PROCESSING_FAILED'
  | 'PERMISSION_DENIED'
  | 'BUCKET_NOT_FOUND'
  | 'FILE_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'COMPLIANCE_VIOLATION';

// =============================================================================
// PROGRESSIVE LOADING TYPES
// =============================================================================

export interface ProgressiveImageProps {
  src: string;
  thumbnailSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  priority?: boolean;
  blur?: boolean;
}

export interface LazyLoadConfig {
  threshold: number;
  rootMargin: string;
  triggerOnce: boolean;
}

// =============================================================================
// EXPORT CONSOLIDATED TYPES
// =============================================================================

export type {
  StorageBucket,
  ImageType,
  ImageSize,
  UploadStatus,
  DocumentType,
  PhotoType,
  StorageFile,
  ImageDimensions,
  GeoLocation,
  ChileanComplianceMetadata,
  UserAvatar,
  PortfolioImage,
  VerificationDocument,
  JobPhoto,
  UploadRequest,
  UploadResponse,
  ImageProcessingRequest,
  ProcessingResult,
  DeleteRequest,
  DeleteResponse,
  ImageConfig,
  StorageConfig,
  StorageEventType,
  StorageEvent,
  StorageEventListener,
  PortfolioFilter,
  DocumentFilter,
  StorageError,
  StorageErrorCode,
  ProgressiveImageProps,
  LazyLoadConfig
};

// Default configurations
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  buckets: {
    avatars: {
      public: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
    },
    portfolios: {
      public: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
    },
    documents: {
      public: false,
      maxFileSize: 15 * 1024 * 1024, // 15MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
    },
    'job-photos': {
      public: false,
      maxFileSize: 8 * 1024 * 1024, // 8MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
    }
  },
  cdnUrl: process.env.EXPO_PUBLIC_SUPABASE_URL + '/storage/v1/object/public',
  processingFunction: 'image-processor'
};