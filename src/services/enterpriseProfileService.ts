/**
 * Enterprise Profile Service
 * Optimized for Angi-like marketplace with Chilean market adaptations
 */

import { supabase } from './supabase';

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  display_name?: string;
  phone_number?: string;
  whatsapp_number?: string;
  user_type: 'customer' | 'provider' | 'admin';
  rut?: string;
  rut_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  avatar_url?: string;
  is_active: boolean;
  is_suspended: boolean;
  preferred_language: string;
  timezone: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  privacy_settings: {
    show_phone: boolean;
    show_email: boolean;
    show_last_seen: boolean;
  };
  registration_source?: string;
  referral_code?: string;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderProfileData {
  profile_id: string;
  business_name?: string;
  business_description?: string;
  business_rut?: string;
  business_type?: string;
  years_experience: number;
  specialties: string[];
  certifications: string[];
  languages: string[];
  service_regions: string[];
  max_travel_distance_km: number;
  working_hours: Record<string, any>;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  has_callout_fee: boolean;
  callout_fee_amount?: number;
  min_job_value?: number;
  verification_status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'suspended';
  background_check_status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'suspended';
  insurance_verified: boolean;
  tax_compliant: boolean;
  rating_average: number;
  rating_count: number;
  total_jobs_completed: number;
  total_revenue_clp: number;
  response_time_minutes: number;
  is_accepting_jobs: boolean;
  is_featured: boolean;
  portfolio_images: string[];
  portfolio_description?: string;
  bank_account_verified: boolean;
  payment_methods: {
    bank_transfer: boolean;
    cash: boolean;
    card: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateProfileParams {
  full_name: string;
  user_type: 'customer' | 'provider';
  phone_number?: string;
  rut?: string;
  business_name?: string;
  business_description?: string;
  source?: string;
}

export interface ProfileResult {
  success: boolean;
  error?: string;
  message?: string;
  profile_id?: string;
  profile_exists?: boolean;
  is_provider?: boolean;
  data?: ProfileData;
  provider_data?: ProviderProfileData;
}

class EnterpriseProfileService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  /**
   * Sleep utility for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Exponential backoff calculation
   */
  private getRetryDelay(attempt: number): number {
    return this.RETRY_DELAY_MS * Math.pow(2, attempt);
  }

  /**
   * Create user profile using enterprise RPC function
   */
  async createProfile(params: CreateProfileParams): Promise<ProfileResult> {
    console.log('🚀 Creating profile with enterprise workflow...', {
      user_type: params.user_type,
      has_phone: !!params.phone_number,
      has_rut: !!params.rut,
      source: params.source || 'mobile'
    });

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        // Call enterprise RPC function
        const { data, error } = await supabase.rpc('ensure_user_profile_enterprise', {
          user_metadata: {
            full_name: params.full_name,
            user_type: params.user_type,
            phone_number: params.phone_number,
            rut: params.rut,
            business_name: params.business_name,
            business_description: params.business_description,
            source: params.source || 'mobile'
          }
        });

        if (error) {
          console.error(`❌ Profile creation RPC error (attempt ${attempt + 1}):`, error);

          if (attempt === this.MAX_RETRIES - 1) {
            return {
              success: false,
              error: 'RPC_ERROR',
              message: `Failed to create profile: ${error.message}`
            };
          }

          await this.sleep(this.getRetryDelay(attempt));
          continue;
        }

        if (!data) {
          console.error(`❌ No data returned from RPC (attempt ${attempt + 1})`);

          if (attempt === this.MAX_RETRIES - 1) {
            return {
              success: false,
              error: 'NO_DATA',
              message: 'Profile creation returned no data'
            };
          }

          await this.sleep(this.getRetryDelay(attempt));
          continue;
        }

        console.log('✅ Profile creation RPC response:', data);

        // Return the result from the RPC function
        return {
          success: data.success,
          error: data.error,
          message: data.message,
          profile_id: data.profile_id,
          profile_exists: data.profile_exists,
          is_provider: data.is_provider || params.user_type === 'provider'
        };

      } catch (error) {
        console.error(`💥 Profile creation error (attempt ${attempt + 1}):`, error);

        if (attempt === this.MAX_RETRIES - 1) {
          return {
            success: false,
            error: 'UNEXPECTED_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
        }

        await this.sleep(this.getRetryDelay(attempt));
      }
    }

    return {
      success: false,
      error: 'MAX_RETRIES_EXCEEDED',
      message: 'Failed to create profile after maximum retries'
    };
  }

  /**
   * Get comprehensive profile status
   */
  async getProfileStatus(): Promise<ProfileResult> {
    try {
      console.log('📊 Getting profile status...');

      const { data, error } = await supabase.rpc('get_user_profile_status_enterprise');

      if (error) {
        console.error('❌ Profile status RPC error:', error);
        return {
          success: false,
          error: 'RPC_ERROR',
          message: `Failed to get profile status: ${error.message}`
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'NO_DATA',
          message: 'Profile status returned no data'
        };
      }

      console.log('✅ Profile status:', data);
      return data;

    } catch (error) {
      console.error('💥 Profile status error:', error);
      return {
        success: false,
        error: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get full profile data with provider info if applicable
   */
  async getFullProfile(): Promise<ProfileResult> {
    try {
      console.log('👤 Getting full profile data...');

      // Get basic profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        return {
          success: false,
          error: 'PROFILE_FETCH_ERROR',
          message: profileError.message
        };
      }

      if (!profile) {
        return {
          success: false,
          error: 'PROFILE_NOT_FOUND',
          message: 'Profile not found'
        };
      }

      const result: ProfileResult = {
        success: true,
        profile_exists: true,
        data: profile as ProfileData
      };

      // Get provider data if user is a provider
      if (profile.user_type === 'provider') {
        const { data: providerProfile, error: providerError } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        if (providerError) {
          console.warn('⚠️ Provider profile fetch error:', providerError);
        } else if (providerProfile) {
          result.provider_data = providerProfile as ProviderProfileData;
          result.is_provider = true;
        }
      }

      console.log('✅ Full profile retrieved:', {
        user_type: profile.user_type,
        has_provider_data: !!result.provider_data
      });

      return result;

    } catch (error) {
      console.error('💥 Full profile fetch error:', error);
      return {
        success: false,
        error: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update profile data
   */
  async updateProfile(updates: Partial<ProfileData>): Promise<ProfileResult> {
    try {
      console.log('🔄 Updating profile...', updates);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return {
          success: false,
          error: 'NOT_AUTHENTICATED',
          message: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        return {
          success: false,
          error: 'UPDATE_ERROR',
          message: error.message
        };
      }

      console.log('✅ Profile updated successfully');
      return {
        success: true,
        message: 'Profile updated successfully',
        data: data as ProfileData
      };

    } catch (error) {
      console.error('💥 Profile update error:', error);
      return {
        success: false,
        error: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update provider profile data
   */
  async updateProviderProfile(updates: Partial<ProviderProfileData>): Promise<ProfileResult> {
    try {
      console.log('🔄 Updating provider profile...', updates);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return {
          success: false,
          error: 'NOT_AUTHENTICATED',
          message: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('provider_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Provider profile update error:', error);
        return {
          success: false,
          error: 'UPDATE_ERROR',
          message: error.message
        };
      }

      console.log('✅ Provider profile updated successfully');
      return {
        success: true,
        message: 'Provider profile updated successfully',
        provider_data: data as ProviderProfileData
      };

    } catch (error) {
      console.error('💥 Provider profile update error:', error);
      return {
        success: false,
        error: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Main method for ensuring profile exists (with retry logic)
   */
  async ensureProfileExists(userMetadata?: any): Promise<ProfileResult> {
    console.log('🔍 Ensuring profile exists with enterprise workflow...');

    // First check if profile already exists
    const statusResult = await this.getProfileStatus();

    if (statusResult.success && statusResult.profile_exists) {
      console.log('✅ Profile already exists');
      return statusResult;
    }

    // Extract profile data from userMetadata
    const profileParams: CreateProfileParams = {
      full_name: userMetadata?.full_name || userMetadata?.name || '',
      user_type: userMetadata?.user_type || 'customer',
      phone_number: userMetadata?.phone_number || userMetadata?.phone,
      rut: userMetadata?.rut,
      business_name: userMetadata?.business_name,
      business_description: userMetadata?.business_description,
      source: userMetadata?.source || 'mobile'
    };

    // Validate required fields
    if (!profileParams.full_name || profileParams.full_name.trim().length === 0) {
      return {
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Full name is required to create profile'
      };
    }

    // Create the profile
    return await this.createProfile(profileParams);
  }
}

// Export singleton instance
export const enterpriseProfileService = new EnterpriseProfileService();
export default enterpriseProfileService;