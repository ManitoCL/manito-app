-- Verification Script for Provider Verification Schema
-- Run this in Supabase SQL Editor to verify tables were created

-- Check if all tables exist
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename IN (
  'provider_profiles',
  'verification_documents',
  'verification_workflows',
  'verification_history',
  'verification_notifications'
)
ORDER BY tablename;

-- Check table structure for provider_profiles
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'provider_profiles'
ORDER BY ordinal_position;

-- Check indexes
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'provider_%' OR tablename LIKE 'verification_%'
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN (
  'provider_profiles',
  'verification_documents',
  'verification_workflows',
  'verification_history',
  'verification_notifications'
)
ORDER BY tablename, policyname;

-- Test basic functionality
SELECT 'Schema verification complete!' as status;