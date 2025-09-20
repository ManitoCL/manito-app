// =============================================================================
// ENTERPRISE STORAGE SERVICE
// Epic #2: Profile Management - Client Storage Management
// =============================================================================
// Production-ready storage service for Chilean marketplace with enterprise patterns
// Author: Supabase Infrastructure Specialist
// Created: 2025-09-19

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  StorageBucket,
  ImageType,
  UploadRequest,
  UploadResponse,
  ImageProcessingRequest,
  ProcessingResult,
  DeleteRequest,
  DeleteResponse,
  UserAvatar,
  PortfolioImage,
  VerificationDocument,
  JobPhoto,
  StorageError,
  StorageErrorCode,
  StorageEvent,
  StorageEventListener,
  PortfolioFilter,
  DocumentFilter,
  DEFAULT_STORAGE_CONFIG,
  ChileanComplianceMetadata
} from '../types/storage';

// =============================================================================
// STORAGE EVENT EMITTER
// =============================================================================

class StorageEventEmitter {
  private listeners: Map<string, StorageEventListener[]> = new Map();

  on(eventType: string, listener: StorageEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  off(eventType: string, listener: StorageEventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: StorageEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }
}

// =============================================================================
// MAIN STORAGE SERVICE CLASS
// =============================================================================

export class EnterpriseStorageService {
  private supabase: SupabaseClient;
  private eventEmitter: StorageEventEmitter;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.eventEmitter = new StorageEventEmitter();
  }

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================

  onStorageEvent(eventType: string, listener: StorageEventListener): void {
    this.eventEmitter.on(eventType, listener);
  }

  offStorageEvent(eventType: string, listener: StorageEventListener): void {
    this.eventEmitter.off(eventType, listener);
  }

  private emitEvent(event: Omit<StorageEvent, 'timestamp'>): void {
    this.eventEmitter.emit({
      ...event,
      timestamp: new Date().toISOString()
    });
  }

  // =============================================================================
  // CORE UPLOAD FUNCTIONALITY
  // =============================================================================

  async uploadFile(request: UploadRequest): Promise<UploadResponse> {
    try {
      const { file, bucket, folder = '', imageType, metadata = {}, onProgress } = request;

      // Validate file
      const validation = this.validateFile(file, bucket);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate file path with Chilean compliance structure
      const filePath = this.generateFilePath(file, bucket, folder);

      this.emitEvent({
        type: 'upload_started',
        bucket,
        path: filePath,
        data: { fileName: file.name, size: file.size }
      });

      // Upload file with progress tracking
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: 'half'
        });

      if (error) {
        this.emitEvent({
          type: 'upload_failed',
          bucket,
          path: filePath,
          error: error.message
        });
        throw error;
      }

