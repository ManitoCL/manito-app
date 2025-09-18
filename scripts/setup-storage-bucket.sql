-- Setup Supabase Storage bucket for verification documents
-- Run this in your Supabase SQL Editor

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

-- Create RLS policies for the bucket

-- Allow authenticated users to upload files to their own provider folder
CREATE POLICY "Users can upload verification documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'verification-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own verification documents
CREATE POLICY "Users can view their own verification documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to read all verification documents
CREATE POLICY "Admins can view all verification documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-documents'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Allow users to update their own documents (for re-uploads)
CREATE POLICY "Users can update their own verification documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'verification-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own verification documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'verification-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;