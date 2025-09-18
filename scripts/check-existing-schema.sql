-- Check Existing Database Schema
-- Run this first to see what tables already exist

-- 1. List all existing tables
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check existing provider_profiles structure
\d provider_profiles;

-- 3. List all columns in provider_profiles
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'provider_profiles'
ORDER BY ordinal_position;

-- 4. Check for other verification tables
SELECT tablename
FROM pg_tables
WHERE tablename LIKE '%verification%' OR tablename LIKE '%provider%'
ORDER BY tablename;

-- 5. Check existing indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename LIKE '%provider%' OR tablename LIKE '%verification%'
ORDER BY tablename, indexname;