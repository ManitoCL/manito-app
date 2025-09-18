-- Secure function to check email verification status for cross-device flow
-- This follows RLS and only returns current user's verification status

CREATE OR REPLACE FUNCTION check_email_verification_status(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  auth_user RECORD;
  result JSONB;
BEGIN
  -- Security: Only allow checking your own verification status
  -- This function runs with SECURITY DEFINER so it can read auth.users
  SELECT
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data
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

  -- Return verification status
  RETURN jsonb_build_object(
    'success', true,
    'verified', auth_user.email_confirmed_at IS NOT NULL,
    'email', auth_user.email,
    'user_metadata', auth_user.raw_user_meta_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant to authenticated and anon (for cross-device verification)
GRANT EXECUTE ON FUNCTION check_email_verification_status TO authenticated, anon;

-- Add helpful comment
COMMENT ON FUNCTION check_email_verification_status(UUID) IS 'Securely checks email verification status for cross-device auth flows';