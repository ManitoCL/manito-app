import { supabase } from './supabase';
import { User } from '../types';
import * as Linking from 'expo-linking';
import { WebCallbackHandler, updateAuthServiceUrls } from './webCallbackHandler';

// International phone number support for Latin America + USA + popular destinations
export const SUPPORTED_COUNTRIES = {
  // Latin America & Caribbean
  'AR': { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  'BO': { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  'BR': { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  'CL': { code: '+56', name: 'Chile', flag: '🇨🇱' },
  'CO': { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  'CR': { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  'CU': { code: '+53', name: 'Cuba', flag: '🇨🇺' },
  'DO': { code: '+1', name: 'República Dominicana', flag: '🇩🇴' },
  'EC': { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  'SV': { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
  'GT': { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  'HN': { code: '+504', name: 'Honduras', flag: '🇭🇳' },
  'MX': { code: '+52', name: 'México', flag: '🇲🇽' },
  'NI': { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  'PA': { code: '+507', name: 'Panamá', flag: '🇵🇦' },
  'PY': { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  'PE': { code: '+51', name: 'Perú', flag: '🇵🇪' },
  'UY': { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  'VE': { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  
  // North America
  'US': { code: '+1', name: 'United States', flag: '🇺🇸' },
  'CA': { code: '+1', name: 'Canada', flag: '🇨🇦' },
  
  // Popular international destinations
  'ES': { code: '+34', name: 'España', flag: '🇪🇸' },
  'IT': { code: '+39', name: 'Italia', flag: '🇮🇹' },
  'FR': { code: '+33', name: 'Francia', flag: '🇫🇷' },
  'DE': { code: '+49', name: 'Alemania', flag: '🇩🇪' },
  'GB': { code: '+44', name: 'Reino Unido', flag: '🇬🇧' },
  'AU': { code: '+61', name: 'Australia', flag: '🇦🇺' },
} as const;

export class AuthService {
  // Format and validate international phone numbers
  static formatPhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Must start with + and have at least 8 digits after country code
    if (!cleaned.startsWith('+') || cleaned.length < 10) {
      return null;
    }
    
    // Check if it matches any of our supported country codes
    const supportedCodes = Object.values(SUPPORTED_COUNTRIES || {}).map(c => c.code);
    const hasValidCode = supportedCodes.some(code => cleaned.startsWith(code));
    
    if (!hasValidCode) {
      return null;
    }
    
    return cleaned;
  }

  // Get country info from phone number
  static getCountryFromPhone(phoneNumber: string) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    if (!formatted) return null;
    
    // Find matching country (longest code first to handle +1 correctly)
    const sortedCountries = Object.entries(SUPPORTED_COUNTRIES || {})
      .sort(([,a], [,b]) => b.code.length - a.code.length);
      
    for (const [countryCode, info] of sortedCountries) {
      if (formatted.startsWith(info.code)) {
        return { countryCode, ...(info || {}) };
      }
    }
    
    return null;
  }

  // Sign up with email and password - FIXED for email confirmation
  static async signUp(email: string, password: string, userData: Partial<User>) {
    try {
      // Debug: Log the URLs being used
      WebCallbackHandler.debugUrls();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: WebCallbackHandler.getRedirectUrl(),
          data: {
            full_name: userData.fullName,
            user_type: userData.userType || 'consumer',
            phone_number: userData.phoneNumber,
          },
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required - profile will be created by database trigger after confirmation
        return { 
          data, 
          error: null, 
          needsConfirmation: true,
          message: 'Please check your email and click the confirmation link to activate your account.'
        };
      }

      // If session exists (email confirmation disabled), profile should be created by trigger
      // But let's use our safe function as backup
      if (data.user && data.session) {
        try {
          await this.createUserProfileSafe(data.user.id, email, userData);
        } catch (profileError) {
          // Profile creation failed, but user is created - they can complete profile later
          console.warn('Profile creation failed, but user authenticated:', profileError);
        }
      }

      return { data, error: null, needsConfirmation: false };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  // Sign up with international phone number
  static async signUpWithPhone(phoneNumber: string, userData: Partial<User>) {
    try {
      // Validate and format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        const supportedCountries = Object.values(SUPPORTED_COUNTRIES || {})
          .map(c => `${c.flag} ${c.name} ${c.code}`)
          .slice(0, 5)
          .join(', ');
        
        return { 
          data: null, 
          error: { 
            message: `Invalid phone number format. Please include country code.\n\nSupported countries include: ${supportedCountries}...` 
          }
        };
      }

      // Get country info for logging
      const countryInfo = this.getCountryFromPhone(formattedPhone);
      console.log(`Phone signup attempt: ${formattedPhone} (${countryInfo?.name || 'Unknown'})`);

      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            full_name: userData.fullName,
            user_type: userData.userType || 'consumer',
            phone_number: formattedPhone,
            country_code: countryInfo?.countryCode,
          },
        },
      });

      if (error) throw error;

      // Phone verification required - profile will be created after OTP verification
      return { 
        data, 
        error: null, 
        needsVerification: true,
        message: `Verification code sent to ${formattedPhone} ${countryInfo?.flag || ''}`
      };
    } catch (error) {
      console.error('Phone sign up error:', error);
      return { data: null, error };
    }
  }

  // Sign in with international phone number
  static async signInWithPhone(phoneNumber: string) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return { 
          data: null, 
          error: { message: 'Invalid phone number format. Please include country code.' }
        };
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      
      const countryInfo = this.getCountryFromPhone(formattedPhone);
      return { 
        data, 
        error: null,
        message: `Verification code sent to ${formattedPhone} ${countryInfo?.flag || ''}`
      };
    } catch (error) {
      console.error('Phone sign in error:', error);
      return { data: null, error };
    }
  }

  // Social authentication
  static async signInWithProvider(provider: 'google' | 'apple' | 'facebook') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: WebCallbackHandler.getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      return { data: null, error };
    }
  }

  // Safe user profile creation using database function
  static async createUserProfileSafe(userId: string, email: string, userData: Partial<User>) {
    try {
      const { data, error } = await supabase.rpc('create_user_profile_safe', {
        user_id: userId,
        user_email: email,
        user_full_name: userData.fullName || '',
        user_type: userData.userType || 'consumer',
        user_phone: userData.phoneNumber || null
      });

      if (error) throw error;
      
      if (data && !data.success) {
        throw new Error(data.error || 'Profile creation failed');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Safe profile creation error:', error);
      return { data: null, error };
    }
  }

  // Verify phone number with OTP
  static async verifyPhoneOTP(phoneNumber: string, token: string) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return { 
          data: null, 
          error: { message: 'Invalid phone number format' }
        };
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error) throw error;

      // After successful OTP verification, try to create profile if it doesn't exist
      if (data.user && data.session) {
        try {
          await this.createUserProfileSafe(data.user.id, '', {
            phoneNumber: formattedPhone,
            userType: data.user.user_metadata?.user_type || 'consumer',
            fullName: data.user.user_metadata?.full_name || ''
          });
        } catch (profileError) {
          console.warn('Profile creation after phone verification failed:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Phone verification error:', error);
      return { data: null, error };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user profile from our custom table
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // If profile doesn't exist but user is authenticated, try to create it
          if (error.code === 'PGRST116') { // No rows returned
            console.warn('User profile not found, attempting to create...');
            try {
              await this.createUserProfileSafe(user.id, user.email || '', {
                fullName: user.user_metadata?.full_name || '',
                userType: user.user_metadata?.user_type || 'consumer',
                phoneNumber: user.user_metadata?.phone_number || user.phone || null
              });
              
              // Try to fetch again
              const { data: newProfile, error: newError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
                
              if (newError) throw newError;
              return { user: newProfile, error: null };
            } catch (createError) {
              console.error('Failed to create missing profile:', createError);
              return { user: null, error: createError };
            }
          }
          throw error;
        }
        
        return { user: profile, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
  }

  // Legacy method - kept for compatibility but will use safe method
  static async createUserProfile(userId: string, userData: Partial<User>) {
    console.warn('createUserProfile is deprecated, using createUserProfileSafe instead');
    return this.createUserProfileSafe(userId, userData.email || '', userData);
  }

  // Validate Chilean RUT
  static async validateRUT(rut: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('validate_rut', { rut });
      
      if (error) {
        console.error('RUT validation error:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('RUT validation error:', error);
      return false;
    }
  }

  // Update user RUT
  static async updateRUT(userId: string, rut: string) {
    try {
      // First validate the RUT
      const isValid = await this.validateRUT(rut);
      if (!isValid) {
        return { data: null, error: { message: 'RUT inválido' } };
      }

      const { data, error } = await supabase
        .from('users')
        .update({ 
          rut_number: rut,
          rut_verified: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update RUT error:', error);
      return { data: null, error };
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { data: null, error };
    }
  }

  // Resend confirmation email
  static async resendConfirmation(email: string) {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: WebCallbackHandler.getRedirectUrl(),
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { data: null, error };
    }
  }

  // Get supported countries for UI
  static getSupportedCountries() {
    return Object.entries(SUPPORTED_COUNTRIES || {}).map(([code, info]) => ({
      code,
      ...(info || {}),
    }));
  }

  // Get popular countries (for quick selection)
  static getPopularCountries() {
    const popular = ['CL', 'US', 'AR', 'BR', 'CO', 'MX', 'PE', 'ES'];
    return popular.map(code => ({
      code,
      ...(SUPPORTED_COUNTRIES[code as keyof typeof SUPPORTED_COUNTRIES] || {}),
    }));
  }
}
  // Resend email confirmation
