-- Simple Provider Verification Schema
-- Run this manually in your Supabase SQL Editor

-- 1. First, create the provider_profiles table
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    services_offered TEXT[] DEFAULT '{}',
    service_areas TEXT[] DEFAULT '{}',
    comuna TEXT NOT NULL,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'approved', 'rejected')),
    verification_score INTEGER DEFAULT 0,
    is_identity_verified BOOLEAN DEFAULT false,
    is_background_checked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. Create the verification_documents table
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('cedula_front', 'cedula_back', 'selfie', 'certificate')),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_status TEXT DEFAULT 'uploading' CHECK (upload_status IN ('uploading', 'uploaded', 'processing', 'verified', 'rejected')),
    verification_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create the verification_workflows table
CREATE TABLE IF NOT EXISTS verification_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    workflow_step TEXT NOT NULL CHECK (workflow_step IN ('documents', 'identity', 'background', 'admin_review')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_verification_status ON provider_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_verification_documents_provider_id ON verification_documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_document_type ON verification_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_verification_workflows_provider_id ON verification_workflows(provider_id);
CREATE INDEX IF NOT EXISTS idx_verification_workflows_status ON verification_workflows(status);

-- 5. Enable Row Level Security
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_workflows ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- Provider profiles: users can only access their own profile
CREATE POLICY "Users can view their own provider profile" ON provider_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provider profile" ON provider_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider profile" ON provider_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Verification documents: users can only access their own documents
CREATE POLICY "Users can view their own verification documents" ON verification_documents
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_id
        )
    );

CREATE POLICY "Users can insert their own verification documents" ON verification_documents
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_id
        )
    );

-- Verification workflows: users can only access their own workflows
CREATE POLICY "Users can view their own verification workflows" ON verification_workflows
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_id
        )
    );

-- Admins can view all data
CREATE POLICY "Admins can view all provider profiles" ON provider_profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_type = 'admin'
        )
    );

CREATE POLICY "Admins can view all verification documents" ON verification_documents
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_type = 'admin'
        )
    );

CREATE POLICY "Admins can view all verification workflows" ON verification_workflows
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_type = 'admin'
        )
    );

-- 7. Create a simple verification status function
CREATE OR REPLACE FUNCTION get_provider_verification_status(p_provider_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    profile_record RECORD;
    doc_count INTEGER;
    required_docs TEXT[] := ARRAY['cedula_front', 'cedula_back', 'selfie'];
    missing_docs TEXT[];
BEGIN
    -- Get provider profile
    SELECT * INTO profile_record FROM provider_profiles WHERE id = p_provider_id;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Provider profile not found');
    END IF;

    -- Count uploaded documents
    SELECT COUNT(*) INTO doc_count
    FROM verification_documents
    WHERE provider_id = p_provider_id
    AND upload_status = 'uploaded';

    -- Find missing documents
    SELECT ARRAY(
        SELECT unnest(required_docs)
        EXCEPT
        SELECT document_type FROM verification_documents
        WHERE provider_id = p_provider_id AND upload_status = 'uploaded'
    ) INTO missing_docs;

    -- Build result
    SELECT json_build_object(
        'verification_status', profile_record.verification_status,
        'verification_score', profile_record.verification_score,
        'documents_uploaded', doc_count,
        'missing_documents', missing_docs,
        'is_identity_verified', profile_record.is_identity_verified,
        'is_background_checked', profile_record.is_background_checked
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Provider verification schema created successfully!';
    RAISE NOTICE 'Tables created: provider_profiles, verification_documents, verification_workflows';
    RAISE NOTICE 'RLS policies applied for security';
    RAISE NOTICE 'Ready to use with the React Native app!';
END $$;