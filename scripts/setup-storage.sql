-- Setup Supabase Storage for Verification Documents
-- Run this after creating the main schema

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
);

-- Create RLS policies for verification documents bucket
CREATE POLICY "Providers can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Providers can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Providers can update own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'verification-documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create function to organize files by user ID
CREATE OR REPLACE FUNCTION get_user_document_path(document_type TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN auth.uid()::text || '/' || document_type || '/' || EXTRACT(EPOCH FROM NOW())::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;