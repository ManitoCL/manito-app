export interface Database {
  public: {
    Tables: {
      provider_profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          phone: string;
          email: string;
          rut?: string;
          date_of_birth?: string;
          region_code?: string;
          provincia_code?: string;
          comuna_code?: string;
          verification_status: 'pending' | 'documents_pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
          rut_validation_status: 'pending' | 'valid' | 'invalid' | 'not_found';
          rut_validation_data?: any;
          background_check_status: 'pending' | 'clean' | 'flagged' | 'criminal_record';
          identity_verification_status: 'pending' | 'passed' | 'failed' | 'manual_review';
          face_match_score?: number;
          manual_review_required: boolean;
          admin_notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          phone: string;
          email: string;
          rut?: string;
          date_of_birth?: string;
          region_code?: string;
          provincia_code?: string;
          comuna_code?: string;
          verification_status?: 'pending' | 'documents_pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
          rut_validation_status?: 'pending' | 'valid' | 'invalid' | 'not_found';
          rut_validation_data?: any;
          background_check_status?: 'pending' | 'clean' | 'flagged' | 'criminal_record';
          identity_verification_status?: 'pending' | 'passed' | 'failed' | 'manual_review';
          face_match_score?: number;
          manual_review_required?: boolean;
          admin_notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          email?: string;
          rut?: string;
          date_of_birth?: string;
          region_code?: string;
          provincia_code?: string;
          comuna_code?: string;
          verification_status?: 'pending' | 'documents_pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
          rut_validation_status?: 'pending' | 'valid' | 'invalid' | 'not_found';
          rut_validation_data?: any;
          background_check_status?: 'pending' | 'clean' | 'flagged' | 'criminal_record';
          identity_verification_status?: 'pending' | 'passed' | 'failed' | 'manual_review';
          face_match_score?: number;
          manual_review_required?: boolean;
          admin_notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      verification_documents: {
        Row: {
          id: string;
          provider_id: string;
          document_type: 'cedula_front' | 'cedula_back' | 'selfie' | 'proof_of_skills' | 'business_license' | 'insurance_certificate';
          document_category: 'identity' | 'skills' | 'business' | 'insurance';
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          upload_status: 'pending' | 'uploaded' | 'processing' | 'processed' | 'failed';
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed';
          ocr_data?: any;
          manual_review_required: boolean;
          approved?: boolean;
          uploaded_at: string;
          uploaded_by?: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          document_type: 'cedula_front' | 'cedula_back' | 'selfie' | 'proof_of_skills' | 'business_license' | 'insurance_certificate';
          document_category?: 'identity' | 'skills' | 'business' | 'insurance';
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          upload_status?: 'pending' | 'uploaded' | 'processing' | 'processed' | 'failed';
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed';
          ocr_data?: any;
          manual_review_required?: boolean;
          approved?: boolean;
          uploaded_at?: string;
          uploaded_by?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          document_type?: 'cedula_front' | 'cedula_back' | 'selfie' | 'proof_of_skills' | 'business_license' | 'insurance_certificate';
          document_category?: 'identity' | 'skills' | 'business' | 'insurance';
          file_name?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          upload_status?: 'pending' | 'uploaded' | 'processing' | 'processed' | 'failed';
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed';
          ocr_data?: any;
          manual_review_required?: boolean;
          approved?: boolean;
          uploaded_at?: string;
          uploaded_by?: string;
        };
      };
      verification_workflows: {
        Row: {
          id: string;
          provider_id: string;
          current_step: 'documents_upload' | 'rut_validation' | 'background_check' | 'identity_verification' | 'manual_review' | 'final_approval' | 'completed' | 'rejected';
          steps_completed: string[];
          auto_verification_possible: boolean;
          started_at: string;
          completed_at?: string;
          final_decision?: 'approved' | 'rejected' | 'pending';
        };
        Insert: {
          id?: string;
          provider_id: string;
          current_step?: 'documents_upload' | 'rut_validation' | 'background_check' | 'identity_verification' | 'manual_review' | 'final_approval' | 'completed' | 'rejected';
          steps_completed?: string[];
          auto_verification_possible?: boolean;
          started_at?: string;
          completed_at?: string;
          final_decision?: 'approved' | 'rejected' | 'pending';
        };
        Update: {
          id?: string;
          provider_id?: string;
          current_step?: 'documents_upload' | 'rut_validation' | 'background_check' | 'identity_verification' | 'manual_review' | 'final_approval' | 'completed' | 'rejected';
          steps_completed?: string[];
          auto_verification_possible?: boolean;
          started_at?: string;
          completed_at?: string;
          final_decision?: 'approved' | 'rejected' | 'pending';
        };
      };
      verification_history: {
        Row: {
          id: string;
          provider_id: string;
          action_type: 'document_uploaded' | 'rut_validation_started' | 'rut_validation_completed' | 'background_check_started' | 'background_check_completed' | 'identity_verification_started' | 'identity_verification_completed' | 'status_changed' | 'approved' | 'rejected';
          performed_by?: string;
          performed_by_type?: 'system' | 'admin' | 'provider';
          action_data?: any;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          action_type: 'document_uploaded' | 'rut_validation_started' | 'rut_validation_completed' | 'background_check_started' | 'background_check_completed' | 'identity_verification_started' | 'identity_verification_completed' | 'status_changed' | 'approved' | 'rejected';
          performed_by?: string;
          performed_by_type?: 'system' | 'admin' | 'provider';
          action_data?: any;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          action_type?: 'document_uploaded' | 'rut_validation_started' | 'rut_validation_completed' | 'background_check_started' | 'background_check_completed' | 'identity_verification_started' | 'identity_verification_completed' | 'status_changed' | 'approved' | 'rejected';
          performed_by?: string;
          performed_by_type?: 'system' | 'admin' | 'provider';
          action_data?: any;
          notes?: string;
          created_at?: string;
        };
      };
      verification_notifications: {
        Row: {
          id: string;
          provider_id: string;
          notification_type: 'verification_started' | 'documents_received' | 'under_review' | 'approved' | 'rejected' | 'resubmission_required';
          send_email: boolean;
          send_push: boolean;
          subject: string;
          message: string;
          status: 'pending' | 'sent' | 'delivered' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          notification_type: 'verification_started' | 'documents_received' | 'under_review' | 'approved' | 'rejected' | 'resubmission_required';
          send_email?: boolean;
          send_push?: boolean;
          subject: string;
          message: string;
          status?: 'pending' | 'sent' | 'delivered' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          notification_type?: 'verification_started' | 'documents_received' | 'under_review' | 'approved' | 'rejected' | 'resubmission_required';
          send_email?: boolean;
          send_push?: boolean;
          subject?: string;
          message?: string;
          status?: 'pending' | 'sent' | 'delivered' | 'failed';
          created_at?: string;
        };
      };
    };
  };
}