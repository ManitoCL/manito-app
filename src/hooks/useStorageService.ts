// =============================================================================
// STORAGE SERVICE HOOKS - REACT NATIVE INTEGRATION
// Epic #2: Profile Management - React Native Hooks
// =============================================================================
// Enterprise Redux-first hooks for storage operations in Chilean marketplace
// Author: Supabase Infrastructure Specialist
// Created: 2025-09-19

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '../store';
import { getStorageService } from '../services/storageService';
import {
  StorageBucket,
  ImageType,
  UploadRequest,
  UploadResponse,
  UserAvatar,
  PortfolioImage,
  VerificationDocument,
  JobPhoto,
  StorageEvent,
  StorageEventListener,
  PortfolioFilter,
  DocumentFilter
} from '../types/storage';

// =============================================================================
// UPLOAD HOOK WITH PROGRESS TRACKING
// =============================================================================

interface UseUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: UploadResponse | null;
}

export const useUpload = () => {
  const [state, setState] = useState<UseUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFile: null
  });

  const upload = useCallback(async (request: UploadRequest): Promise<UploadResponse> => {
    setState({
      isUploading: true,
      progress: 0,
      error: null,
      uploadedFile: null
    });

    try {
      const storageService = getStorageService();

      const uploadRequest: UploadRequest = {
        ...request,
        onProgress: (progress: number) => {
          setState(prev => ({ ...prev, progress }));
        }
      };

      const response = await storageService.uploadFile(uploadRequest);

      setState({
        isUploading: false,
        progress: 100,
        error: response.success ? null : response.error || 'Upload failed',
        uploadedFile: response.success ? response : null
      });

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        uploadedFile: null
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null
    });
  }, []);

  return {
    ...state,
    upload,
    reset
  };
};

// =============================================================================
// AVATAR MANAGEMENT HOOK
// =============================================================================

interface UseAvatarState {
  avatar: UserAvatar | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export const useAvatar = (userId?: string) => {
  const currentUser = useAppSelector(state => state.auth.user);
  const targetUserId = userId || currentUser?.id;

  const [state, setState] = useState<UseAvatarState>({
    avatar: null,
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    error: null
  });

  // Load avatar on mount and user change
  useEffect(() => {
    if (targetUserId) {
      loadAvatar(targetUserId);
    }
  }, [targetUserId]);

  const loadAvatar = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const storageService = getStorageService();
      const avatar = await storageService.getUserAvatar(userId);

      setState(prev => ({
        ...prev,
        avatar,
        isLoading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load avatar'
      }));
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<UserAvatar | null> => {
    if (!targetUserId) {
      setState(prev => ({ ...prev, error: 'User ID not available' }));
      return null;
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null
    }));

    try {
      const storageService = getStorageService();

      const avatar = await storageService.uploadAvatar(
        targetUserId,
        file,
        (progress) => {
          setState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );

      setState(prev => ({
        ...prev,
        avatar: avatar || prev.avatar,
        isUploading: false,
        uploadProgress: 100
      }));

      return avatar;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'Avatar upload failed'
      }));
      return null;
    }
  }, [targetUserId]);

  const getAvatarUrl = useCallback((size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string | null => {
    if (!state.avatar) return null;

    const storageService = getStorageService();

    // For thumbnails, use the thumbnail path if available
    if (size === 'thumbnail' && state.avatar.thumbnail_path) {
      return storageService.getPublicUrl('avatars', state.avatar.thumbnail_path);
    }

    // Otherwise use the main file path
    return storageService.getPublicUrl('avatars', state.avatar.file_path);
  }, [state.avatar]);

  return {
    ...state,
    uploadAvatar,
    getAvatarUrl,
    refresh: () => targetUserId && loadAvatar(targetUserId)
  };
};

// =============================================================================
// PORTFOLIO MANAGEMENT HOOK
// =============================================================================

interface UsePortfolioState {
  images: PortfolioImage[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  hasMore: boolean;
}

export const usePortfolio = (providerId: string, initialFilter: PortfolioFilter = {}) => {
  const [state, setState] = useState<UsePortfolioState>({
    images: [],
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    hasMore: true
  });

  const [filter, setFilter] = useState<PortfolioFilter>({
    provider_id: providerId,
    ...initialFilter
  });

  // Load images when filter changes
  useEffect(() => {
    loadImages();
  }, [filter]);

  const loadImages = useCallback(async (append = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const storageService = getStorageService();
      const newImages = await storageService.getPortfolioImages(filter);

      setState(prev => ({
        ...prev,
        images: append ? [...prev.images, ...newImages] : newImages,
        isLoading: false,
        hasMore: newImages.length === (filter.limit || 10)
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load portfolio images'
      }));
    }
  }, [filter]);

