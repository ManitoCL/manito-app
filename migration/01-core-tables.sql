-- =====================================================================================
-- STEP 1: CORE PROVIDER VERIFICATION TABLES
-- Run this in Supabase SQL Editor
-- =====================================================================================

-- Table 1: PROVIDER_PROFILES
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    services_offered TEXT[] DEFAULT '{}',
    service_areas TEXT[] DEFAULT '{}',
    comuna TEXT NOT NULL,
    verification_status TEXT DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'in_review', 'approved', 'rejected')),
    verification_score INTEGER DEFAULT 0,
    is_identity_verified BOOLEAN DEFAULT false,
    is_background_checked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Table 2: VERIFICATION_DOCUMENTS
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL
        CHECK (document_type IN ('cedula_front', 'cedula_back', 'selfie', 'certificate')),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_status TEXT DEFAULT 'uploading'
        CHECK (upload_status IN ('uploading', 'uploaded', 'processing', 'verified', 'rejected')),
    verification_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table 3: VERIFICATION_WORKFLOWS
CREATE TABLE IF NOT EXISTS verification_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    workflow_step TEXT NOT NULL
        CHECK (workflow_step IN ('documents', 'identity', 'background', 'admin_review')),
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_verification_status ON provider_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_verification_documents_provider_id ON verification_documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_verification_workflows_provider_id ON verification_workflows(provider_id);

RAISE NOTICE '✅ Core tables created successfully!';