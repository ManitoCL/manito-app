-- Safe Migration Script for Provider Verification Schema
-- This script checks what exists and only creates missing tables/columns

-- =====================================================================================
-- PROVIDER PROFILES MIGRATION
-- =====================================================================================

-- Check if provider_profiles exists and add missing columns
DO $$
BEGIN
    -- Add missing columns to provider_profiles if they don't exist

    -- RUT field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'rut') THEN
        ALTER TABLE provider_profiles ADD COLUMN rut TEXT;
        ALTER TABLE provider_profiles ADD CONSTRAINT provider_profiles_rut_unique UNIQUE (rut);
    END IF;

    -- Date of birth
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE provider_profiles ADD COLUMN date_of_birth DATE;
    END IF;

    -- Chilean location fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'region_code') THEN
        ALTER TABLE provider_profiles ADD COLUMN region_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'provincia_code') THEN
        ALTER TABLE provider_profiles ADD COLUMN provincia_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'comuna_code') THEN
        ALTER TABLE provider_profiles ADD COLUMN comuna_code TEXT;
    END IF;

    -- Verification status fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'verification_status') THEN
        ALTER TABLE provider_profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
        ALTER TABLE provider_profiles ADD CONSTRAINT provider_profiles_verification_status_check
            CHECK (verification_status IN ('pending', 'documents_pending', 'under_review', 'approved', 'rejected', 'suspended'));
    END IF;

    -- RUT validation fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'rut_validation_status') THEN
        ALTER TABLE provider_profiles ADD COLUMN rut_validation_status TEXT DEFAULT 'pending';
        ALTER TABLE provider_profiles ADD CONSTRAINT provider_profiles_rut_validation_status_check
            CHECK (rut_validation_status IN ('pending', 'valid', 'invalid', 'not_found'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'rut_validation_data') THEN
        ALTER TABLE provider_profiles ADD COLUMN rut_validation_data JSONB;
    END IF;

    -- Background check fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'background_check_status') THEN
        ALTER TABLE provider_profiles ADD COLUMN background_check_status TEXT DEFAULT 'pending';
        ALTER TABLE provider_profiles ADD CONSTRAINT provider_profiles_background_check_status_check
            CHECK (background_check_status IN ('pending', 'clean', 'flagged', 'criminal_record'));
    END IF;

    -- Identity verification fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'identity_verification_status') THEN
        ALTER TABLE provider_profiles ADD COLUMN identity_verification_status TEXT DEFAULT 'pending';
        ALTER TABLE provider_profiles ADD CONSTRAINT provider_profiles_identity_verification_status_check
            CHECK (identity_verification_status IN ('pending', 'passed', 'failed', 'manual_review'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'face_match_score') THEN
        ALTER TABLE provider_profiles ADD COLUMN face_match_score DECIMAL(5,4);
    END IF;

    -- Admin review fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'manual_review_required') THEN
        ALTER TABLE provider_profiles ADD COLUMN manual_review_required BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'provider_profiles' AND column_name = 'admin_notes') THEN
        ALTER TABLE provider_profiles ADD COLUMN admin_notes TEXT;
    END IF;

END $$;

-- =====================================================================================
-- CREATE MISSING VERIFICATION TABLES
-- =====================================================================================

-- Create verification_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,

  document_type TEXT NOT NULL
    CHECK (document_type IN ('cedula_front', 'cedula_back', 'selfie', 'proof_of_skills', 'business_license', 'insurance_certificate')),
  document_category TEXT NOT NULL DEFAULT 'identity'
    CHECK (document_category IN ('identity', 'skills', 'business', 'insurance')),

  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,

  upload_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (upload_status IN ('pending', 'uploaded', 'processing', 'processed', 'failed')),
  processing_status TEXT DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'manual_review')),

  ocr_status TEXT DEFAULT 'pending'
    CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_data JSONB,

  manual_review_required BOOLEAN DEFAULT FALSE,
  approved BOOLEAN,

  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Create verification_workflows table if it doesn't exist
CREATE TABLE IF NOT EXISTS verification_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,

  current_step TEXT NOT NULL DEFAULT 'documents_upload'
    CHECK (current_step IN (
      'documents_upload',
      'rut_validation',
      'background_check',
      'identity_verification',
      'manual_review',
      'final_approval',
      'completed',
      'rejected'
    )),

  steps_completed TEXT[] DEFAULT '{}',
  auto_verification_possible BOOLEAN DEFAULT FALSE,

  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  final_decision TEXT CHECK (final_decision IN ('approved', 'rejected', 'pending'))
);

-- Create verification_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,

  action_type TEXT NOT NULL
    CHECK (action_type IN (
      'document_uploaded',
      'rut_validation_started',
      'rut_validation_completed',
      'background_check_started',
      'background_check_completed',
      'identity_verification_started',
      'identity_verification_completed',
      'status_changed',
      'approved',
      'rejected'
    )),

  performed_by UUID REFERENCES auth.users(id),
  performed_by_type TEXT CHECK (performed_by_type IN ('system', 'admin', 'provider')),

  action_data JSONB,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS verification_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,

  notification_type TEXT NOT NULL
    CHECK (notification_type IN (
      'verification_started',
      'documents_received',
      'under_review',
      'approved',
      'rejected',
      'resubmission_required'
    )),

  send_email BOOLEAN DEFAULT TRUE,
  send_push BOOLEAN DEFAULT TRUE,

  subject TEXT NOT NULL,
  message TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- CREATE INDEXES (only if they don't exist)
-- =====================================================================================

CREATE INDEX IF NOT EXISTS idx_provider_profiles_rut ON provider_profiles(rut);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_verification_status ON provider_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_comuna ON provider_profiles(comuna_code);

CREATE INDEX IF NOT EXISTS idx_verification_documents_provider_id ON verification_documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_type ON verification_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_verification_workflows_provider_id ON verification_workflows(provider_id);
CREATE INDEX IF NOT EXISTS idx_verification_workflows_step ON verification_workflows(current_step);

-- =====================================================================================
-- ENABLE RLS (if not already enabled)
-- =====================================================================================

DO $$
BEGIN
    -- Enable RLS on provider_profiles if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class
        WHERE relname = 'provider_profiles' AND relrowsecurity = true
    ) THEN
        ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================================================
-- CREATE RLS POLICIES (with IF NOT EXISTS equivalent)
-- =====================================================================================

DROP POLICY IF EXISTS "Providers can view own profile" ON provider_profiles;
CREATE POLICY "Providers can view own profile" ON provider_profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Providers can update own profile" ON provider_profiles;
CREATE POLICY "Providers can update own profile" ON provider_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Similar policies for other tables...
DROP POLICY IF EXISTS "Providers can manage own documents" ON verification_documents;
CREATE POLICY "Providers can manage own documents" ON verification_documents
  FOR ALL USING (
    provider_id IN (
      SELECT id FROM provider_profiles WHERE user_id = auth.uid()
    )
  );

SELECT 'Migration completed successfully!' as result;