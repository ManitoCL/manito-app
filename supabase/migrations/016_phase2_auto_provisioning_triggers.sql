-- PHASE 2: Auto-Provisioning Triggers (True Enterprise Pattern)
-- Meta/Instagram approach: Database handles profile creation automatically
-- Eliminates all client-side profile creation logic

-- Step 1: Create enterprise auto-provisioning function
CREATE OR REPLACE FUNCTION auto_provision_user_profile()
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
  -- ENTERPRISE PATTERN: Only provision on INSERT (new user creation)
  -- This ensures profiles are created instantly when users sign up

  -- Extract metadata safely with enterprise defaults
  user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  user_full_name := COALESCE(
    user_metadata->>'full_name',
    user_metadata->>'name',
    split_part(NEW.email, '@', 1)
  );
  user_user_type := COALESCE(user_metadata->>'user_type', 'customer');
  user_phone := user_metadata->>'phone_number';

  -- Check if profile already exists (idempotent operation)
  SELECT id INTO existing_profile FROM public.users WHERE id = NEW.id;

  IF existing_profile IS NULL THEN
    -- ENTERPRISE PATTERN: Use exception handling to never break auth flow
    BEGIN
      -- Create user profile with enterprise defaults
      INSERT INTO public.users (
        id,
        email,
        full_name,
        user_type,
        phone_number,
        display_name,
        is_verified,
        email_verified_at,
        onboarding_completed,
        created_at,
        updated_at,
        last_seen_at
      ) VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        user_user_type::user_type,
        user_phone,
        split_part(user_full_name, ' ', 1), -- First name as display name
        FALSE, -- Will be set to TRUE when email is verified
        NULL,  -- Will be set when email is verified
        FALSE, -- User needs to complete onboarding
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
          COALESCE(user_metadata->>'description', 'Proveedor de servicios profesionales en Chile'),
          'pending',
          NOW(),
          NOW()
        );
      END IF;

      -- Log successful auto-provisioning
      INSERT INTO public.audit_log (event_type, user_id, details, created_at)
      VALUES ('auto_profile_provisioned', NEW.id, jsonb_build_object(
        'user_type', user_user_type,
        'email', NEW.email,
        'full_name', user_full_name,
        'provider_profile_created', (user_user_type = 'provider'),
        'trigger_version', 'phase2_enterprise_v1',
        'pattern', 'database_auto_provisioning'
      ), NOW());

    EXCEPTION
      WHEN OTHERS THEN
        -- CRITICAL: Never fail the auth flow - log error and continue
        INSERT INTO public.audit_log (event_type, user_id, details, created_at)
        VALUES ('auto_provision_failed', NEW.id, jsonb_build_object(
          'error_code', SQLSTATE,
          'error_message', SQLERRM,
          'user_type', user_user_type,
          'email', NEW.email,
          'trigger_version', 'phase2_enterprise_v1',
          'pattern', 'database_auto_provisioning'
        ), NOW());

        -- Return NEW to allow auth to continue even if profile creation fails
        RETURN NEW;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create enterprise email verification trigger
CREATE OR REPLACE FUNCTION auto_update_profile_on_verification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- ENTERPRISE PATTERN: Update profile when email is verified
  -- This keeps profile in sync with auth.users verification status

  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Update profile verification status
    UPDATE public.users
    SET
      is_verified = TRUE,
      email_verified_at = NEW.email_confirmed_at,
      updated_at = NOW()
    WHERE id = NEW.id;

    -- Log verification event
    INSERT INTO public.audit_log (event_type, user_id, details, created_at)
    VALUES ('email_verified_auto_sync', NEW.id, jsonb_build_object(
      'verified_at', NEW.email_confirmed_at,
      'trigger_version', 'phase2_enterprise_v1'
    ), NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the auto-provisioning trigger
-- ENTERPRISE PATTERN: Trigger on INSERT to auto-create profiles
DROP TRIGGER IF EXISTS auto_provision_user_profile_trigger ON auth.users;
CREATE TRIGGER auto_provision_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_provision_user_profile();

-- Step 4: Create the email verification sync trigger
-- ENTERPRISE PATTERN: Keep profile in sync with auth verification
DROP TRIGGER IF EXISTS auto_update_profile_on_verification_trigger ON auth.users;
CREATE TRIGGER auto_update_profile_on_verification_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_profile_on_verification();

-- Step 5: Grant necessary permissions for enterprise triggers
GRANT EXECUTE ON FUNCTION auto_provision_user_profile() TO service_role;
GRANT EXECUTE ON FUNCTION auto_update_profile_on_verification() TO service_role;

-- Ensure trigger functions have proper table access
GRANT INSERT, UPDATE, SELECT ON public.users TO postgres;
GRANT INSERT, UPDATE, SELECT ON public.provider_profiles TO postgres;
GRANT INSERT ON public.audit_log TO postgres;

-- Step 6: Create enterprise health check function
CREATE OR REPLACE FUNCTION phase2_system_health()
RETURNS JSONB AS $$
DECLARE
  provision_trigger_exists BOOLEAN;
  verification_trigger_exists BOOLEAN;
  policies_count INTEGER;
BEGIN
  -- Check if auto-provisioning trigger exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'auto_provision_user_profile_trigger'
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) INTO provision_trigger_exists;

  -- Check if verification sync trigger exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'auto_update_profile_on_verification_trigger'
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) INTO verification_trigger_exists;

  -- Count Phase 2 policies
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE policyname LIKE 'phase%';

  RETURN jsonb_build_object(
    'auto_provision_trigger_active', provision_trigger_exists,
    'verification_sync_trigger_active', verification_trigger_exists,
    'policies_count', policies_count,
    'system_ready', provision_trigger_exists AND verification_trigger_exists,
    'approach', 'database_auto_provisioning_enterprise',
    'pattern', 'meta_instagram_enterprise',
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION phase2_system_health() TO authenticated, anon;

-- Step 7: Log Phase 2 implementation
INSERT INTO public.audit_log (event_type, details, created_at)
VALUES ('phase2_auto_provisioning_implemented', jsonb_build_object(
  'version', 'phase2_enterprise_v1',
  'pattern', 'database_auto_provisioning',
  'approach', 'meta_instagram_enterprise',
  'features', ARRAY[
    'auto_provision_trigger_on_insert',
    'email_verification_sync_trigger',
    'provider_profile_auto_creation',
    'enterprise_error_handling',
    'never_break_auth_flow'
  ],
  'benefits', ARRAY[
    'zero_client_profile_creation',
    'instant_profile_availability',
    'device_agnostic_ready',
    'enterprise_reliability',
    'meta_instagram_patterns'
  ],
  'migration_file', '016_phase2_auto_provisioning_triggers.sql'
), NOW());

-- Comments for documentation
COMMENT ON FUNCTION auto_provision_user_profile() IS 'Phase 2: Enterprise auto-provisioning trigger following Meta/Instagram patterns';
COMMENT ON FUNCTION auto_update_profile_on_verification() IS 'Phase 2: Auto-sync profile verification status with auth.users';
COMMENT ON FUNCTION phase2_system_health() IS 'Phase 2: Enterprise system health check for auto-provisioning triggers';

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'Phase 2 Auto-Provisioning Triggers Complete';
  RAISE NOTICE 'Enterprise pattern: Database handles all profile creation';
  RAISE NOTICE 'Meta/Instagram approach: Zero client-side profile logic needed';
  RAISE NOTICE 'Run: SELECT phase2_system_health(); to verify installation';
END $$;