-- =====================================================================================
-- STEP 3: STORAGE BUCKET AND RLS POLICIES (SAFE VERSION)
-- Run this after Step 1 completed successfully
-- =====================================================================================

-- 1. CREATE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-documents',
    'verification-documents',
    false, -- Private bucket for security
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. ENABLE RLS ON NEW TABLES
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_workflows ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES FOR VERIFICATION_DOCUMENTS
-- Users can view their own verification documents
CREATE POLICY "Users can view their own verification documents" ON verification_documents
    FOR SELECT USING (auth.uid() = provider_id);

-- Users can insert their own verification documents
CREATE POLICY "Users can insert their own verification documents" ON verification_documents
    FOR INSERT WITH CHECK (auth.uid() = provider_id);

-- Users can update their own verification documents
CREATE POLICY "Users can update their own verification documents" ON verification_documents
    FOR UPDATE USING (auth.uid() = provider_id);

-- Admins can manage all verification documents
CREATE POLICY "Admins can manage all verification documents" ON verification_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.user_type = 'admin'
        )
    );

-- 4. RLS POLICIES FOR VERIFICATION_WORKFLOWS
-- Users can view their own verification workflows
CREATE POLICY "Users can view their own verification workflows" ON verification_workflows
    FOR SELECT USING (auth.uid() = provider_id);

-- Users can insert their own verification workflows
CREATE POLICY "Users can insert their own verification workflows" ON verification_workflows
    FOR INSERT WITH CHECK (auth.uid() = provider_id);

-- System/Admins can manage all verification workflows
CREATE POLICY "Admins can manage all verification workflows" ON verification_workflows
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.user_type = 'admin'
        )
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket and table RLS policies created successfully!';
    RAISE NOTICE 'Storage bucket: verification-documents (10MB limit, images only)';
    RAISE NOTICE 'RLS policies: Users can only access their own data';
    RAISE NOTICE 'Admin access: Full access to all verification data';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  MANUAL STEP REQUIRED:';
    RAISE NOTICE 'Go to Storage > verification-documents > Policies in Supabase Dashboard';
    RAISE NOTICE 'Add storage policies manually (see instructions below)';
END $$;