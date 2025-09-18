// Enterprise Profile Management Service
// Handles explicit profile creation and management separate from auth
import { supabase } from './supabase';

export interface ProfileStatus {
  success: boolean;
  error?: string;
  message?: string;
  user_id?: string;
  email?: string;
  email_verified?: boolean;
  profile_exists?: boolean;
  user_type?: 'customer' | 'provider';
  full_name?: string;
  phone_number?: string;
  phone_verified?: boolean;
  rut?: string;
  rut_verified?: boolean;
  is_active?: boolean;
  profile_created_at?: string;
  provider_profile?: {
    business_name?: string;
    business_description?: string;
    verification_status?: string;
    verified_at?: string;
    is_available?: boolean;
    rating_average?: number;
    rating_count?: number;
    total_jobs_completed?: number;
  };
  provider_profile_missing?: boolean;
  requires_provider_setup?: boolean;
  needs_profile_creation?: boolean;
  can_create_profile?: boolean;
  requires_verification?: boolean;
}

export interface ProfileCreationResult {
  success: boolean;
  error?: string;
  message?: string;
  user_id?: string;
  user_type?: string;
  profile_exists?: boolean;
  requires_provider_setup?: boolean;
  retry_recommended?: boolean;
  details?: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  phone_number?: string;
  rut?: string;
  provider_updates?: {
    business_name?: string;
    business_description?: string;
    business_rut?: string;
    years_experience?: number;
    hourly_rate_min?: number;
    hourly_rate_max?: number;
    is_available?: boolean;
  };
}

export interface ProfileUpdateResult {
  success: boolean;
  error?: string;
  message?: string;
  updated_profile?: boolean;
  updated_provider_profile?: boolean;
  details?: string;
}

/**
 * Get comprehensive profile status for the authenticated user
 */
export async function getProfileStatus(): Promise<ProfileStatus> {
  try {
    const { data, error } = await supabase.rpc('get_profile_status_enterprise');

    if (error) {
      console.error('Profile status check failed:', error);
      return {
        success: false,
        error: 'PROFILE_STATUS_CHECK_FAILED',
        message: error.message || 'Failed to check profile status',
      };
    }

    return data as ProfileStatus;
  } catch (error) {
    console.error('Profile status service error:', error);
    return {
      success: false,
      error: 'SERVICE_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Create user profile using enterprise approach
 */
export async function createProfile(userMetadata?: any): Promise<ProfileCreationResult> {
  try {
    const { data, error } = await supabase.rpc('create_user_profile_enterprise', {
      user_metadata: userMetadata || null,
    });

    if (error) {
      console.error('Profile creation failed:', error);
      return {
        success: false,
        error: 'PROFILE_CREATION_FAILED',
        message: error.message || 'Failed to create profile',
        retry_recommended: true,
      };
    }

    return data as ProfileCreationResult;
  } catch (error) {
    console.error('Profile creation service error:', error);
    return {
      success: false,
      error: 'SERVICE_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      retry_recommended: true,
    };
  }
}

/**
 * Update user profile with retry logic
 */
export async function updateProfile(updates: ProfileUpdateData): Promise<ProfileUpdateResult> {
  try {
    const { data, error } = await supabase.rpc('update_profile_enterprise', {
      profile_updates: updates,
    });

    if (error) {
      console.error('Profile update failed:', error);
      return {
        success: false,
        error: 'PROFILE_UPDATE_FAILED',
        message: error.message || 'Failed to update profile',
      };
    }

    return data as ProfileUpdateResult;
  } catch (error) {
    console.error('Profile update service error:', error);
    return {
      success: false,
      error: 'SERVICE_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Retry profile creation with exponential backoff
 */
export async function retryProfileCreation(
  userMetadata?: any,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<ProfileCreationResult> {
  let lastError: ProfileCreationResult | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Profile creation attempt ${attempt}/${maxRetries}`);

      const result = await createProfile(userMetadata);

      if (result.success) {
        console.log('Profile creation succeeded on attempt', attempt);
        return result;
      }

      lastError = result;

      // Don't retry certain types of errors
      if (result.error === 'AUTHENTICATION_REQUIRED' ||
          result.error === 'EMAIL_NOT_VERIFIED' ||
          result.error === 'USER_NOT_FOUND') {
        console.log('Non-retryable error, stopping:', result.error);
        return result;
      }

      // If profile already exists, that's success
      if (result.profile_exists) {
        console.log('Profile already exists, treating as success');
        return { ...result, success: true };
      }

      // Wait before retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Profile creation attempt ${attempt} failed:`, error);
      lastError = {
        success: false,
        error: 'SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        retry_recommended: attempt < maxRetries,
      };
    }
  }

  console.error('All profile creation attempts failed');
  return lastError || {
    success: false,
    error: 'MAX_RETRIES_EXCEEDED',
    message: 'Failed to create profile after maximum retries',
    retry_recommended: false,
  };
}

/**
 * Ensure profile exists with comprehensive checks
 */
export async function ensureProfileExists(userMetadata?: any): Promise<{
  success: boolean;
  profileExists: boolean;
  profileCreated: boolean;
  error?: string;
  message?: string;
  profileStatus?: ProfileStatus;
}> {
  try {
    // First, check current profile status
    console.log('Checking profile status...');
    const profileStatus = await getProfileStatus();

    if (!profileStatus.success) {
      return {
        success: false,
        profileExists: false,
        profileCreated: false,
        error: profileStatus.error,
        message: profileStatus.message,
      };
    }

    // If profile already exists, we're done
    if (profileStatus.profile_exists) {
      console.log('Profile already exists');
      return {
        success: true,
        profileExists: true,
        profileCreated: false,
        profileStatus,
      };
    }

    // Check if profile creation is possible
    if (!profileStatus.can_create_profile) {
      return {
        success: false,
        profileExists: false,
        profileCreated: false,
        error: 'PROFILE_CREATION_NOT_ALLOWED',
        message: profileStatus.email_verified ?
          'Profile creation not allowed' :
          'Email must be verified before creating profile',
        profileStatus,
      };
    }

    // Try to create profile
    console.log('Creating profile...');
    const creationResult = await retryProfileCreation(userMetadata);

    if (creationResult.success) {
      console.log('Profile created successfully');

      // Get updated profile status
      const updatedStatus = await getProfileStatus();

      return {
        success: true,
        profileExists: true,
        profileCreated: true,
        profileStatus: updatedStatus.success ? updatedStatus : undefined,
      };
    } else {
      console.error('Profile creation failed:', creationResult);
      return {
        success: false,
        profileExists: creationResult.profile_exists || false,
        profileCreated: false,
        error: creationResult.error,
        message: creationResult.message,
        profileStatus,
      };
    }
  } catch (error) {
    console.error('Ensure profile exists failed:', error);
    return {
      success: false,
      profileExists: false,
      profileCreated: false,
      error: 'SERVICE_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}