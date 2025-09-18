import { supabase } from './supabase';
import { User } from '../types';

export class AuthService {
  // Sign up with email and password - FIXED for email confirmation
  static async signUp(email: string, password: string, userData: Partial<User>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
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

  // Sign up with phone number
  static async signUpWithPhone(phoneNumber: string, userData: Partial<User>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        phone: phoneNumber,
        password: '', // Phone auth doesn't require password
        options: {
          data: {
            full_name: userData.fullName,
            user_type: userData.userType || 'consumer',
          },
        },
      });

      if (error) throw error;

      // Phone verification required - profile will be created after OTP verification
      return { 
        data, 
        error: null, 
        needsVerification: true,
        message: 'Please enter the verification code sent to your phone.'
      };
    } catch (error) {
      console.error('Phone sign up error:', error);
      return { data: null, error };
    }
  }

  // Verify phone number with OTP
  static async verifyPhoneOTP(phoneNumber: string, token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });

      if (error) throw error;

      // After successful OTP verification, try to create profile if it doesn't exist
      if (data.user && data.session) {
        try {
          await this.createUserProfileSafe(data.user.id, '', {
            phoneNumber,
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

  // Sign in with phone number
  static async signInWithPhone(phoneNumber: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Phone sign in error:', error);
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
        email: email
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { data: null, error };
    }
  }
}