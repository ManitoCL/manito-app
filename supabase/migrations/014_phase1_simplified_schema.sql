-- PHASE 1: Simplified Schema for Application-Layer Auth
-- Golden Standard Implementation (Supabase Best Practice)
-- No database triggers - profile creation handled in application layer

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

-- Step 2: Fix Chilean phone validation constraints
-- Both phone_number and whatsapp_number should allow spaces
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

-- Also fix whatsapp_number constraint
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

-- Step 3: Add onboarding completion tracking
DO $$
BEGIN
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

-- Step 5: Create audit_log table for Phase 1 tracking
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

-- Step 6: Update RLS policies for Phase 1 application-layer access
-- Users can access their own profiles
DROP POLICY IF EXISTS "phase1_user_profile_access" ON public.users;
CREATE POLICY "phase1_user_profile_access" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profiles
DROP POLICY IF EXISTS "phase1_user_profile_update" ON public.users;
CREATE POLICY "phase1_user_profile_update" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profiles (for application-layer creation)
DROP POLICY IF EXISTS "phase1_user_profile_insert" ON public.users;
CREATE POLICY "phase1_user_profile_insert" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Provider profiles access
DROP POLICY IF EXISTS "phase1_provider_profile_access" ON public.provider_profiles;
CREATE POLICY "phase1_provider_profile_access" ON public.provider_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Step 7: Create Phase 1 system health check function
CREATE OR REPLACE FUNCTION phase1_system_health()
RETURNS JSONB AS $$
DECLARE
  audit_table_exists BOOLEAN;
  phone_constraint_exists BOOLEAN;
  onboarding_column_exists BOOLEAN;
  policies_count INTEGER;
BEGIN
  -- Check if audit_log table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'audit_log' AND table_schema = 'public'
  ) INTO audit_table_exists;

  -- Check if phone constraint is fixed
  SELECT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'users_phone_number_check'
    AND check_clause LIKE '%\\+56[\\s]?9%'
  ) INTO phone_constraint_exists;

  -- Check if onboarding_completed column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'onboarding_completed'
  ) INTO onboarding_column_exists;

  -- Count Phase 1 policies
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE policyname LIKE 'phase1_%';

  RETURN jsonb_build_object(
    'audit_table_exists', audit_table_exists,
    'phone_constraints_fixed', phone_constraint_exists,
    'onboarding_column_exists', onboarding_column_exists,
    'phase1_policies_count', policies_count,
    'system_ready', (
      audit_table_exists AND
      phone_constraint_exists AND
      onboarding_column_exists AND
      policies_count >= 4
    ),
    'approach', 'application_layer_profile_creation',
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION phase1_system_health() TO authenticated, anon;

-- Step 8: Log Phase 1 implementation
INSERT INTO public.audit_log (event_type, details, created_at)
VALUES ('phase1_simplified_schema', jsonb_build_object(
  'version', 'phase1_simplified_v1',
  'approach', 'application_layer_profile_creation',
  'features', ARRAY[
    'chilean_phone_validation_fixed',
    'onboarding_column_added',
    'optimized_indexes_created',
    'application_layer_rls_policies',
    'audit_log_table_created'
  ],
  'migration_file', '014_phase1_simplified_schema.sql',
  'benefits', ARRAY[
    'no_database_triggers_needed',
    'follows_supabase_best_practices',
    'avoids_auth_permissions_issues',
    'simpler_maintenance'
  ]
), NOW());

-- Comments for documentation
COMMENT ON FUNCTION phase1_system_health() IS 'Phase 1: System health check for simplified application-layer auth';
COMMENT ON TABLE public.audit_log IS 'Phase 1: Audit log for tracking auth events and system changes';

-- Step 9: Create helper function for application-layer profile creation
CREATE OR REPLACE FUNCTION check_profile_exists(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  profile_data RECORD;
  provider_data RECORD;
BEGIN
  -- Get user profile data
  SELECT
    u.id,
    u.email,
    u.full_name,
    u.user_type,
    u.is_verified,
    u.phone_number,
    u.email_verified_at IS NOT NULL as email_verified,
    u.onboarding_completed,
    u.created_at
  INTO profile_data
  FROM public.users u
  WHERE u.id = user_id_param;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'profile_exists', false,
      'needs_creation', true
    );
  END IF;

  -- Check for provider profile if user is provider
  IF profile_data.user_type = 'provider' THEN
    SELECT
      verification_status,
      business_name,
      rating,
      total_reviews
    INTO provider_data
    FROM public.provider_profiles
    WHERE user_id = user_id_param;
  END IF;

  RETURN jsonb_build_object(
    'profile_exists', true,
    'user_type', profile_data.user_type,
    'is_verified', profile_data.is_verified,
    'email_verified', profile_data.email_verified,
    'is_provider', (profile_data.user_type = 'provider'),
    'onboarding_completed', profile_data.onboarding_completed,
    'provider_status', COALESCE(provider_data.verification_status, null),
    'profile_data', row_to_json(profile_data)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_profile_exists(UUID) TO authenticated, anon;

COMMENT ON FUNCTION check_profile_exists(UUID) IS 'Phase 1: Helper function for application-layer profile status checking';

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'Phase 1 Simplified Schema Migration Complete';
  RAISE NOTICE 'Profile creation will be handled in application layer';
  RAISE NOTICE 'Run: SELECT phase1_system_health(); to verify installation';
END $$;