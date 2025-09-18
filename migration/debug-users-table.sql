-- Check what columns exist in your users table
-- Run this first to see the actual structure

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;