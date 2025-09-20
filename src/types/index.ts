// Core user types for Manito marketplace
export type UserType = 'customer' | 'provider';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  userType: UserType;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends User {
  userType: 'customer';
}

export interface Provider extends User {
  userType: 'provider';
  businessName?: string;
  description?: string;
  services: string[];
  serviceAreas: string[];
  hourlyRate?: number;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rating?: number;
  totalReviews: number;
}

// Enhanced Provider Profile for Verification System
export interface ProviderProfile {
  id: string;
  userId: string;

  // Basic Info (from user stories)
  fullName: string;
  rut: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;

  // Service Information
  serviceCategories: string[];
  serviceDescription?: string;
  experienceYears?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;

  // Location & Coverage
  regionCode: string;
  provinceCode: string;
  comunaCode: string;
  serviceAreas: string[];

  // Business Info
  businessName?: string;
  businessRut?: string;
  taxRegime: 'persona_natural' | 'empresa';

  // Verification Status
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;

  // Validation Results
  rutValidationStatus: ValidationStatus;
  rutValidationData?: any;
  backgroundCheckStatus: BackgroundCheckStatus;
  backgroundCheckData?: any;
  backgroundCheckDate?: string;

  // Identity Verification
  identityVerificationStatus: IdentityVerificationStatus;
  faceMatchScore?: number;
  livenessCheckPassed?: boolean;
  ocrData?: any;

  // Admin Review
  adminNotes?: string;
  rejectionReason?: string;
  manualReviewRequired: boolean;
  reviewPriority: number;

  // Performance
  totalJobs: number;
  completedJobs: number;
  averageRating: number;
  totalReviews: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Verification Status Types
export type VerificationStatus =
  | 'pending'
  | 'documents_pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type ValidationStatus = 'pending' | 'valid' | 'invalid' | 'not_found';

export type BackgroundCheckStatus = 'pending' | 'clean' | 'flagged' | 'criminal_record';

export type IdentityVerificationStatus = 'pending' | 'passed' | 'failed' | 'manual_review';

// Verification Documents
export interface VerificationDocument {
  id: string;
  providerId: string;

  // Document Classification
  documentType: DocumentType;
  documentCategory: DocumentCategory;

  // File Information
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileHash?: string;

  // Processing Status
  uploadStatus: UploadStatus;
  processingStatus: ProcessingStatus;

  // OCR Results
  ocrStatus: OCRStatus;
  ocrData?: any;
  ocrConfidence?: number;

  // Quality Assessment
  imageQualityScore?: number;
  blurDetected?: boolean;
  lightingQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  documentEdgesDetected?: boolean;

  // Review
  manualReviewRequired: boolean;
  manualReviewReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;

  // Approval
  approved?: boolean;
  rejectionReason?: string;

  // Timestamps
  uploadedAt: string;
  processedAt?: string;
  expiresAt?: string;

  // Audit
  uploadedBy: string;
  ipAddress?: string;
  userAgent?: string;
}

export type DocumentType =
  | 'cedula_front'
  | 'cedula_back'
  | 'selfie'
  | 'proof_of_skills'
  | 'business_license'
  | 'insurance_certificate';

export type DocumentCategory = 'identity' | 'skills' | 'business' | 'insurance';

export type UploadStatus = 'pending' | 'uploaded' | 'processing' | 'processed' | 'failed';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';

export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Verification Workflow
export interface VerificationWorkflow {
  id: string;
  providerId: string;

  // Workflow State
  currentStep: WorkflowStep;
  stepsCompleted: string[];
  stepsFailed: string[];
  totalSteps: number;

  // Automation
  autoVerificationPossible: boolean;
  autoVerificationScore?: number;
  manualReviewReasons: string[];

  // Timing
  startedAt: string;
  estimatedCompletion?: string;
  completedAt?: string;

  // Assignment
  assignedReviewer?: string;
  assignedAt?: string;
  priorityLevel: number;

  // Results
  finalDecision?: 'approved' | 'rejected' | 'pending';
  decisionReason?: string;
  decisionMadeBy?: string;
  decisionMadeAt?: string;
}

export type WorkflowStep =
  | 'documents_upload'
  | 'rut_validation'
  | 'background_check'
  | 'identity_verification'
  | 'manual_review'
  | 'final_approval'
  | 'completed'
  | 'rejected';

// Verification History
export interface VerificationHistory {
  id: string;
  providerId: string;
  workflowId?: string;

  // Action Details
  actionType: VerificationAction;
  previousStatus?: string;
  newStatus?: string;

  // Actor
  performedBy?: string;
  performedByType: 'system' | 'admin' | 'provider';

  // Data
  actionData?: any;
  notes?: string;

  // Context
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export type VerificationAction =
  | 'document_uploaded'
  | 'rut_validation_started'
  | 'rut_validation_completed'
  | 'background_check_started'
  | 'background_check_completed'
  | 'identity_verification_started'
  | 'identity_verification_completed'
  | 'manual_review_assigned'
  | 'manual_review_completed'
  | 'status_changed'
  | 'approved'
  | 'rejected'
  | 'resubmission_requested';

// Verification Notifications
export interface VerificationNotification {
  id: string;
  providerId: string;

  // Notification Details
  notificationType: NotificationType;

  // Delivery Channels
  sendEmail: boolean;
  sendSms: boolean;
  sendWhatsapp: boolean;
  sendPush: boolean;

  // Content
  subject: string;
  message: string;
  actionUrl?: string;

  // Status
  status: NotificationStatus;

