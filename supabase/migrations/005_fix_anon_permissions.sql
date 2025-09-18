-- Fix permissions for email verification callback
-- The web callback runs with anon role, so we need to allow it

-- Grant execute permission to anon role for handle_email_confirmation
GRANT EXECUTE ON FUNCTION handle_email_confirmation TO anon;

-- Also grant to anon for the safe creation function
GRANT EXECUTE ON FUNCTION create_user_profile_safe TO anon;

-- Update RLS policy to allow anon role when creating user profiles via functions
DROP POLICY IF EXISTS "Allow user creation from auth triggers" ON users;
CREATE POLICY "Allow user creation from auth triggers" ON users
  FOR INSERT
  WITH CHECK (
    -- Allow service role (used by triggers)
    auth.role() = 'service_role' OR
    -- Allow authenticated users to create their own profile
    auth.uid() = id OR
    -- Allow during signup process (when auth.uid() might be null but user creation is happening)
    (auth.uid() IS NULL AND auth.role() = 'authenticated') OR
    -- Allow anon role for email verification callbacks (SECURITY DEFINER functions)
    auth.role() = 'anon'
  );

-- Add comment explaining why anon is allowed
COMMENT ON POLICY "Allow user creation from auth triggers" ON users IS 'Allows user creation during auth flows including email verification callbacks which run as anon role';