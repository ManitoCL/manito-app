-- Fix user_type enum: consumer -> customer (better marketplace terminology)
-- This addresses the user feedback that "consumer" is misleading

-- Step 1: Add 'customer' to the existing enum
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'customer';

-- Step 2: Update all existing 'consumer' records to 'customer'
UPDATE users SET user_type = 'customer' WHERE user_type = 'consumer';

-- Step 3: Update the trigger function to use 'customer' as default
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
    user_user_type := COALESCE(user_metadata->>'user_type', 'customer'); -- Changed from 'consumer'

    -- Check if profile already exists
    SELECT id INTO existing_profile FROM users WHERE id = NEW.id;

    IF existing_profile IS NULL THEN
      -- Create user profile
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
          user_user_type::user_type, -- This now works with 'customer'
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

        -- Log success
        INSERT INTO audit_log (event_type, user_id, details, created_at)
        VALUES ('profile_auto_created', NEW.id, jsonb_build_object(
          'user_type', user_user_type,
          'email', NEW.email
        ), NOW());

      EXCEPTION
        WHEN OTHERS THEN
          -- Log error but don't fail auth
          INSERT INTO audit_log (event_type, user_id, details, created_at)
          VALUES ('profile_creation_failed', NEW.id, jsonb_build_object(
            'error', SQLERRM
          ), NOW());
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

-- Step 4: Update the secure profile status function
CREATE OR REPLACE FUNCTION get_user_profile_status()
RETURNS JSONB AS $$
DECLARE
  auth_user_id UUID;
  profile_data RECORD;
BEGIN
  auth_user_id := auth.uid();

  IF auth_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;

  SELECT
    id,
    email,
    full_name,
    user_type,
    is_verified,
    email_verified_at IS NOT NULL as email_verified
  INTO profile_data
  FROM users
  WHERE id = auth_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'profile_exists', true,
      'user_type', profile_data.user_type,
      'is_verified', profile_data.is_verified,
      'email_verified', profile_data.email_verified
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'profile_exists', false,
      'needs_creation', true
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: We don't remove 'consumer' from enum yet to avoid breaking existing data
-- After confirming everything works, we can create another migration to clean up the enum

COMMENT ON TYPE user_type IS 'User types for marketplace: customer (books services) and provider (offers services). Note: consumer is deprecated, use customer.';