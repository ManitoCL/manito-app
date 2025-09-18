-- Check what RLS policies already exist (fixed query)
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('verification_documents', 'verification_workflows', 'provider_profiles')
ORDER BY tablename, policyname;