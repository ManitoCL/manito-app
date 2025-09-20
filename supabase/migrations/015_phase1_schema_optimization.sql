-- PHASE 1: Schema Optimization for Auto-Profile System
-- Golden Standard database structure for streamlined auth flow
-- Optimizes schema for auto-profile triggers and simplified profile status

-- Step 1: Ensure user_type enum has all required values
DO $$
BEGIN
  -- Add 'customer' if it doesn't exist (idempotent)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'customer' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')) THEN
    ALTER TYPE user_type ADD VALUE 'customer';
  END IF;

  -- Add 'admin' if it doesn't exist (for future use)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')) THEN
    ALTER TYPE user_type ADD VALUE 'admin';
  END IF;
END $$;

-- Step 2: Update users table constraints for Phase 1 compatibility
-- Ensure Chilean phone validation works with spaces for both phone_number and whatsapp_number
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_phone_number_check;
ALTER TABLE public.users ADD CONSTRAINT users_phone_number_check
CHECK (
  phone_number IS NULL OR
  (
    -- Chilean mobile format: +56 9 XXXX XXXX (with or without spaces)
    phone_number ~ '^\\+56[\\s]?9[\\s]?\\d{4}[\\s]?\\d{4}$' OR
    -- Chilean landline format: +56 2 XXXX XXXX (with or without spaces)
    phone_number ~ '^\\+56[\\s]?[2-9][\\s]?\\d{4}[\\s]?\\d{4}$' OR
    -- Compact format without spaces: +56912345678
    phone_number ~ '^\\+56[2-9]\\d{8}$'
  )
);

-- Also fix whatsapp_number constraint (same issue)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_whatsapp_number_check;
ALTER TABLE public.users ADD CONSTRAINT users_whatsapp_number_check
CHECK (
  whatsapp_number IS NULL OR
  (
    -- Chilean mobile format: +56 9 XXXX XXXX (with or without spaces)
    whatsapp_number::text ~ '^\\+56[\\s]?9[\\s]?\\d{4}[\\s]?\\d{4}$' OR
    -- Chilean landline format: +56 2 XXXX XXXX (with or without spaces)
    whatsapp_number::text ~ '^\\+56[\\s]?[2-9][\\s]?\\d{4}[\\s]?\\d{4}$' OR
    -- Compact format without spaces: +56912345678
    whatsapp_number::text ~ '^\\+56[2-9]\\d{8}$'
  )
);

-- Step 3: Add Phase 1 specific columns for enhanced user experience
-- Note: Based on schema.sql, display_name, whatsapp_number, notification_preferences,
-- and privacy_settings already exist, so only add onboarding_completed
DO $$
BEGIN
  -- Add onboarding completion tracking (this is the only new column needed)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    COMMENT ON COLUMN public.users.onboarding_completed IS 'Phase 1: Tracks if user has completed onboarding flow';
  END IF;
END $$;

-- Step 4: Create optimized indexes for Phase 1 performance
-- Note: Using regular CREATE INDEX (not CONCURRENTLY) for transaction compatibility
CREATE INDEX IF NOT EXISTS idx_users_user_type_verified
  ON public.users(user_type, is_verified)
  WHERE is_verified = TRUE;

CREATE INDEX IF NOT EXISTS idx_users_email_verified_at
  ON public.users(email_verified_at)
  WHERE email_verified_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id_status
  ON public.provider_profiles(user_id, verification_status);

-- Step 5: Update RLS policies for Phase 1 auto-profile access
-- Ensure users can immediately access their auto-created profiles
DROP POLICY IF EXISTS "phase1_auto_profile_access" ON public.users;
CREATE POLICY "phase1_auto_profile_access" ON public.users
  FOR SELECT USING (
    auth.uid() = id AND
    (is_verified = TRUE OR email_verified_at IS NOT NULL)
  );