  const uploadImage = useCallback(async (
    file: File,
    metadata: {
      title?: string;
      description?: string;
      projectType?: string;
      isBeforePhoto?: boolean;
      isAfterPhoto?: boolean;
      isFeatured?: boolean;
    } = {}
  ): Promise<PortfolioImage | null> => {
    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null
    }));

    try {
      const storageService = getStorageService();

      const image = await storageService.uploadPortfolioImage(providerId, file, metadata);

      if (image) {
        setState(prev => ({
          ...prev,
          images: [image, ...prev.images],
          isUploading: false,
          uploadProgress: 100
        }));
      } else {
        setState(prev => ({
          ...prev,
          isUploading: false,
          uploadProgress: 0,
          error: 'Failed to upload image'
        }));
      }

      return image;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'Image upload failed'
      }));
      return null;
    }
  }, [providerId]);

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading) {
      const newFilter = {
        ...filter,
        offset: (filter.offset || 0) + (filter.limit || 10)
      };
      setFilter(newFilter);
    }
  }, [state.hasMore, state.isLoading, filter]);

  const updateFilter = useCallback((newFilter: Partial<PortfolioFilter>) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter,
      offset: 0 // Reset offset when filter changes
    }));
  }, []);

  const getImageUrl = useCallback((
    image: PortfolioImage,
    size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'
  ): string | null => {
    const storageService = getStorageService();

    // For thumbnails, use the thumbnail path if available
    if (size === 'thumbnail' && image.thumbnail_path) {
      return storageService.getPublicUrl('portfolios', image.thumbnail_path);
    }

    // Otherwise use the main file path
    return storageService.getPublicUrl('portfolios', image.file_path);
  }, []);

  return {
    ...state,
    uploadImage,
    loadMore,
    updateFilter,
    getImageUrl,
    refresh: () => loadImages()
  };
};

// =============================================================================
// VERIFICATION DOCUMENTS HOOK
// =============================================================================

interface UseVerificationDocumentsState {
  documents: VerificationDocument[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export const useVerificationDocuments = (providerId: string) => {
  const [state, setState] = useState<UseVerificationDocumentsState>({
    documents: [],
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    error: null
  });

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [providerId]);

  const loadDocuments = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const storageService = getStorageService();
      const documents = await storageService.getVerificationDocuments({
        provider_id: providerId
      });

      setState(prev => ({
        ...prev,
        documents,
        isLoading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load documents'
      }));
    }
  }, [providerId]);

  const uploadDocument = useCallback(async (
    file: File,
    documentType: string,
    metadata: Record<string, any> = {}
  ): Promise<VerificationDocument | null> => {
    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null
    }));

    try {
      const storageService = getStorageService();

      const document = await storageService.uploadVerificationDocument(
        providerId,
        file,
        documentType,
        metadata
      );

      if (document) {
        setState(prev => ({
          ...prev,
          documents: [document, ...prev.documents],
          isUploading: false,
          uploadProgress: 100
        }));
      } else {
        setState(prev => ({
          ...prev,
          isUploading: false,
          uploadProgress: 0,
          error: 'Failed to upload document'
        }));
      }

      return document;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'Document upload failed'
      }));
      return null;
    }
  }, [providerId]);

  const getDocumentUrl = useCallback(async (document: VerificationDocument): Promise<string | null> => {
    const storageService = getStorageService();

    // Documents are private, so we need signed URLs
    return await storageService.getSignedUrl('documents', document.file_path);
  }, []);

  const getDocumentsByType = useCallback((documentType: string): VerificationDocument[] => {
    return state.documents.filter(doc => doc.document_type === documentType);
  }, [state.documents]);

  return {
    ...state,
    uploadDocument,
    getDocumentUrl,
    getDocumentsByType,
    refresh: loadDocuments
  };
};

// =============================================================================
// STORAGE EVENTS HOOK
// =============================================================================

export const useStorageEvents = (eventTypes: string[] = []) => {
  const [events, setEvents] = useState<StorageEvent[]>([]);
  const listenersRef = useRef<Map<string, StorageEventListener>>(new Map());

  useEffect(() => {
    const storageService = getStorageService();

    // Set up event listeners
    eventTypes.forEach(eventType => {
      const listener: StorageEventListener = (event) => {
        setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
      };

      storageService.onStorageEvent(eventType, listener);
      listenersRef.current.set(eventType, listener);
    });

    // Cleanup
    return () => {
      listenersRef.current.forEach((listener, eventType) => {
        storageService.offStorageEvent(eventType, listener);
      });
      listenersRef.current.clear();
    };
  }, [eventTypes]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const getEventsByType = useCallback((eventType: string): StorageEvent[] => {
    return events.filter(event => event.type === eventType);
  }, [events]);

  return {
    events,
    clearEvents,
    getEventsByType
  };
};

// =============================================================================
// COMPREHENSIVE STORAGE HOOK
// =============================================================================

export const useStorage = () => {
  const user = useAppSelector(state => state.auth.user);
  const upload = useUpload();

  const avatar = useAvatar(user?.id);

  const portfolio = usePortfolio(
    user?.user_type === 'provider' ? user.id : '',
    { limit: 20 }
  );

  const documents = useVerificationDocuments(
    user?.user_type === 'provider' ? user.id : ''
  );

  const events = useStorageEvents([
    'upload_completed',
    'upload_failed',
    'processing_completed',
    'processing_failed'
  ]);

  return {
    // General upload
    upload,

    // Avatar management
    avatar,

    // Portfolio management
    portfolio: user?.user_type === 'provider' ? portfolio : null,

    // Document verification
    documents: user?.user_type === 'provider' ? documents : null,

    // Events
    events,

    // Utilities
    user
  };
};