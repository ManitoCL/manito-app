// =============================================================================
// STORAGE CONFIGURATION - ENTERPRISE SETTINGS
// Epic #2: Profile Management - Storage Configuration
// =============================================================================
// Production-ready storage configuration for Chilean marketplace
// Author: Supabase Infrastructure Specialist
// Created: 2025-09-19

import { StorageConfig, ImageConfig } from '../types/storage';

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// =============================================================================
// IMAGE PROCESSING CONFIGURATIONS
// =============================================================================

export const AVATAR_CONFIG: ImageConfig = {
  sizes: [
    { name: 'thumbnail', width: 64, height: 64 },
    { name: 'small', width: 128, height: 128 },
    { name: 'medium', width: 256, height: 256 },
    { name: 'large', width: 512, height: 512 },
  ],
  quality: 85,
  format: 'webp',
  bucket: 'avatars'
};

export const PORTFOLIO_CONFIG: ImageConfig = {
  sizes: [
    { name: 'thumbnail', width: 300, height: 200 },
    { name: 'small', width: 600, height: 400 },
    { name: 'medium', width: 1200, height: 800 },
    { name: 'large', width: 1920, height: 1280 },
  ],
  quality: 90,
  format: 'webp',
  bucket: 'portfolios'
};

export const DOCUMENT_CONFIG: ImageConfig = {
  sizes: [
    { name: 'thumbnail', width: 200, height: 280 },
    { name: 'preview', width: 600, height: 840 },
  ],
  quality: 95, // Higher quality for document readability
  format: 'webp',
  bucket: 'documents'
};

export const JOB_PHOTO_CONFIG: ImageConfig = {
  sizes: [
    { name: 'thumbnail', width: 200, height: 150 },
    { name: 'small', width: 400, height: 300 },
    { name: 'medium', width: 800, height: 600 },
    { name: 'large', width: 1600, height: 1200 },
  ],
  quality: 88,
  format: 'webp',
  bucket: 'job-photos'
};

// =============================================================================
// MAIN STORAGE CONFIGURATION
// =============================================================================

export const STORAGE_CONFIG: StorageConfig = {
  buckets: {
    avatars: {
      public: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/avif'
      ],
      imageConfig: AVATAR_CONFIG
    },
    portfolios: {
      public: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/avif'
      ],
      imageConfig: PORTFOLIO_CONFIG
    },
    documents: {
      public: false,
      maxFileSize: 15 * 1024 * 1024, // 15MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf'
      ],
      imageConfig: DOCUMENT_CONFIG
    },
    'job-photos': {
      public: false,
      maxFileSize: 8 * 1024 * 1024, // 8MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/avif'
      ],
      imageConfig: JOB_PHOTO_CONFIG
    }
  },
  cdnUrl: `${SUPABASE_URL}/storage/v1/object/public`,
  processingFunction: 'image-processor'
};

// =============================================================================
// CHILEAN MARKET SPECIFIC CONFIGURATIONS
// =============================================================================

export const CHILEAN_CONFIG = {
  // Data residency requirements
  dataResidency: 'Chile' as const,
  regulation: 'Ley 19.628 de Protección de Datos Personales' as const,
  retentionPolicy: '7 years' as const,
  encryptionStandard: 'AES-256' as const,
  processingLocation: 'Santiago, Chile' as const,

  // Document types specific to Chilean verification
  documentTypes: {
    cedula_front: 'Cédula de Identidad (Frontal)',
    cedula_back: 'Cédula de Identidad (Reverso)',
    selfie: 'Selfie de Verificación',
    certificate: 'Certificado de Especialidad',
    rut_certificate: 'Certificado de RUT',
    criminal_background_check: 'Certificado de Antecedentes',
    tax_certificate: 'Certificado Tributario',
    work_permit: 'Permiso de Trabajo',
    business_license: 'Patente Comercial',
    insurance_certificate: 'Certificado de Seguro'
  },

  // Regional upload endpoints for better performance
  uploadEndpoints: {
    primary: 'https://api.supabase.com', // Default
    chile: 'https://supabase.com' // Would be Chile-specific endpoint if available
  },

  // Quality settings optimized for Chilean internet infrastructure
  qualitySettings: {
    mobile: {
      maxWidth: 1200,
      quality: 80,
      format: 'webp' as const
    },
    wifi: {
      maxWidth: 1920,
      quality: 90,
      format: 'webp' as const
    }
  }
};

// =============================================================================
// PROGRESSIVE LOADING CONFIGURATIONS
// =============================================================================

export const PROGRESSIVE_CONFIG = {
  lazyLoading: {
    threshold: 0.1, // Load when 10% visible
    rootMargin: '50px', // Start loading 50px before entering viewport
    triggerOnce: true
  },

  placeholders: {
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcuMjM4NiAyMCAyMCAyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwIDM1QzEwIDI5LjQ3NzEgMTQuNDc3MSAyNSAyMCAyNUMyNS41MjI5IDI1IDMwIDI5LjQ3NzEgMzAgMzVIMTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',

    portfolio: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVMMTc1IDEyNUgxMDBMMTI1IDc1WiIgZmlsbD0iI0Q1REJEQiIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSI2MCIgcj0iMTAiIGZpbGw9IiNEQ0RGRTQiLz4KPC9zdmc+Cg==',

    document: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRjlGQUZCIiBzdHJva2U9IiNFNUU3RUIiLz4KPHJlY3QgeD0iMjAiIHk9IjQwIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjgiIGZpbGw9IiNEQ0RGRTQiLz4KPHJlY3QgeD0iMjAiIHk9IjYwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgiIGZpbGw9IiNEQ0RGRTQiLz4KPHJlY3QgeD0iMjAiIHk9IjgwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjgiIGZpbGw9IiNEQ0RGRTQiLz4KPC9zdmc+Cg=='
  },

  animations: {
    fadeInDuration: 300,
    blurTransitionDuration: 200,
    loadingSpinnerSize: 'large' as const
  }
};

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const VALIDATION_RULES = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    minDimensions: { width: 64, height: 64 },
    maxDimensions: { width: 2048, height: 2048 },
    aspectRatio: { min: 0.8, max: 1.25 }, // Roughly square
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
  },

  portfolio: {
    maxSize: 10 * 1024 * 1024, // 10MB
    minDimensions: { width: 300, height: 200 },
    maxDimensions: { width: 4096, height: 4096 },
    aspectRatio: { min: 0.5, max: 2.0 }, // Wide range for different photo types
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
  },

  document: {
    maxSize: 15 * 1024 * 1024, // 15MB
    minDimensions: { width: 200, height: 280 },
    maxDimensions: { width: 3000, height: 4000 },
    aspectRatio: { min: 0.6, max: 1.5 }, // Document-like ratios
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  },

  jobPhoto: {
    maxSize: 8 * 1024 * 1024, // 8MB
    minDimensions: { width: 200, height: 150 },
    maxDimensions: { width: 4096, height: 3072 },
    aspectRatio: { min: 0.75, max: 1.78 }, // Common photo ratios
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
  }
};

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

export const getStorageConfig = () => STORAGE_CONFIG;
export const getChileanConfig = () => CHILEAN_CONFIG;
export const getProgressiveConfig = () => PROGRESSIVE_CONFIG;
export const getValidationRules = () => VALIDATION_RULES;

export {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY
};