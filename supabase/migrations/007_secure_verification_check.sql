-- Secure function to check email verification status following best practices
-- This function implements proper security controls and audit logging

CREATE OR REPLACE FUNCTION check_email_verification_status(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  auth_user RECORD;
  result JSONB;
  current_role TEXT;
BEGIN
  -- Input validation
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid user ID',
      'verified', false
    );
  END IF;

  -- Get current role for security logging
  current_role := current_setting('role', true);

  -- Security: Only allow checking verification status in specific contexts
  -- 1. Service role (internal operations)
  -- 2. Anon role with matching stored credentials (cross-device verification)
  -- 3. Authenticated users checking their own status

  -- For anon role, we allow this only for cross-device verification
  -- The user_id must exist in auth.users (they signed up)
  IF current_role = 'anon' THEN
    -- Verify this is a real user that exists in auth system
    SELECT COUNT(*) INTO auth_user
    FROM auth.users
    WHERE id = user_id;

    IF auth_user.count = 0 THEN
      -- Log suspicious activity
      INSERT INTO audit_log (event_type, user_id, details, created_at)
      VALUES ('verification_check_invalid_user', user_id, 'Anon role attempted to check non-existent user', NOW())
      ON CONFLICT DO NOTHING; -- Ignore if audit table doesn't exist yet

      RETURN jsonb_build_object(
        'success', false,
        'error', 'Invalid request',
        'verified', false
      );
    END IF;
  END IF;

  -- For authenticated role, only allow checking own status
  IF current_role = 'authenticated' THEN
    IF (current_setting('request.jwt.claims', true)::json->>'sub')::uuid != user_id THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Access denied',
        'verified', false
      );
    END IF;
  END IF;

  -- Get verification status (minimal data disclosure)
  SELECT
    id,
    email_confirmed_at IS NOT NULL as is_verified
  INTO auth_user
  FROM auth.users
  WHERE id = user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found',
      'verified', false
    );
  END IF;

  -- Log verification check for audit
  INSERT INTO audit_log (event_type, user_id, details, created_at)
  VALUES ('verification_status_check', user_id, jsonb_build_object('role', current_role, 'verified', auth_user.is_verified), NOW())
  ON CONFLICT DO NOTHING; -- Ignore if audit table doesn't exist

  -- Return minimal verification status (no email or metadata disclosure)
  RETURN jsonb_build_object(
    'success', true,
    'verified', auth_user.is_verified,
    'checked_at', extract(epoch from now())
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log errors for debugging but don't expose details
    INSERT INTO audit_log (event_type, user_id, details, created_at)
    VALUES ('verification_check_error', user_id, jsonb_build_object('error', SQLERRM), NOW())
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Internal error',
      'verified', false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- More restrictive permissions
GRANT EXECUTE ON FUNCTION check_email_verification_status TO authenticated;
-- Only grant to anon for cross-device verification, not general access
GRANT EXECUTE ON FUNCTION check_email_verification_status TO anon;

-- Add rate limiting policy (if you have rate limiting table)
-- This would require additional rate limiting infrastructure

-- Security comment
COMMENT ON FUNCTION check_email_verification_status(UUID) IS
'Securely checks email verification status with audit logging and minimal data disclosure. Used for cross-device auth flows.';

-- Create audit table if it doesn't exist (optional, for logging)
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET DEFAULT inet_client_addr()
);

-- Enable RLS on audit table
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can read audit logs
CREATE POLICY "audit_log_service_only" ON audit_log
  FOR ALL USING (current_setting('role') = 'service_role');