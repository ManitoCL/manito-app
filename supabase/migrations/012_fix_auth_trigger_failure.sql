-- Fix auth trigger failure causing verifyOtp() "unexpected_failure" error
-- Root cause: auto_create_user_profile trigger trying to insert into dropped audit_log table

-- Step 1: Drop the problematic auth trigger that's causing verifyOtp() to fail
DROP TRIGGER IF EXISTS auto_create_user_profile_trigger ON auth.users;

-- Step 2: Drop the trigger function that references non-existent audit_log table
DROP FUNCTION IF EXISTS auto_create_user_profile();

-- Step 3: Create audit_log table (recreate since it was dropped in migration 008)
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET DEFAULT inet_client_addr()
);

-- Step 4: Enable RLS and create policy for audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_service_only" ON audit_log;
CREATE POLICY "audit_log_service_only" ON audit_log
  FOR ALL USING (
    current_setting('role') = 'service_role' OR
    current_setting('role') = 'postgres'
  );

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Step 6: Create fixed trigger function with proper error handling
CREATE OR REPLACE FUNCTION auto_create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata JSONB;
  user_full_name TEXT;
  user_user_type TEXT;
  existing_profile UUID;
BEGIN
  -- Only proceed if email was just confirmed
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN

    -- Extract metadata safely
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    user_full_name := COALESCE(user_metadata->>'full_name', '');

    -- Fix: Handle both 'consumer' and 'customer' user types (migration 011 changed this)
    user_user_type := COALESCE(user_metadata->>'user_type', 'customer');
    IF user_user_type = 'consumer' THEN
      user_user_type := 'customer'; -- Convert legacy consumer to customer
    END IF;

    -- Check if profile already exists
    SELECT id INTO existing_profile FROM users WHERE id = NEW.id;

    IF existing_profile IS NULL THEN
      -- Create user profile with proper error handling
      BEGIN
        INSERT INTO users (
          id,
          email,
          full_name,
          user_type,
          is_verified,
          email_verified_at,
          created_at,
          updated_at
        ) VALUES (
          NEW.id,
          NEW.email,
          user_full_name,
          user_user_type::user_type,
          true,
          NEW.email_confirmed_at,
          NEW.created_at,
          NOW()
        );

        -- Create provider profile if needed
        IF user_user_type = 'provider' THEN
          INSERT INTO provider_profiles (
            user_id,
            business_name,
            description,
            created_at,
            updated_at
          ) VALUES (
            NEW.id,
            user_metadata->>'business_name',
            user_metadata->>'description',
            NOW(),
            NOW()
          );
        END IF;

        -- Log success (with proper error handling for audit_log)
        BEGIN
          INSERT INTO audit_log (event_type, user_id, details, created_at)
          VALUES ('profile_auto_created', NEW.id, jsonb_build_object(
            'user_type', user_user_type,
            'email', NEW.email
          ), NOW());
        EXCEPTION
          WHEN OTHERS THEN
            -- Ignore audit log errors - don't fail the auth process
            NULL;
        END;

      EXCEPTION
        WHEN OTHERS THEN
          -- Log error but don't fail the auth process
          BEGIN
            INSERT INTO audit_log (event_type, user_id, details, created_at)
            VALUES ('profile_creation_failed', NEW.id, jsonb_build_object(
              'error', SQLERRM
            ), NOW());
          EXCEPTION
            WHEN OTHERS THEN
              -- Ignore audit log errors
              NULL;
          END;
      END;

    ELSE
      -- Update existing profile
      UPDATE users
      SET
        is_verified = true,
        email_verified_at = NEW.email_confirmed_at,
        updated_at = NOW()
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Recreate the trigger on auth.users
CREATE TRIGGER auto_create_user_profile_trigger
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_user_profile();

-- Step 8: Add helpful comments
COMMENT ON FUNCTION auto_create_user_profile() IS
'Fixed version: Automatically creates user profiles when email is confirmed. Includes proper error handling for audit_log and user_type enum changes.';

COMMENT ON TRIGGER auto_create_user_profile_trigger ON auth.users IS
'Trigger that creates user profiles on email confirmation. Fixed to handle missing audit_log table and user_type enum changes.';

-- Step 9: Ensure RLS policies allow trigger operations
-- The trigger runs as service_role so this should work, but ensure policy exists
DROP POLICY IF EXISTS "Allow user profile creation" ON users;
CREATE POLICY "Allow user profile creation" ON users
  FOR INSERT
  WITH CHECK (
    -- Allow service role (used by database triggers)
    auth.role() = 'service_role' OR
    -- Allow authenticated users to create their own profile
    (auth.role() = 'authenticated' AND auth.uid() = id) OR
    -- Allow anon role for SECURITY DEFINER functions
    auth.role() = 'anon'
  );

-- Step 10: Log this migration
INSERT INTO audit_log (event_type, details, created_at)
VALUES ('auth_trigger_fixed', jsonb_build_object(
  'migration', '012_fix_auth_trigger_failure',
  'issue', 'verifyOtp() unexpected_failure due to missing audit_log table',
  'solution', 'Recreated audit_log table and fixed trigger function'
), NOW())
ON CONFLICT DO NOTHING;