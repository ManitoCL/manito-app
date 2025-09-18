-- EMERGENCY FIX: Remove failing auth trigger to fix verifyOtp() immediately
-- This is a minimal fix to resolve the immediate verifyOtp() "unexpected_failure" issue

-- Step 1: Drop the failing trigger immediately
DROP TRIGGER IF EXISTS auto_create_user_profile_trigger ON auth.users;

-- Step 2: Drop the failing function
DROP FUNCTION IF EXISTS auto_create_user_profile();

-- Step 3: Create minimal audit_log table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    CREATE TABLE audit_log (
      id BIGSERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      user_id UUID,
      details JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "audit_log_service_only" ON audit_log
      FOR ALL USING (current_setting('role') = 'service_role');
  END IF;
END
$$;

-- Log the emergency fix
INSERT INTO audit_log (event_type, details, created_at)
VALUES ('emergency_auth_fix', jsonb_build_object(
  'issue', 'verifyOtp() failing due to auth trigger',
  'action', 'Removed failing trigger temporarily',
  'timestamp', NOW()
), NOW());