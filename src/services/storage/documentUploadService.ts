import { supabase } from '../database/supabaseClient';
import { verificationService } from '../database/verificationService';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export interface DocumentUploadProgress {
  documentType: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface DocumentUploadResult {
  success: boolean;
  documentId?: string;
  filePath?: string;
  error?: string;
}

export class DocumentUploadService {
  private readonly BUCKET_NAME = 'verification-documents';

  // Image quality validation
  async validateImage(imageUri: string): Promise<{
    isValid: boolean;
    error?: string;
    fileSize?: number;
    dimensions?: { width: number; height: number };
  }> {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        return { isValid: false, error: 'File does not exist' };
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (fileInfo.size && fileInfo.size > maxSize) {
        return { isValid: false, error: 'File size exceeds 10MB limit' };
      }

      // For image files, we might want to check dimensions
      // This is a placeholder - in production, you'd use a proper image library
      return {
        isValid: true,
        fileSize: fileInfo.size,
      };
    } catch (error) {
      return { isValid: false, error: 'Failed to validate image' };
    }
  }

  // Upload single document with progress tracking
  async uploadDocument(
    providerId: string,
    documentType: 'cedula_front' | 'cedula_back' | 'selfie' | 'certificate',
    imageUri: string,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<DocumentUploadResult> {
    try {
      // Validate image first
      const validation = await this.validateImage(imageUri);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      onProgress?.({
        documentType,
        progress: 10,
        status: 'uploading'
      });

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${providerId}/${documentType}_${timestamp}.${fileExtension}`;

      // Read file as binary
      const fileData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      onProgress?.({
        documentType,
        progress: 30,
        status: 'uploading'
      });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, decode(fileData), {
          contentType: this.getContentType(fileExtension),
          upsert: true,
        });

      if (uploadError) {
        return { success: false, error: `Upload failed: ${uploadError.message}` };
      }

      onProgress?.({
        documentType,
        progress: 70,
        status: 'processing'
      });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      // Save document record to database
      const documentRecord = await verificationService.uploadDocument({
        provider_id: providerId,
        document_type: documentType,
        file_path: uploadData.path,
        file_name: fileName,
        file_size: validation.fileSize || 0,
        upload_status: 'uploaded',
      });

      onProgress?.({
        documentType,
        progress: 100,
        status: 'completed'
      });

      return {
        success: true,
        documentId: documentRecord.id,
        filePath: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Document upload error:', error);
      onProgress?.({
        documentType,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Upload multiple documents with batch progress
  async uploadMultipleDocuments(
    providerId: string,
    documents: Array<{
      type: 'cedula_front' | 'cedula_back' | 'selfie' | 'certificate';
      uri: string;
    }>,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<DocumentUploadResult[]> {
    const results: DocumentUploadResult[] = [];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

      const result = await this.uploadDocument(
        providerId,
        doc.type,
        doc.uri,
        (progress) => {
          // Adjust progress for batch operation
          const batchProgress = Math.round(
            ((i / documents.length) * 100) + (progress.progress / documents.length)
          );

          onProgress?.({
            ...progress,
            progress: batchProgress,
          });
        }
      );

      results.push(result);

      // If upload fails, you might want to stop or continue
      if (!result.success) {
        console.warn(`Failed to upload ${doc.type}:`, result.error);
      }
    }

    return results;
  }

  // Get document URL
  async getDocumentUrl(filePath: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  }

  // Delete document
  async deleteDocument(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting document:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Image picker helpers
  async pickImageFromCamera(): Promise<ImagePicker.ImagePickerResult> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission is required to take photos');
    }

    return await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: false,
    });
  }

  async pickImageFromLibrary(): Promise<ImagePicker.ImagePickerResult> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission is required to select photos');
    }

    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: false,
    });
  }

  // Helper methods
  private getContentType(fileExtension: string): string {
    switch (fileExtension.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }
}

// Base64 decode helper
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Export singleton instance
export const documentUploadService = new DocumentUploadService();