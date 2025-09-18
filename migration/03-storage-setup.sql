-- =====================================================================================
-- STEP 3: SUPABASE STORAGE BUCKET FOR DOCUMENTS
-- Run this AFTER Steps 1-2 complete successfully
-- =====================================================================================

-- Create the verification-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-documents',
    'verification-documents',
    false, -- Private bucket for security
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Users can upload to their own folder
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read their own documents
CREATE POLICY "Users can view their own verification documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'verification-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own documents (for re-uploads)
CREATE POLICY "Users can update their own verification documents" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'verification-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own verification documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'verification-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can access all verification documents
CREATE POLICY "Admins can manage all verification documents" ON storage.objects
FOR ALL USING (
    bucket_id = 'verification-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ Storage bucket and policies created successfully!';