  // Delivery Tracking
  emailSentAt?: string;
  smsSentAt?: string;
  whatsappSentAt?: string;
  pushSentAt?: string;

  // Metadata
  priority: number;
  retryCount: number;
  maxRetries: number;

  // Timestamps
  createdAt: string;
  scheduledFor: string;
  processedAt?: string;
}

export type NotificationType =
  | 'verification_started'
  | 'documents_received'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'resubmission_required'
  | 'additional_documents_needed';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  UserTypeSelection: undefined;
  SignUp: { userType: UserType };
  EmailVerificationPending: {
    email: string;
    userType: UserType;
  };
  EmailConfirmation: {
    email: string;
    userType: UserType;
    isSignUp: boolean;
    password?: string;
  };
  EmailConfirmed: undefined;
  // META/REDDIT STANDARD: Universal auth verification routes
  AuthVerified: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: string;
    token_type?: string;
    auth_method?: string;
    flow_type?: string;
    verified?: string;
    token_hash?: string;
    type?: string;
  };
  AuthCallback: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: string;
    token_type?: string;
    auth_method?: string;
    flow_type?: string;
    verified?: string;
    token_hash?: string;
    type?: string;
  };
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  CustomerProfile: undefined;
  MainTabs: undefined;
  ProviderProfile: undefined;
  ProfileManagement: undefined;
  ProviderVerification: undefined;
};

export type ProfileSetupStackParamList = {
  // Removed: EmailVerificationPending (legacy polling screen, handled by deep link now)
  OnboardingFlow: undefined;
  ProfileCompletion: undefined;
};

// Americas country codes (excluding Caribbean as requested)
export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
}

export const AMERICAS_COUNTRIES: Record<string, CountryInfo> = {
  'AR': { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  'BO': { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  'BR': { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  'CA': { code: '+1', name: 'Canada', flag: '🇨🇦' },
  'CL': { code: '+56', name: 'Chile', flag: '🇨🇱' },
  'CO': { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  'CR': { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  'EC': { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  'SV': { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
  'GT': { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  'HN': { code: '+504', name: 'Honduras', flag: '🇭🇳' },
  'MX': { code: '+52', name: 'México', flag: '🇲🇽' },
  'NI': { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  'PA': { code: '+507', name: 'Panamá', flag: '🇵🇦' },
  'PY': { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  'PE': { code: '+51', name: 'Perú', flag: '🇵🇪' },
  'US': { code: '+1', name: 'United States', flag: '🇺🇸' },
  'UY': { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  'VE': { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
} as const;

// Supabase Database Types (matching deployed schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          user_type: 'customer' | 'provider' | 'admin';
          phone_number: string | null;
          whatsapp_number: string | null;
          rut_number: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          user_type?: 'customer' | 'provider' | 'admin';
          phone_number?: string | null;
          whatsapp_number?: string | null;
          rut_number?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          user_type?: 'customer' | 'provider' | 'admin';
          phone_number?: string | null;
          whatsapp_number?: string | null;
          rut_number?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      provider_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string | null;
          services_offered: string[];
          service_areas: string[];
          comuna: string;
          verification_status: 'pending' | 'in_review' | 'approved' | 'rejected';
          verification_score: number;
          is_identity_verified: boolean;
          is_background_checked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name?: string | null;
          services_offered?: string[];
          service_areas?: string[];
          comuna: string;
          verification_status?: 'pending' | 'in_review' | 'approved' | 'rejected';
          verification_score?: number;
          is_identity_verified?: boolean;
          is_background_checked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string | null;
          services_offered?: string[];
          service_areas?: string[];
          comuna?: string;
          verification_status?: 'pending' | 'in_review' | 'approved' | 'rejected';
          verification_score?: number;
          is_identity_verified?: boolean;
          is_background_checked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      verification_documents: {
        Row: {
          id: string;
          provider_id: string;
          document_type: 'cedula_front' | 'cedula_back' | 'selfie' | 'certificate';
          file_path: string;
          file_name: string;
          file_size: number;
          upload_status: 'uploading' | 'uploaded' | 'processing' | 'verified' | 'rejected';
          verification_result: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          document_type: 'cedula_front' | 'cedula_back' | 'selfie' | 'certificate';
          file_path: string;
          file_name: string;
          file_size: number;
          upload_status?: 'uploading' | 'uploaded' | 'processing' | 'verified' | 'rejected';
          verification_result?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          document_type?: 'cedula_front' | 'cedula_back' | 'selfie' | 'certificate';
          file_path?: string;
          file_name?: string;
          file_size?: number;
          upload_status?: 'uploading' | 'uploaded' | 'processing' | 'verified' | 'rejected';
          verification_result?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      verification_workflows: {
        Row: {
          id: string;
          provider_id: string;
          workflow_step: 'documents' | 'identity' | 'background' | 'admin_review';
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          started_at: string;
          completed_at: string | null;
          error_message: string | null;
          retry_count: number;
          metadata: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          workflow_step: 'documents' | 'identity' | 'background' | 'admin_review';
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          started_at?: string;
          completed_at?: string | null;
          error_message?: string | null;
          retry_count?: number;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          workflow_step?: 'documents' | 'identity' | 'background' | 'admin_review';
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          started_at?: string;
          completed_at?: string | null;
          error_message?: string | null;
          retry_count?: number;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_provider_verification_status: {
        Args: { provider_id: string };
        Returns: {
          verification_status: string;
          verification_score: number;
          missing_documents: string[];
          next_steps: string[];
        };
      };
      calculate_verification_score: {
        Args: { provider_id: string };
        Returns: number;
      };
    };
  };
}