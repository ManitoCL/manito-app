-- Provider Verification Database Schema
-- Based on User Stories Lines 48-109: Maestro Onboarding & Verification

-- =====================================================================================
-- PROVIDER PROFILES TABLE
-- =====================================================================================
-- Extended from basic user table to include provider-specific information
CREATE TABLE provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Provider Info (from user stories)
  full_name TEXT NOT NULL,
  rut TEXT NOT NULL UNIQUE, -- Chilean tax ID (required per user stories)
  date_of_birth DATE NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Service Information
  service_categories TEXT[] NOT NULL DEFAULT '{}', -- ['plumber', 'electrician', etc.]
  service_description TEXT,
  experience_years INTEGER,
  hourly_rate_min INTEGER, -- in Chilean pesos
  hourly_rate_max INTEGER,

  -- Location & Coverage
  region_code TEXT NOT NULL, -- Chilean region
  province_code TEXT NOT NULL, -- Chilean province
  comuna_code TEXT NOT NULL, -- Chilean comuna (required per user stories)
  service_areas TEXT[] DEFAULT '{}', -- Additional comunas they serve

  -- Business Info (optional)
  business_name TEXT,
  business_rut TEXT, -- For registered businesses
  tax_regime TEXT DEFAULT 'persona_natural', -- persona_natural | empresa

  -- Verification Status
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'documents_pending', 'under_review', 'approved', 'rejected', 'suspended')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id), -- Admin who approved

  -- RUT & Background Check Results
  rut_validation_status TEXT DEFAULT 'pending'
    CHECK (rut_validation_status IN ('pending', 'valid', 'invalid', 'not_found')),
  rut_validation_data JSONB, -- API response from Registro Civil
  background_check_status TEXT DEFAULT 'pending'
    CHECK (background_check_status IN ('pending', 'clean', 'flagged', 'criminal_record')),
  background_check_data JSONB, -- Antecedentes criminales result
  background_check_date TIMESTAMP WITH TIME ZONE,

  -- Identity Verification
  identity_verification_status TEXT DEFAULT 'pending'
    CHECK (identity_verification_status IN ('pending', 'passed', 'failed', 'manual_review')),
  face_match_score DECIMAL(5,4), -- 0.0000 to 1.0000
  liveness_check_passed BOOLEAN,
  ocr_data JSONB, -- Extracted data from ID documents

  -- Admin Notes & Review
  admin_notes TEXT,
  rejection_reason TEXT,
  manual_review_required BOOLEAN DEFAULT FALSE,
  review_priority INTEGER DEFAULT 0, -- Higher number = higher priority

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Performance tracking
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0
);

-- =====================================================================================
-- VERIFICATION DOCUMENTS TABLE
-- =====================================================================================
-- Stores uploaded documents per user stories: Cédula front/back, selfie, proof of skills
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,

  -- Document Classification
  document_type TEXT NOT NULL
    CHECK (document_type IN ('cedula_front', 'cedula_back', 'selfie', 'proof_of_skills', 'business_license', 'insurance_certificate')),
  document_category TEXT NOT NULL DEFAULT 'identity'
    CHECK (document_category IN ('identity', 'skills', 'business', 'insurance')),

  -- File Information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_hash TEXT, -- For duplicate detection

  -- Processing Status
  upload_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (upload_status IN ('pending', 'uploaded', 'processing', 'processed', 'failed')),
  processing_status TEXT DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'manual_review')),

  -- OCR & Analysis Results
  ocr_status TEXT DEFAULT 'pending'
    CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_data JSONB, -- Extracted text, RUT, name, etc.
  ocr_confidence DECIMAL(3,2), -- 0.00 to 1.00

  -- Quality Assessment
  image_quality_score DECIMAL(3,2), -- 0.00 to 1.00
  blur_detected BOOLEAN,
  lighting_quality TEXT CHECK (lighting_quality IN ('poor', 'fair', 'good', 'excellent')),
  document_edges_detected BOOLEAN,

  -- Manual Review
  manual_review_required BOOLEAN DEFAULT FALSE,
  manual_review_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,

  -- Approval/Rejection
  approved BOOLEAN,
  rejection_reason TEXT,

  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- For temporary documents

  -- Audit
  uploaded_by UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT
);