-- Allow users to update their own profiles after auto-creation
DROP POLICY IF EXISTS "phase1_auto_profile_update" ON public.users;
CREATE POLICY "phase1_auto_profile_update" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Provider profiles auto-access
DROP POLICY IF EXISTS "phase1_provider_auto_access" ON public.provider_profiles;
CREATE POLICY "phase1_provider_auto_access" ON public.provider_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Step 6: Create Phase 1 profile completion function
CREATE OR REPLACE FUNCTION get_phase1_profile_completion(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  user_data RECORD;
  provider_data RECORD;
  completion_score INTEGER := 0;
  total_fields INTEGER := 10;
  completion_details JSONB := '{}';
BEGIN
  -- Get user data
  SELECT * INTO user_data FROM public.users WHERE id = user_id_param;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'completion_percentage', 0,
      'is_complete', false,
      'missing_fields', ARRAY['profile_not_found']
    );
  END IF;

  -- Calculate completion score
  IF user_data.full_name IS NOT NULL AND length(user_data.full_name) > 2 THEN
    completion_score := completion_score + 2;
  END IF;

  IF user_data.phone_number IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;

  IF user_data.whatsapp_number IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;

  IF user_data.avatar_url IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;

  IF user_data.rut_number IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;

  IF user_data.display_name IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;

  IF user_data.email_verified_at IS NOT NULL THEN
    completion_score := completion_score + 2;
  END IF;

  IF user_data.onboarding_completed = TRUE THEN
    completion_score := completion_score + 1;
  END IF;

  -- Check provider profile if applicable
  IF user_data.user_type = 'provider' THEN
    SELECT * INTO provider_data FROM public.provider_profiles WHERE user_id = user_id_param;
    IF FOUND THEN
      IF provider_data.business_name IS NOT NULL THEN
        completion_score := completion_score + 1;
      END IF;
      IF provider_data.description IS NOT NULL THEN
        completion_score := completion_score + 1;
      END IF;
    END IF;
    total_fields := total_fields + 2;
  END IF;

  RETURN jsonb_build_object(
    'completion_percentage', round((completion_score::DECIMAL / total_fields::DECIMAL) * 100),
    'completion_score', completion_score,
    'total_fields', total_fields,
    'is_complete', completion_score >= (total_fields - 2),
    'user_type', user_data.user_type,
    'is_provider', user_data.user_type = 'provider',
    'onboarding_completed', user_data.onboarding_completed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Grant permissions for Phase 1 functions
-- Note: get_simple_profile_status() not needed - using application-layer profile checking
GRANT EXECUTE ON FUNCTION get_phase1_profile_completion(UUID) TO authenticated;

-- Step 8: Ensure audit_log table exists for Phase 1 tracking
-- (Create if it doesn't exist - should have been created in 014 migration)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'audit_log'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Ensure policy exists
DROP POLICY IF EXISTS "audit_log_service_only" ON public.audit_log;
CREATE POLICY "audit_log_service_only" ON public.audit_log
  FOR ALL USING (current_setting('role') = 'service_role');

-- Step 9: Create Phase 1 health check function
CREATE OR REPLACE FUNCTION phase1_system_health()
RETURNS JSONB AS $$
DECLARE
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
  policies_count INTEGER;
BEGIN
  -- Note: No auto-profile triggers in application-layer approach
  trigger_exists := false;

  -- Check if profile completion function exists (application-layer approach)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'get_phase1_profile_completion'
  ) INTO function_exists;

  -- Count Phase 1 policies
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE policyname LIKE 'phase1_%';

  RETURN jsonb_build_object(
    'auto_profile_trigger_active', false, -- Application-layer approach, no triggers needed
    'profile_completion_function_active', function_exists,
    'phase1_policies_count', policies_count,
    'system_ready', function_exists AND policies_count >= 3,
    'approach', 'application_layer_profile_creation',
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Log Phase 1 schema optimization completion
INSERT INTO public.audit_log (event_type, details, created_at)
VALUES ('phase1_schema_optimization', jsonb_build_object(
  'version', 'phase1_schema_v1',
  'features', ARRAY[
    'chilean_phone_validation_fixed',
    'auto_profile_indexes_optimized',
    'phase1_rls_policies_updated',
    'profile_completion_function_added',
    'system_health_check_added'
  ],
  'migration_file', '015_phase1_schema_optimization.sql'
), NOW());

-- Comments for documentation
COMMENT ON FUNCTION get_phase1_profile_completion(UUID) IS 'Phase 1: Calculate user profile completion percentage for onboarding';
COMMENT ON FUNCTION phase1_system_health() IS 'Phase 1: System health check for application-layer auth and simplified components';
COMMENT ON INDEX idx_users_user_type_verified IS 'Phase 1: Optimized index for user type and verification status queries';
COMMENT ON INDEX idx_users_email_verified_at IS 'Phase 1: Optimized index for email verification queries';