/**
 * Profile Service - Backend API Architect Pattern
 * Handles user profile operations for consumers and providers
 */

import { supabase } from './supabase';
import { User, Provider, Address } from '../types';

export class ProfileService {
  // Get user profile with provider data if applicable
  static async getUserProfile(userId: string) {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      let providerProfile = null;
      if (user.user_type === 'provider') {
        const { data: provider, error: providerError } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!providerError) {
          providerProfile = provider;
        }
      }

      return { 
        data: { 
          ...(user || {}), 
          providerProfile 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { data: null, error };
    }
  }

  // Update basic user profile
  static async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: updates.fullName,
          phone_number: updates.phoneNumber,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { data: null, error };
    }
  }

  // Update provider profile
  static async updateProviderProfile(userId: string, updates: Partial<Provider>) {
    try {
      const { data, error } = await supabase
        .from('provider_profiles')
        .update({
          business_name: updates.businessName,
          description: updates.description,
          services: updates.services,
          service_areas: updates.serviceAreas,
          hourly_rate_clp: updates.hourlyRate,
          is_available: updates.isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update provider profile error:', error);
      return { data: null, error };
    }
  }

  // Get user addresses
  static async getUserAddresses(userId: string) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user addresses error:', error);
      return { data: null, error };
    }
  }

  // Add user address
  static async addUserAddress(userId: string, address: Partial<Address>) {
    try {
      // If this is the default address, unset others
      if (address.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert([
          {
            user_id: userId,
            address_type: address.addressType || 'home',
            street: address.street,
            city: address.city,
            comuna: address.comuna,
            region: address.region,
            postal_code: address.postalCode,
            coordinates: address.coordinates,
            is_default: address.isDefault || false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Add user address error:', error);
      return { data: null, error };
    }
  }

  // Update user address
  static async updateUserAddress(addressId: string, updates: Partial<Address>) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .update({
          address_type: updates.addressType,
          street: updates.street,
          city: updates.city,
          comuna: updates.comuna,
          region: updates.region,
          postal_code: updates.postalCode,
          coordinates: updates.coordinates,
          is_default: updates.isDefault,
          updated_at: new Date().toISOString(),
        })
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update user address error:', error);
      return { data: null, error };
    }
  }

  // Delete user address
  static async deleteUserAddress(addressId: string) {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete user address error:', error);
      return { error };
    }
  }

  // Upload profile photo
  static async uploadProfilePhoto(userId: string, photoUri: string) {
    try {
      const fileExt = photoUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Convert URI to blob (React Native specific)
      const response = await fetch(photoUri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { data: { avatarUrl: publicUrl }, error: null };
    } catch (error) {
      console.error('Upload profile photo error:', error);
      return { data: null, error };
    }
  }

  // Get available services for providers
  static async getAvailableServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get available services error:', error);
      return { data: null, error };
    }
  }

  // Update provider verification documents
  static async uploadVerificationDocument(userId: string, documentType: string, fileUri: string) {
    try {
      const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `${userId}-${documentType}-${Date.now()}.${fileExt}`;
      const filePath = `verification-docs/${fileName}`;

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(filePath);

      // Update provider profile with document info
      const { data: currentProvider, error: fetchError } = await supabase
        .from('provider_profiles')
        .select('verification_documents')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentDocs = currentProvider.verification_documents || {};
      const updatedDocs = {
        ...(currentDocs || {}),
        [documentType]: {
          url: publicUrl,
          uploaded_at: new Date().toISOString(),
        },
      };

      const { error: updateError } = await supabase
        .from('provider_profiles')
        .update({ verification_documents: updatedDocs })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      return { data: { documentUrl: publicUrl }, error: null };
    } catch (error) {
      console.error('Upload verification document error:', error);
      return { data: null, error };
    }
  }
}