-- =====================================================================================
-- VERIFICATION WORKFLOW TABLE
-- =====================================================================================
-- Tracks the verification process workflow and state transitions
CREATE TABLE verification_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,

  -- Workflow State
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

  -- Progress Tracking
  steps_completed TEXT[] DEFAULT '{}',
  steps_failed TEXT[] DEFAULT '{}',
  total_steps INTEGER DEFAULT 6,

  -- Automation Results
  auto_verification_possible BOOLEAN DEFAULT FALSE,
  auto_verification_score DECIMAL(5,4), -- Combined confidence score
  manual_review_reasons TEXT[],

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_completion TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Assignment
  assigned_reviewer UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  priority_level INTEGER DEFAULT 1, -- 1=low, 2=normal, 3=high, 4=urgent

  -- Results
  final_decision TEXT CHECK (final_decision IN ('approved', 'rejected', 'pending')),
  decision_reason TEXT,
  decision_made_by UUID REFERENCES auth.users(id),
  decision_made_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================================================
-- VERIFICATION HISTORY TABLE
-- =====================================================================================
-- Audit trail of all verification actions and status changes
CREATE TABLE verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES verification_workflows(id),

  -- Action Details
  action_type TEXT NOT NULL
    CHECK (action_type IN (
      'document_uploaded',
      'rut_validation_started',
      'rut_validation_completed',
      'background_check_started',
      'background_check_completed',
      'identity_verification_started',
      'identity_verification_completed',
      'manual_review_assigned',
      'manual_review_completed',
      'status_changed',
      'approved',
      'rejected',
      'resubmission_requested'
    )),

  -- Status Changes
  previous_status TEXT,
  new_status TEXT,

  -- Actor Information
  performed_by UUID REFERENCES auth.users(id),
  performed_by_type TEXT CHECK (performed_by_type IN ('system', 'admin', 'provider')),

  -- Action Data
  action_data JSONB, -- Flexible data for specific actions
  notes TEXT,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- NOTIFICATION QUEUE TABLE
-- =====================================================================================
-- Manages notifications for verification status updates per user stories
CREATE TABLE verification_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,

  -- Notification Details
  notification_type TEXT NOT NULL
    CHECK (notification_type IN (
      'verification_started',
      'documents_received',
      'under_review',
      'approved',
      'rejected',
      'resubmission_required',
      'additional_documents_needed'
    )),

  -- Delivery Channels
  send_email BOOLEAN DEFAULT TRUE,
  send_sms BOOLEAN DEFAULT FALSE,
  send_whatsapp BOOLEAN DEFAULT FALSE,
  send_push BOOLEAN DEFAULT TRUE,

  -- Content
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Deep link for app actions

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),

  -- Delivery Tracking
  email_sent_at TIMESTAMP WITH TIME ZONE,
  sms_sent_at TIMESTAMP WITH TIME ZONE,
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
  push_sent_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  priority INTEGER DEFAULT 1, -- 1=low, 2=normal, 3=high
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Provider profiles indexes
CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_provider_profiles_rut ON provider_profiles(rut);
CREATE INDEX idx_provider_profiles_verification_status ON provider_profiles(verification_status);
CREATE INDEX idx_provider_profiles_comuna ON provider_profiles(comuna_code);
CREATE INDEX idx_provider_profiles_service_categories ON provider_profiles USING GIN(service_categories);
CREATE INDEX idx_provider_profiles_service_areas ON provider_profiles USING GIN(service_areas);

-- Documents indexes
CREATE INDEX idx_verification_documents_provider_id ON verification_documents(provider_id);
CREATE INDEX idx_verification_documents_type ON verification_documents(document_type);
CREATE INDEX idx_verification_documents_status ON verification_documents(processing_status);
CREATE INDEX idx_verification_documents_manual_review ON verification_documents(manual_review_required) WHERE manual_review_required = TRUE;

-- Workflow indexes
CREATE INDEX idx_verification_workflows_provider_id ON verification_workflows(provider_id);
CREATE INDEX idx_verification_workflows_step ON verification_workflows(current_step);
CREATE INDEX idx_verification_workflows_reviewer ON verification_workflows(assigned_reviewer);
CREATE INDEX idx_verification_workflows_priority ON verification_workflows(priority_level DESC);