      // Get public URL for public buckets
      let publicUrl: string | undefined;
      if (DEFAULT_STORAGE_CONFIG.buckets[bucket].public) {
        const { data: urlData } = this.supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      const response: UploadResponse = {
        success: true,
        data: {
          id: data.id || '',
          path: data.path,
          fullPath: data.fullPath,
          publicUrl
        }
      };

      this.emitEvent({
        type: 'upload_completed',
        bucket,
        path: filePath,
        data: response.data
      });

      // Trigger image processing for supported types
      if (imageType && this.shouldProcessImage(bucket)) {
        await this.processImage({
          bucket,
          objectPath: filePath,
          imageType,
          userId: folder || 'anonymous',
          metadata
        });
      }

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      this.emitEvent({
        type: 'upload_failed',
        bucket: request.bucket,
        path: '',
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // =============================================================================
  // IMAGE PROCESSING
  // =============================================================================

  async processImage(request: ImageProcessingRequest): Promise<ProcessingResult> {
    try {
      this.emitEvent({
        type: 'processing_started',
        bucket: request.bucket,
        path: request.objectPath
      });

      const { data, error } = await this.supabase.functions.invoke('image-processor', {
        body: request
      });

      if (error) {
        this.emitEvent({
          type: 'processing_failed',
          bucket: request.bucket,
          path: request.objectPath,
          error: error.message
        });
        throw error;
      }

      this.emitEvent({
        type: 'processing_completed',
        bucket: request.bucket,
        path: request.objectPath,
        data
      });

      return data as ProcessingResult;

    } catch (error) {
      const result: ProcessingResult = {
        success: false,
        originalPath: request.objectPath,
        processedImages: [],
        error: error instanceof Error ? error.message : 'Processing failed',
        complianceMetadata: this.getComplianceMetadata()
      };

      return result;
    }
  }

  // =============================================================================
  // FILE MANAGEMENT
  // =============================================================================

  async deleteFiles(request: DeleteRequest): Promise<DeleteResponse> {
    try {
      const { bucket, paths } = request;
      const deletedPaths: string[] = [];
      const failedPaths: string[] = [];

      for (const path of paths) {
        const { error } = await this.supabase.storage
          .from(bucket)
          .remove([path]);

        if (error) {
          failedPaths.push(path);
          console.error(`Failed to delete ${path}:`, error);
        } else {
          deletedPaths.push(path);
        }
      }

      this.emitEvent({
        type: 'delete_completed',
        bucket,
        path: paths.join(', '),
        data: { deletedCount: deletedPaths.length, failedCount: failedPaths.length }
      });

      return {
        success: failedPaths.length === 0,
        deletedPaths,
        failedPaths,
        error: failedPaths.length > 0 ? `Failed to delete ${failedPaths.length} files` : undefined
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete operation failed';

      this.emitEvent({
        type: 'delete_failed',
        bucket: request.bucket,
        path: request.paths.join(', '),
        error: errorMessage
      });

      return {
        success: false,
        deletedPaths: [],
        failedPaths: request.paths,
        error: errorMessage
      };
    }
  }

  // =============================================================================
  // AVATAR MANAGEMENT
  // =============================================================================

  async uploadAvatar(userId: string, file: File, onProgress?: (progress: number) => void): Promise<UserAvatar | null> {
    try {
      const uploadResponse = await this.uploadFile({
        file,
        bucket: 'avatars',
        folder: userId,
        imageType: 'avatar',
        onProgress
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Upload failed');
      }

      // Create avatar record in database
      const { data, error } = await this.supabase
        .from('user_avatars')
        .insert({
          user_id: userId,
          storage_bucket: 'avatars',
          file_path: uploadResponse.data.path,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          is_current: true,
          upload_status: 'uploaded'
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserAvatar;

    } catch (error) {
      console.error('Avatar upload failed:', error);
      return null;
    }
  }

  async getUserAvatar(userId: string): Promise<UserAvatar | null> {
    const { data, error } = await this.supabase
      .from('user_avatars')
      .select('*')
      .eq('user_id', userId)
      .eq('is_current', true)
      .single();

    if (error || !data) return null;
    return data as UserAvatar;
  }

  // =============================================================================
  // PORTFOLIO MANAGEMENT
  // =============================================================================

  async uploadPortfolioImage(
    providerId: string,
    file: File,
    metadata: {
      title?: string;
      description?: string;
      projectType?: string;
      isBeforePhoto?: boolean;
      isAfterPhoto?: boolean;
      isFeatured?: boolean;
    } = {}
  ): Promise<PortfolioImage | null> {
    try {
      const uploadResponse = await this.uploadFile({
        file,
        bucket: 'portfolios',
        folder: providerId,
        imageType: 'portfolio',
        metadata
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Upload failed');
      }

      const { data, error } = await this.supabase
        .from('portfolio_images')
        .insert({
          provider_id: providerId,
          project_type: metadata.projectType,
          title: metadata.title,
          description: metadata.description,
          storage_bucket: 'portfolios',
          file_path: uploadResponse.data.path,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          is_before_photo: metadata.isBeforePhoto || false,
          is_after_photo: metadata.isAfterPhoto || false,
          is_featured: metadata.isFeatured || false,
          upload_status: 'uploaded',
          sort_order: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data as PortfolioImage;

    } catch (error) {
      console.error('Portfolio image upload failed:', error);
      return null;
    }
  }

  async getPortfolioImages(filter: PortfolioFilter): Promise<PortfolioImage[]> {
    let query = this.supabase
      .from('portfolio_images')
      .select('*');

    if (filter.provider_id) {
      query = query.eq('provider_id', filter.provider_id);
    }

    if (filter.project_type) {
      query = query.eq('project_type', filter.project_type);
    }

    if (filter.is_featured !== undefined) {
      query = query.eq('is_featured', filter.is_featured);
    }

    if (filter.photo_type) {
      if (filter.photo_type === 'before') {
        query = query.eq('is_before_photo', true);
      } else if (filter.photo_type === 'after') {
        query = query.eq('is_after_photo', true);
      }
    }

    // Sorting
    const sortBy = filter.sortBy || 'created_at';
    const sortOrder = filter.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch portfolio images:', error);
      return [];
    }

    return data as PortfolioImage[];
  }

  // =============================================================================
  // DOCUMENT VERIFICATION MANAGEMENT
  // =============================================================================

  async uploadVerificationDocument(
    providerId: string,
    file: File,
    documentType: string,
    metadata: Record<string, any> = {}
  ): Promise<VerificationDocument | null> {
    try {
      const uploadResponse = await this.uploadFile({
        file,
        bucket: 'documents',
        folder: providerId,
        imageType: 'document',
        metadata: { ...metadata, documentType }
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Upload failed');
      }

      const { data, error } = await this.supabase
        .from('verification_documents')
        .insert({
          provider_id: providerId,
          document_type: documentType,
          file_path: uploadResponse.data.path,
          file_name: file.name,
          file_size: file.size,
          storage_bucket: 'documents',
          storage_object_path: uploadResponse.data.path,
          mime_type: file.type,
          upload_status: 'uploaded',
          compliance_metadata: this.getComplianceMetadata()
        })
        .select()
        .single();

      if (error) throw error;
      return data as VerificationDocument;

    } catch (error) {
      console.error('Document upload failed:', error);
      return null;
    }
  }

  async getVerificationDocuments(filter: DocumentFilter): Promise<VerificationDocument[]> {
    let query = this.supabase
      .from('verification_documents')
      .select('*');

    if (filter.provider_id) {
      query = query.eq('provider_id', filter.provider_id);
    }

    if (filter.document_type) {
      if (Array.isArray(filter.document_type)) {
        query = query.in('document_type', filter.document_type);
      } else {
        query = query.eq('document_type', filter.document_type);
      }
    }

    if (filter.upload_status) {
      if (Array.isArray(filter.upload_status)) {
        query = query.in('upload_status', filter.upload_status);
      } else {
        query = query.eq('upload_status', filter.upload_status);
      }
    }

    // Pagination
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch verification documents:', error);
      return [];
    }

    return data as VerificationDocument[];
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private validateFile(file: File, bucket: StorageBucket): { valid: boolean; error?: string } {
    const config = DEFAULT_STORAGE_CONFIG.buckets[bucket];

    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(config.maxFileSize / 1024 / 1024)}MB limit`
      };
    }

    // Check MIME type
    if (!config.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed for this bucket`
      };
    }

    return { valid: true };
  }

  private generateFilePath(file: File, bucket: StorageBucket, folder: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = `${timestamp}_${randomString}.${extension}`;

    if (folder) {
      return `${folder}/${fileName}`;
    }

    return fileName;
  }

  private shouldProcessImage(bucket: StorageBucket): boolean {
    return ['avatars', 'portfolios', 'documents', 'job-photos'].includes(bucket);
  }

  private getComplianceMetadata(): ChileanComplianceMetadata {
    return {
      dataResidency: 'Chile',
      regulation: 'Ley 19.628 de Protección de Datos Personales',
      retentionPolicy: '7 years',
      encryptionStandard: 'AES-256',
      processingLocation: 'Santiago, Chile',
      processedAt: new Date().toISOString()
    };
  }

  // =============================================================================
  // URL GENERATION
  // =============================================================================

  getPublicUrl(bucket: StorageBucket, path: string): string | null {
    if (!DEFAULT_STORAGE_CONFIG.buckets[bucket].public) {
      return null;
    }

    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async getSignedUrl(bucket: StorageBucket, path: string, expiresIn: number = 3600): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Failed to create signed URL:', error);
      return null;
    }

    return data.signedUrl;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let storageServiceInstance: EnterpriseStorageService | null = null;

export const initializeStorageService = (supabaseUrl: string, supabaseKey: string): EnterpriseStorageService => {
  if (!storageServiceInstance) {
    storageServiceInstance = new EnterpriseStorageService(supabaseUrl, supabaseKey);
  }
  return storageServiceInstance;
};

export const getStorageService = (): EnterpriseStorageService => {
  if (!storageServiceInstance) {
    throw new Error('Storage service not initialized. Call initializeStorageService first.');
  }
  return storageServiceInstance;
};

// =============================================================================
// CONVENIENCE HOOKS FOR REACT NATIVE
// =============================================================================

export const storageService = {
  getInstance: getStorageService,
  initialize: initializeStorageService
};