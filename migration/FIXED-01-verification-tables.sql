-- =====================================================================================
-- FIXED MIGRATION: Works with your existing schema
-- Based on actual schema from supabase/sql/schema.sql
-- =====================================================================================

-- 1. ADD missing columns to existing provider_profiles table
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS comuna TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS verification_score INTEGER DEFAULT 0;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS is_identity_verified BOOLEAN DEFAULT false;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS is_background_checked BOOLEAN DEFAULT false;

-- 2. CREATE verification_documents table (references existing provider_profiles)
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
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

-- 3. CREATE verification_workflows table (references existing provider_profiles)
CREATE TABLE IF NOT EXISTS verification_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
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

-- 4. CREATE indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_documents_provider_id
    ON verification_documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_document_type
    ON verification_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_verification_workflows_provider_id
    ON verification_workflows(provider_id);
CREATE INDEX IF NOT EXISTS idx_verification_workflows_status
    ON verification_workflows(status);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Verification tables created successfully!';
    RAISE NOTICE 'Added columns to existing provider_profiles table';
    RAISE NOTICE 'Created verification_documents and verification_workflows tables';
    RAISE NOTICE 'Foreign keys reference provider_profiles(user_id) correctly';
END $$;