/**
 * RTK Query Auth API - Enterprise Pattern
 * Handles server state caching, invalidation, and background refetching
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../services/supabase';
import { enterpriseProfileService, ProfileData, ProviderProfileData } from '../../services/enterpriseProfileService';

// Types for API responses
interface AuthApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ProfileStatusResponse {
  success: boolean;
  profile_id: string;
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  profile_exists: boolean;
  user_type?: string;
  full_name?: string;
  is_active?: boolean;
  provider_profile?: any;
}

// RTK Query API slice for auth operations
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Profile', 'ProviderProfile', 'AuthStatus'],
  endpoints: (builder) => ({

    // Get current profile status
    getProfileStatus: builder.query<ProfileStatusResponse, void>({
      queryFn: async () => {
        try {
          const result = await enterpriseProfileService.getProfileStatus();
          return { data: result as ProfileStatusResponse };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error instanceof Error ? error.message : 'Failed to get profile status'
            }
          };
        }
      },
      providesTags: ['Profile', 'AuthStatus'],
      // Refetch every 5 minutes in background
      pollingInterval: 5 * 60 * 1000,
      // Keep data for 10 minutes
      keepUnusedDataFor: 10 * 60,
    }),

    // Get full profile data
    getFullProfile: builder.query<{
      profile: ProfileData;
      providerProfile?: ProviderProfileData;
    }, void>({
      queryFn: async () => {
        try {
          const result = await enterpriseProfileService.getFullProfile();

          if (!result.success || !result.data) {
            return {
              error: {
                status: 'FETCH_ERROR',
                error: result.error || 'Failed to get profile'
              }
            };
          }

          return {
            data: {
              profile: result.data,
              providerProfile: result.provider_data
            }
          };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error instanceof Error ? error.message : 'Failed to get full profile'
            }
          };
        }
      },
      providesTags: ['Profile', 'ProviderProfile'],
      // Keep profile data for 30 minutes
      keepUnusedDataFor: 30 * 60,
    }),

    // Create profile
    createProfile: builder.mutation<AuthApiResponse, {
      full_name: string;
      user_type: 'customer' | 'provider';
      phone_number?: string;
      rut?: string;
      business_name?: string;
      business_description?: string;
    }>({
      queryFn: async (params) => {
        try {
          const result = await enterpriseProfileService.createProfile({
            ...params,
            source: 'mobile'
          });

          return { data: result };
        } catch (error) {
          return {
            error: {
              status: 'MUTATION_ERROR',
              error: error instanceof Error ? error.message : 'Failed to create profile'
            }
          };
        }
      },
      invalidatesTags: ['Profile', 'ProviderProfile', 'AuthStatus'],
    }),

    // Update profile
    updateProfile: builder.mutation<AuthApiResponse<ProfileData>, Partial<ProfileData>>({
      queryFn: async (updates) => {
        try {
          const result = await enterpriseProfileService.updateProfile(updates);

          return { data: result };
        } catch (error) {
          return {
            error: {
              status: 'MUTATION_ERROR',
              error: error instanceof Error ? error.message : 'Failed to update profile'
            }
          };
        }
      },
      invalidatesTags: ['Profile', 'AuthStatus'],
      // Optimistic update
      async onQueryStarted(updates, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          authApi.util.updateQueryData('getFullProfile', undefined, (draft) => {
            if (draft.profile) {
              Object.assign(draft.profile, updates);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Update provider profile
    updateProviderProfile: builder.mutation<AuthApiResponse<ProviderProfileData>, Partial<ProviderProfileData>>({
      queryFn: async (updates) => {
        try {
          const result = await enterpriseProfileService.updateProviderProfile(updates);

          return { data: result };
        } catch (error) {
          return {
            error: {
              status: 'MUTATION_ERROR',
              error: error instanceof Error ? error.message : 'Failed to update provider profile'
            }
          };
        }
      },
      invalidatesTags: ['ProviderProfile', 'Profile'],
      // Optimistic update
      async onQueryStarted(updates, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          authApi.util.updateQueryData('getFullProfile', undefined, (draft) => {
            if (draft.providerProfile) {
              Object.assign(draft.providerProfile, updates);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Check email availability
    checkEmailAvailability: builder.query<{ available: boolean; reason?: string }, string>({
      queryFn: async (email) => {
        try {
          // Simple email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return {
              data: {
                available: false,
                reason: 'Invalid email format'
              }
            };
          }

          // Check if email exists in auth.users
          const { data, error } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email.toLowerCase())
            .single();

          if (error && error.code === 'PGRST116') {
            // No rows returned - email is available
            return {
              data: {
                available: true
              }
            };
          }

          if (data) {
            return {
              data: {
                available: false,
                reason: 'Email already registered'
              }
            };
          }

          return {
            data: {
              available: true
            }
          };

        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: 'Failed to check email availability'
            }
          };
        }
      },
      // Cache email checks for 1 minute
      keepUnusedDataFor: 60,
    }),

    // Get session info
    getSessionInfo: builder.query<{
      hasValidSession: boolean;
      expiresAt?: string;
      refreshToken?: string;
    }, void>({
      queryFn: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          return {
            data: {
              hasValidSession: !!session,
              expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
              refreshToken: session?.refresh_token ? 'present' : undefined
            }
          };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: 'Failed to get session info'
            }
          };
        }
      },
      providesTags: ['AuthStatus'],
      // Check session every 2 minutes
      pollingInterval: 2 * 60 * 1000,
    }),

  }),
});

// Export hooks for use in components
export const {
  useGetProfileStatusQuery,
  useGetFullProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useUpdateProviderProfileMutation,
  useCheckEmailAvailabilityQuery,
  useGetSessionInfoQuery,
} = authApi;

// Export API slice for store configuration
export default authApi;