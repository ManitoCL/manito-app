-- =====================================================================================
-- CLEAN APPROACH: Drop existing conflicting policies first, then recreate
-- =====================================================================================

-- 1. CREATE STORAGE BUCKET (will skip if exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-documents',
    'verification-documents',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. ENABLE RLS ON TABLES
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_workflows ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES (if they exist)
DROP POLICY IF EXISTS "Users can view their own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can insert their own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can update their own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Admins can manage all verification documents" ON verification_documents;

DROP POLICY IF EXISTS "Users can view their own verification workflows" ON verification_workflows;
DROP POLICY IF EXISTS "Users can insert their own verification workflows" ON verification_workflows;
DROP POLICY IF EXISTS "Admins can manage all verification workflows" ON verification_workflows;

-- 4. CREATE NEW POLICIES
-- VERIFICATION_DOCUMENTS policies
CREATE POLICY "Users can view their own verification documents" ON verification_documents
    FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Users can insert their own verification documents" ON verification_documents
    FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Users can update their own verification documents" ON verification_documents
    FOR UPDATE USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage all verification documents" ON verification_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.user_type = 'admin'
        )
    );

-- VERIFICATION_WORKFLOWS policies
CREATE POLICY "Users can view their own verification workflows" ON verification_workflows
    FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Users can insert their own verification workflows" ON verification_workflows
    FOR INSERT WITH CHECK (auth.uid() = provider_id);

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
    RAISE NOTICE '✅ Storage bucket and RLS policies created successfully!';
    RAISE NOTICE 'Storage bucket: verification-documents';
    RAISE NOTICE 'RLS policies: Fresh policies created for verification tables';
    RAISE NOTICE 'Next: Set up storage policies manually via Dashboard';
END $$;