import { supabase } from './supabase';
import { User } from '../types';

export class AuthService {
  // Sign up with email and password
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

      // If signup is successful, create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          ...userData,
          id: data.user.id,
          email,
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
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

      // If signup is successful, create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          ...userData,
          id: data.user.id,
          phoneNumber,
        });
      }

      return { data, error: null };
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

        if (error) throw error;
        return { user: profile, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
  }

  // Create user profile in database
  static async createUserProfile(userId: string, userData: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: userData.email,
            full_name: userData.fullName,
            phone_number: userData.phoneNumber,
            user_type: userData.userType || 'consumer',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // If user is a provider, create provider profile
      if (userData.userType === 'provider') {
        const { error: providerError } = await supabase
          .from('provider_profiles')
          .insert([{ user_id: userId }]);

        if (providerError) {
          console.error('Error creating provider profile:', providerError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Create user profile error:', error);
      return { data: null, error };
    }
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
}