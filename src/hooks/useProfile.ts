// Enterprise Profile Management Hook
// Provides clean separation between auth state and profile state
import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../store';
import {
  getProfileStatus,
  createProfile,
  updateProfile,
  ensureProfileExists,
  retryProfileCreation,
  ProfileStatus,
  ProfileCreationResult,
  ProfileUpdateData,
  ProfileUpdateResult,
} from '../services/profileService';

export interface ProfileState {
  // Loading states
  isLoading: boolean;
  isCreatingProfile: boolean;
  isUpdatingProfile: boolean;
  isCheckingStatus: boolean;

  // Profile data
  profileStatus: ProfileStatus | null;
  profileExists: boolean;
  needsProfileCreation: boolean;
  canCreateProfile: boolean;

  // User info
  userId?: string;
  email?: string;
  emailVerified: boolean;
  userType?: 'customer' | 'provider';
  fullName?: string;
  phoneNumber?: string;
  phoneVerified: boolean;

  // Provider info
  isProvider: boolean;
  providerProfile?: ProfileStatus['provider_profile'];
  needsProviderSetup: boolean;

  // Error handling
  error: string | null;
  lastError: string | null;
  retryCount: number;
}

export interface ProfileActions {
  // Core actions
  refreshProfileStatus: () => Promise<void>;
  createUserProfile: (userMetadata?: any) => Promise<ProfileCreationResult>;
  updateUserProfile: (updates: ProfileUpdateData) => Promise<ProfileUpdateResult>;
  ensureProfile: (userMetadata?: any) => Promise<boolean>;

  // Retry actions
  retryProfileCreation: (userMetadata?: any) => Promise<ProfileCreationResult>;
  clearError: () => void;
  resetRetryCount: () => void;
}

export interface UseProfileReturn extends ProfileState, ProfileActions {}

export function useProfile(): UseProfileReturn {
  const { user, session, isEmailVerified } = useAppSelector(state => state.auth);

  const [state, setState] = useState<ProfileState>({
    isLoading: false,
    isCreatingProfile: false,
    isUpdatingProfile: false,
    isCheckingStatus: false,
    profileStatus: null,
    profileExists: false,
    needsProfileCreation: false,
    canCreateProfile: false,
    emailVerified: false,
    isProvider: false,
    needsProviderSetup: false,
    error: null,
    lastError: null,
    retryCount: 0,
    phoneVerified: false,
  });

  // Update state based on auth changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      userId: user?.id,
      email: user?.email,
      emailVerified: isEmailVerified,
      userType: user?.userType,
      fullName: user?.fullName,
      phoneNumber: user?.phoneNumber,
    }));
  }, [user, isEmailVerified]);

  // Refresh profile status
  const refreshProfileStatus = useCallback(async () => {
    if (!user || !session) {
      setState(prev => ({
        ...prev,
        profileStatus: null,
        profileExists: false,
        needsProfileCreation: false,
        canCreateProfile: false,
        isProvider: false,
        needsProviderSetup: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isCheckingStatus: true, error: null }));

    try {
      const status = await getProfileStatus();

      if (status.success) {
        setState(prev => ({
          ...prev,
          profileStatus: status,
          profileExists: status.profile_exists || false,
          needsProfileCreation: status.needs_profile_creation || false,
          canCreateProfile: status.can_create_profile || false,
          userType: status.user_type,
          fullName: status.full_name,
          phoneNumber: status.phone_number,
          phoneVerified: status.phone_verified || false,
          isProvider: status.user_type === 'provider',
          providerProfile: status.provider_profile,
          needsProviderSetup: status.requires_provider_setup || false,
          isCheckingStatus: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: status.message || 'Failed to check profile status',
          lastError: status.message || 'Failed to check profile status',
          isCheckingStatus: false,
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        lastError: errorMessage,
        isCheckingStatus: false,
      }));
    }
  }, [user, session]);

  // Create user profile
  const createUserProfile = useCallback(async (userMetadata?: any): Promise<ProfileCreationResult> => {
    setState(prev => ({ ...prev, isCreatingProfile: true, error: null }));

    try {
      const result = await createProfile(userMetadata);

      if (result.success) {
        // Refresh profile status after successful creation
        await refreshProfileStatus();
      } else {
        setState(prev => ({
          ...prev,
          error: result.message || 'Failed to create profile',
          lastError: result.message || 'Failed to create profile',
        }));
      }

      setState(prev => ({ ...prev, isCreatingProfile: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        lastError: errorMessage,
        isCreatingProfile: false,
      }));

      return {
        success: false,
        error: 'SERVICE_ERROR',
        message: errorMessage,
        retry_recommended: true,
      };
    }
  }, [refreshProfileStatus]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: ProfileUpdateData): Promise<ProfileUpdateResult> => {
    setState(prev => ({ ...prev, isUpdatingProfile: true, error: null }));

    try {
      const result = await updateProfile(updates);

      if (result.success) {
        // Refresh profile status after successful update
        await refreshProfileStatus();
      } else {
        setState(prev => ({
          ...prev,
          error: result.message || 'Failed to update profile',
          lastError: result.message || 'Failed to update profile',
        }));
      }

      setState(prev => ({ ...prev, isUpdatingProfile: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        lastError: errorMessage,
        isUpdatingProfile: false,
      }));

      return {
        success: false,
        error: 'SERVICE_ERROR',
        message: errorMessage,
      };
    }
  }, [refreshProfileStatus]);

  // Ensure profile exists with retry logic
  const ensureProfile = useCallback(async (userMetadata?: any): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await ensureProfileExists(userMetadata);

      if (result.success && result.profileExists) {
        // Refresh profile status to get latest data
        await refreshProfileStatus();
        setState(prev => ({ ...prev, isLoading: false, retryCount: 0 }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.message || 'Failed to ensure profile exists',
          lastError: result.message || 'Failed to ensure profile exists',
          isLoading: false,
          retryCount: prev.retryCount + 1,
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        lastError: errorMessage,
        isLoading: false,
        retryCount: prev.retryCount + 1,
      }));
      return false;
    }
  }, [refreshProfileStatus]);

  // Retry profile creation with backoff
  const retryProfileCreationAction = useCallback(async (userMetadata?: any): Promise<ProfileCreationResult> => {
    setState(prev => ({ ...prev, isCreatingProfile: true, error: null }));

    try {
      const result = await retryProfileCreation(userMetadata);

      if (result.success) {
        await refreshProfileStatus();
        setState(prev => ({ ...prev, retryCount: 0 }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.message || 'Failed to create profile after retries',
          lastError: result.message || 'Failed to create profile after retries',
          retryCount: prev.retryCount + 1,
        }));
      }

      setState(prev => ({ ...prev, isCreatingProfile: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        lastError: errorMessage,
        isCreatingProfile: false,
        retryCount: prev.retryCount + 1,
      }));

      return {
        success: false,
        error: 'SERVICE_ERROR',
        message: errorMessage,
        retry_recommended: false,
      };
    }
  }, [refreshProfileStatus]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Reset retry count
  const resetRetryCount = useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0 }));
  }, []);

  // Auto-refresh profile status when user changes
  useEffect(() => {
    if (user && session && isEmailVerified) {
      refreshProfileStatus();
    }
  }, [user, session, isEmailVerified, refreshProfileStatus]);

  return {
    ...state,
    refreshProfileStatus,
    createUserProfile,
    updateUserProfile,
    ensureProfile,
    retryProfileCreation: retryProfileCreationAction,
    clearError,
    resetRetryCount,
  };
}