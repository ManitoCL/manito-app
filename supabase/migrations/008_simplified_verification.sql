-- Simplified verification approach - remove complex polling functions
-- This migration removes the custom verification check function since we're now using
-- Supabase's built-in session management for cross-device authentication

-- Drop the complex verification check function
DROP FUNCTION IF EXISTS check_email_verification_status(UUID);

-- Drop audit log table if it exists (was only used for verification polling)
DROP TABLE IF EXISTS audit_log;

-- Create a simple helper function for profile creation after email confirmation
-- This replaces the complex polling system with a simple post-verification handler
CREATE OR REPLACE FUNCTION handle_email_confirmation(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  existing_profile RECORD;
  auth_user RECORD;
BEGIN
  -- Input validation
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid user ID'
    );
  END IF;

  -- Check if user exists and is email verified
  SELECT id, email_confirmed_at, raw_user_meta_data
  INTO auth_user
  FROM auth.users
  WHERE id = user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Ensure email is confirmed
  IF auth_user.email_confirmed_at IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email not confirmed'
    );
  END IF;

  -- Check if user profile already exists in users table
  SELECT id INTO existing_profile
  FROM users
  WHERE id = user_id;

  IF FOUND THEN
    -- Update email verification status
    UPDATE users
    SET
      is_verified = true,
      email_verified_at = NOW()
    WHERE id = user_id;

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Profile updated with email verification'
    );
  END IF;

  -- Create user profile with metadata from auth.users
  INSERT INTO users (
    id,
    email,
    full_name,
    user_type,
    is_verified,
    email_verified_at,
    created_at,
    updated_at
  )
  SELECT
    auth_user.id,
    auth.users.email,
    COALESCE(auth_user.raw_user_meta_data->>'full_name', ''),
    COALESCE(auth_user.raw_user_meta_data->>'user_type', 'consumer')::user_type,
    true, -- Email is verified
    NOW(), -- Email verified at
    auth.users.created_at,
    NOW()
  FROM auth.users
  WHERE auth.users.id = user_id;

  -- If it's a provider, create provider profile
  IF COALESCE(auth_user.raw_user_meta_data->>'user_type', 'consumer') = 'provider' THEN
    INSERT INTO provider_profiles (
      user_id,
      business_name,
      description,
      created_at,
      updated_at
    ) VALUES (
      auth_user.id,
      auth_user.raw_user_meta_data->>'business_name',
      auth_user.raw_user_meta_data->>'description',
      NOW(),
      NOW()
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Profile created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to create profile',
      'details', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION handle_email_confirmation TO authenticated;
GRANT EXECUTE ON FUNCTION handle_email_confirmation TO anon;

-- Add comment
COMMENT ON FUNCTION handle_email_confirmation(UUID) IS
'Creates user profile after email confirmation. Used in simplified cross-device auth flow.';

-- Ensure users table has proper RLS policies (should already be enabled)
-- The RLS policies for users table should already exist from previous migrations