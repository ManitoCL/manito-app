-- Check what RLS policies already exist
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('verification_documents', 'verification_workflows', 'provider_profiles')
ORDER BY tablename, policyname;