-- Fix: Create missing get_user_profile_status_enterprise function
-- This function is called by the app but was never implemented

CREATE OR REPLACE FUNCTION get_user_profile_status_enterprise()
RETURNS JSONB AS $$
DECLARE
  current_user_id UUID;
  user_record RECORD;
  provider_record RECORD;
  result JSONB;
BEGIN
  -- Get current authenticated user ID
  current_user_id := auth.uid();

  -- If no authenticated user, return error
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'message', 'No authenticated user found'
    );
  END IF;

  -- Get user record from public.users table
  SELECT * INTO user_record FROM public.users WHERE id = current_user_id;

  -- If user doesn't exist in public.users, return profile needs creation
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'profile_exists', false,
      'error', 'PROFILE_NOT_FOUND',
      'message', 'User profile not found, needs creation'
    );
  END IF;

  -- Build basic result with user data
  result := jsonb_build_object(
    'success', true,
    'profile_exists', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'full_name', user_record.full_name,
    'user_type', user_record.user_type,
    'is_verified', user_record.is_verified,
    'email_verified_at', user_record.email_verified_at,
    'phone_verified', user_record.phone_verified,
    'created_at', user_record.created_at,
    'updated_at', user_record.updated_at
  );

  -- Add provider-specific data if user is a provider
  IF user_record.user_type = 'provider' THEN
    SELECT * INTO provider_record FROM public.provider_profiles WHERE user_id = current_user_id;

    IF FOUND THEN
      result := result || jsonb_build_object(
        'provider_profile', jsonb_build_object(
          'business_name', provider_record.business_name,
          'verification_status', provider_record.verification_status,
          'is_identity_verified', provider_record.is_identity_verified,
          'comuna', provider_record.comuna,
          'services_offered', provider_record.services_offered
        )
      );
    ELSE
      result := result || jsonb_build_object(
        'provider_profile', null,
        'needs_provider_profile', true
      );
    END IF;
  END IF;

  -- Add completion percentage using existing function
  BEGIN
    result := result || jsonb_build_object(
      'completion', get_phase1_profile_completion(current_user_id)
    );
  EXCEPTION WHEN OTHERS THEN
    -- If completion function fails, continue without it
    result := result || jsonb_build_object(
      'completion', jsonb_build_object('completion_percentage', 0)
    );
  END;

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Graceful error handling
  RETURN jsonb_build_object(
    'success', false,
    'error', 'UNEXPECTED_ERROR',
    'message', SQLERRM,
    'profile_exists', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_status_enterprise() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_profile_status_enterprise() IS 'Enterprise: Get comprehensive profile status for authenticated user';

-- Log the fix
INSERT INTO public.audit_log (event_type, details, created_at)
VALUES ('missing_function_created', jsonb_build_object(
  'function_name', 'get_user_profile_status_enterprise',
  'reason', 'app_called_non_existent_function',
  'migration_file', '017_create_missing_profile_status_function.sql'
), NOW());