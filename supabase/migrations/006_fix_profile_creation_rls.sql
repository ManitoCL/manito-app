-- Fix RLS policies and function permissions for profile creation
-- Root cause: Multiple conflicting INSERT policies and missing function permissions

-- Step 1: Fix function permissions first
-- Grant handle_email_confirmation to anon role (missing from previous migration)
GRANT EXECUTE ON FUNCTION handle_email_confirmation TO anon;

-- Step 2: Fix RLS policies - drop all existing INSERT policies on users table
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Allow user creation from auth triggers" ON users;

-- Step 3: Create a single, comprehensive INSERT policy that covers all cases
CREATE POLICY "Allow user profile creation" ON users
  FOR INSERT
  WITH CHECK (
    -- Allow service role (used by database triggers)
    auth.role() = 'service_role' OR
    -- Allow authenticated users to create their own profile (when auth.uid() exists)
    auth.uid() = id OR
    -- Allow SECURITY DEFINER functions run by anon role (email verification)
    auth.role() = 'anon'
  );

-- Step 4: Add helpful comment
COMMENT ON POLICY "Allow user profile creation" ON users
IS 'Unified policy allowing profile creation during auth flows, including email verification callbacks';

-- Step 5: Fix provider_profiles table permissions
DROP POLICY IF EXISTS "Providers can create their profile" ON provider_profiles;
CREATE POLICY "Allow provider profile creation" ON provider_profiles
  FOR INSERT
  WITH CHECK (
    -- Allow service role
    auth.role() = 'service_role' OR
    -- Allow authenticated users to create their own profile
    auth.uid() = user_id OR
    -- Allow SECURITY DEFINER functions run by anon role
    auth.role() = 'anon'
  );

COMMENT ON POLICY "Allow provider profile creation" ON provider_profiles
IS 'Allows provider profile creation during auth flows and user type changes';

-- Step 6: Ensure both functions are properly configured
-- Re-declare create_user_profile_safe to ensure it has SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_user_profile_safe(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT DEFAULT '',
  user_type TEXT DEFAULT 'consumer',
  user_phone TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  existing_user RECORD;
BEGIN
  -- Check if user already exists
  SELECT * INTO existing_user FROM users WHERE id = user_id;

  IF existing_user.id IS NOT NULL THEN
    -- User already exists, return existing data
    SELECT jsonb_build_object(
      'success', true,
      'message', 'User profile already exists',
      'user_id', existing_user.id
    ) INTO result;
  ELSE
    -- Create new user profile
    INSERT INTO users (
      id,
      email,
      full_name,
      user_type,
      phone_number
    ) VALUES (
      user_id,
      user_email,
      user_full_name,
      user_type,
      user_phone
    );

    -- Create provider profile if needed
    IF user_type = 'provider' THEN
      INSERT INTO provider_profiles (user_id) VALUES (user_id);
    END IF;

    SELECT jsonb_build_object(
      'success', true,
      'message', 'User profile created successfully',
      'user_id', user_id
    ) INTO result;
  END IF;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper permissions for both functions
GRANT EXECUTE ON FUNCTION create_user_profile_safe TO authenticated, anon;
GRANT EXECUTE ON FUNCTION handle_email_confirmation TO authenticated, anon;