-- History indexes
CREATE INDEX idx_verification_history_provider_id ON verification_history(provider_id);
CREATE INDEX idx_verification_history_action_type ON verification_history(action_type);
CREATE INDEX idx_verification_history_created_at ON verification_history(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_verification_notifications_provider_id ON verification_notifications(provider_id);
CREATE INDEX idx_verification_notifications_status ON verification_notifications(status);
CREATE INDEX idx_verification_notifications_scheduled ON verification_notifications(scheduled_for) WHERE status = 'pending';

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_notifications ENABLE ROW LEVEL SECURITY;

-- Provider profiles policies
CREATE POLICY "Providers can view own profile" ON provider_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Providers can update own profile" ON provider_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON provider_profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Documents policies
CREATE POLICY "Providers can manage own documents" ON verification_documents
  FOR ALL USING (
    provider_id IN (
      SELECT id FROM provider_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all documents" ON verification_documents
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Similar policies for other tables...

-- =====================================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================================================

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_provider_profiles_updated_at
  BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Workflow progress trigger
CREATE OR REPLACE FUNCTION update_workflow_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update workflow steps when documents are processed
  IF NEW.processing_status = 'completed' AND OLD.processing_status != 'completed' THEN
    UPDATE verification_workflows
    SET steps_completed = array_append(steps_completed, 'document_' || NEW.document_type)
    WHERE provider_id = NEW.provider_id;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_on_document_completion
  AFTER UPDATE ON verification_documents
  FOR EACH ROW EXECUTE FUNCTION update_workflow_progress();

-- =====================================================================================
-- INITIAL DATA / FUNCTIONS
-- =====================================================================================

-- Function to create verification workflow when provider signs up
CREATE OR REPLACE FUNCTION create_verification_workflow(p_provider_id UUID)
RETURNS UUID AS $$
DECLARE
  workflow_id UUID;
BEGIN
  INSERT INTO verification_workflows (provider_id, current_step)
  VALUES (p_provider_id, 'documents_upload')
  RETURNING id INTO workflow_id;

  -- Log workflow creation
  INSERT INTO verification_history (
    provider_id,
    workflow_id,
    action_type,
    performed_by_type,
    notes
  ) VALUES (
    p_provider_id,
    workflow_id,
    'verification_started',
    'system',
    'Verification workflow created automatically'
  );

  RETURN workflow_id;
END;
$$ language 'plpgsql';

-- Function to check if provider can be auto-approved
CREATE OR REPLACE FUNCTION calculate_auto_verification_score(p_provider_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  score DECIMAL := 0.0;
  rut_score DECIMAL := 0.0;
  bg_score DECIMAL := 0.0;
  identity_score DECIMAL := 0.0;
  doc_score DECIMAL := 0.0;
BEGIN
  -- RUT validation score (30% weight)
  SELECT CASE
    WHEN rut_validation_status = 'valid' THEN 0.30
    ELSE 0.0
  END INTO rut_score
  FROM provider_profiles WHERE id = p_provider_id;

  -- Background check score (25% weight)
  SELECT CASE
    WHEN background_check_status = 'clean' THEN 0.25
    WHEN background_check_status = 'flagged' THEN 0.10
    ELSE 0.0
  END INTO bg_score
  FROM provider_profiles WHERE id = p_provider_id;

  -- Identity verification score (25% weight)
  SELECT CASE
    WHEN identity_verification_status = 'passed' AND face_match_score >= 0.85 THEN 0.25
    WHEN identity_verification_status = 'passed' AND face_match_score >= 0.70 THEN 0.15
    ELSE 0.0
  END INTO identity_score
  FROM provider_profiles WHERE id = p_provider_id;

  -- Document quality score (20% weight)
  SELECT CASE
    WHEN COUNT(*) >= 3 AND AVG(image_quality_score) >= 0.80 THEN 0.20
    WHEN COUNT(*) >= 2 AND AVG(image_quality_score) >= 0.70 THEN 0.15
    ELSE 0.10
  END INTO doc_score
  FROM verification_documents
  WHERE provider_id = p_provider_id AND approved = TRUE;

  score := rut_score + bg_score + identity_score + doc_score;

  -- Update workflow with calculated score
  UPDATE verification_workflows
  SET auto_verification_score = score,
      auto_verification_possible = (score >= 0.80)
  WHERE provider_id = p_provider_id;

  RETURN score;
END;
$$ language 'plpgsql';