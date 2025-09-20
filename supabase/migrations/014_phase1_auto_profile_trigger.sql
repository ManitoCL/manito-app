-- PHASE 1: Auto-Profile Trigger for Seamless User Creation
-- Golden Standard Implementation (Meta/Instagram Pattern)
-- This replaces manual profile creation with automatic database triggers

-- Step 1: Create robust auto-profile function that won't fail verifyOtp()
-- IMPORTANT: Use SECURITY DEFINER and set search_path for proper permissions
CREATE OR REPLACE FUNCTION auto_create_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_metadata JSONB;
  user_full_name TEXT;
  user_user_type TEXT;
  user_phone TEXT;
  existing_profile UUID;
BEGIN
  -- GOLDEN STANDARD: Only create profile on email confirmation, not signup
  -- This prevents verifyOtp() failures by avoiding operations during auth flow
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN

    -- Extract metadata safely with fallbacks
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    user_full_name := COALESCE(user_metadata->>'full_name', split_part(NEW.email, '@', 1));
    user_user_type := COALESCE(user_metadata->>'user_type', 'customer');
    user_phone := user_metadata->>'phone_number';

    -- Check if profile already exists (idempotent operation)
    SELECT id INTO existing_profile FROM public.users WHERE id = NEW.id;

    IF existing_profile IS NULL THEN
      -- ENTERPRISE PATTERN: Use exception handling to prevent auth failures
      BEGIN
        -- Create user profile with all enterprise fields
        INSERT INTO public.users (
          id,
          email,
          full_name,
          user_type,
          phone_number,
          is_verified,
          email_verified_at,
          created_at,
          updated_at,
          last_seen_at
        ) VALUES (
          NEW.id,
          NEW.email,
          user_full_name,
          user_user_type::user_type,
          user_phone,
          TRUE,
          NEW.email_confirmed_at,
          NEW.created_at,
          NOW(),
          NOW()
        );

        -- Auto-create provider profile if user_type is provider
        IF user_user_type = 'provider' THEN
          INSERT INTO public.provider_profiles (
            user_id,
            business_name,
            description,
            verification_status,
            created_at,
            updated_at
          ) VALUES (
            NEW.id,
            user_metadata->>'business_name',
            COALESCE(user_metadata->>'description', 'Proveedor de servicios profesionales'),
            'pending',
            NOW(),
            NOW()
          );
        END IF;

        -- Log successful profile creation
        INSERT INTO public.audit_log (event_type, user_id, details, created_at)
        VALUES ('auto_profile_created', NEW.id, jsonb_build_object(
          'user_type', user_user_type,
          'email', NEW.email,
          'provider_profile_created', (user_user_type = 'provider'),
          'trigger_version', 'phase1_v1'
        ), NOW());

      EXCEPTION
        WHEN OTHERS THEN
          -- CRITICAL: Never fail the auth flow - log error and continue
          INSERT INTO public.audit_log (event_type, user_id, details, created_at)
          VALUES ('auto_profile_failed', NEW.id, jsonb_build_object(
            'error_code', SQLSTATE,
            'error_message', SQLERRM,
            'user_type', user_user_type,
            'email', NEW.email,
            'trigger_version', 'phase1_v1'
          ), NOW());

          -- Return NEW to allow auth to continue
          RETURN NEW;
      END;

    ELSE
      -- Profile exists, just update verification status
      UPDATE public.users
      SET
        is_verified = TRUE,
        email_verified_at = NEW.email_confirmed_at,
        updated_at = NOW()
      WHERE id = NEW.id;

      -- Log profile update
      INSERT INTO public.audit_log (event_type, user_id, details, created_at)
      VALUES ('auto_profile_updated', NEW.id, jsonb_build_object(
        'action', 'email_verification_confirmed',
        'trigger_version', 'phase1_v1'
      ), NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions for the function and tables
GRANT EXECUTE ON FUNCTION auto_create_user_profile() TO service_role;
GRANT EXECUTE ON FUNCTION auto_create_user_profile() TO authenticated;

-- CRITICAL: Grant table permissions for the trigger function to work
GRANT INSERT, UPDATE, SELECT ON public.users TO service_role;
GRANT INSERT, UPDATE, SELECT ON public.provider_profiles TO service_role;
GRANT INSERT ON public.audit_log TO service_role;

-- Also grant to postgres role (owner of the function)
GRANT INSERT, UPDATE, SELECT ON public.users TO postgres;
GRANT INSERT, UPDATE, SELECT ON public.provider_profiles TO postgres;
GRANT INSERT ON public.audit_log TO postgres;

-- Step 2: Create the trigger on auth.users table
-- GOLDEN STANDARD: Only trigger on UPDATE to avoid signup interference
CREATE TRIGGER auto_create_user_profile_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_user_profile();

-- Step 3: Create audit_log table for Phase 1 tracking (since it doesn't exist in current schema)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit_log (service role only)
DROP POLICY IF EXISTS "audit_log_service_only" ON public.audit_log;
CREATE POLICY "audit_log_service_only" ON public.audit_log
  FOR ALL USING (current_setting('role') = 'service_role');

-- Step 4: Create optimized profile status function for Phase 1
-- This replaces the complex enterprise hooks with simple database calls
CREATE OR REPLACE FUNCTION get_simple_profile_status()
RETURNS JSONB AS $$
DECLARE
  auth_user_id UUID;
  profile_data RECORD;
  provider_data RECORD;
BEGIN
  auth_user_id := auth.uid();

  IF auth_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required',
      'authenticated', false
    );
  END IF;

  -- Get user profile data
  SELECT
    u.id,
    u.email,
    u.full_name,
    u.user_type,
    u.is_verified,
    u.phone_number,
    u.email_verified_at IS NOT NULL as email_verified,
    u.created_at
  INTO profile_data
  FROM public.users u
  WHERE u.id = auth_user_id;

  IF FOUND THEN
    -- Check for provider profile if user is provider
    IF profile_data.user_type = 'provider' THEN
      SELECT
        verification_status,
        business_name,
        rating,
        total_reviews
      INTO provider_data
      FROM public.provider_profiles
      WHERE user_id = auth_user_id;
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'authenticated', true,
      'profile_exists', true,
      'user_type', profile_data.user_type,
      'is_verified', profile_data.is_verified,
      'email_verified', profile_data.email_verified,
      'is_provider', (profile_data.user_type = 'provider'),
      'provider_verified', CASE
        WHEN profile_data.user_type = 'provider' AND provider_data.verification_status IS NOT NULL
        THEN (provider_data.verification_status = 'approved')
        ELSE false
      END,
      'needs_setup', false, -- Auto-profile eliminates setup needs
      'profile_data', jsonb_build_object(
        'id', profile_data.id,
        'email', profile_data.email,
        'full_name', profile_data.full_name,
        'user_type', profile_data.user_type,
        'phone_number', profile_data.phone_number,
        'provider_status', provider_data.verification_status
      )
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'authenticated', true,
      'profile_exists', false,
      'needs_creation', true,
      'error', 'Profile not found - trigger may have failed'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant necessary permissions for the functions
GRANT EXECUTE ON FUNCTION get_simple_profile_status() TO authenticated, anon;

-- Step 5: Update RLS policies for seamless auto-profile access
-- Ensure auto-created profiles are immediately accessible
CREATE POLICY "Auto-created profiles are immediately accessible" ON public.users
  FOR SELECT USING (auth.uid() = id AND is_verified = true);

CREATE POLICY "Auto-created provider profiles are immediately accessible" ON public.provider_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Step 6: Log Phase 1 implementation
INSERT INTO public.audit_log (event_type, details, created_at)
VALUES ('phase1_migration_applied', jsonb_build_object(
  'version', 'phase1_auto_profile_v1',
  'features', ARRAY[
    'auto_profile_trigger',
    'simplified_profile_status',
    'provider_auto_creation',
    'enterprise_error_handling'
  ],
  'migration_file', '014_phase1_auto_profile_trigger.sql'
), NOW());

-- Comments for documentation
COMMENT ON FUNCTION auto_create_user_profile() IS 'Phase 1: Auto-creates user profiles on email confirmation following Meta/Instagram golden standard';
COMMENT ON FUNCTION get_simple_profile_status() IS 'Phase 1: Simplified profile status function for seamless auth flow';
COMMENT ON TRIGGER auto_create_user_profile_trigger ON auth.users IS 'Phase 1: Triggers automatic profile creation on email verification';