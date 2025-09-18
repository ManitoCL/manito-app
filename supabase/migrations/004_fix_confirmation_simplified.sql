-- Simplified fix for email confirmation flow
-- This version works with hosted Supabase limitations

-- First, add missing RLS policy for user creation during signup
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;
DROP POLICY IF EXISTS "Enable insert for service role during triggers" ON users;

-- Add policy that allows inserts during auth flow
CREATE POLICY "Allow user creation from auth triggers" ON users
  FOR INSERT 
  WITH CHECK (
    -- Allow service role (used by triggers)
    auth.role() = 'service_role' OR
    -- Allow authenticated users to create their own profile
    auth.uid() = id OR
    -- Allow during signup process (when auth.uid() might be null but user creation is happening)
    (auth.uid() IS NULL AND auth.role() = 'authenticated')
  );

-- Function to safely create user profile from application code
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_profile_safe TO authenticated, anon;

-- Add helpful comment
COMMENT ON FUNCTION create_user_profile_safe(UUID, TEXT, TEXT, TEXT, TEXT) IS 'Safely creates user profile from application code with error handling';

-- For now, we'll handle the confirmation flow in the application
-- The database triggers for auth.users require superuser permissions that hosted Supabase doesn't allow

-- However, we can create a function to handle post-confirmation setup
CREATE OR REPLACE FUNCTION handle_email_confirmation(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  auth_user RECORD;
  result JSONB;
BEGIN
  -- Get user data from auth.users (this works with security definer)
  SELECT 
    email,
    raw_user_meta_data
  INTO auth_user
  FROM auth.users 
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Auth user not found'
    );
  END IF;
  
  -- Create profile using the auth user data
  RETURN create_user_profile_safe(
    user_id,
    auth_user.email,
    COALESCE(auth_user.raw_user_meta_data->>'full_name', ''),
    COALESCE(auth_user.raw_user_meta_data->>'user_type', 'consumer'),
    auth_user.raw_user_meta_data->>'phone_number'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION handle_email_confirmation TO authenticated;