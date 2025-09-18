/**
 * Enterprise Auth Hooks - Replace AuthContext Mess
 * Clean separation of server state vs client state
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  resendVerificationEmail,
  clearError,
  setOnboardingStep,
  markAsFirstTimeUser,
  setNeedsProfileSetup,
  selectAuth,
  selectIsAuthenticated,
  selectIsEmailVerified,
  selectProfileExists,
  selectIsProvider,
  selectAuthLoading,
  selectOnboardingStep,
  selectIsFirstTimeUser,
  selectNeedsProfileSetup,
  selectAuthMethod,
} from '../store/auth/authSlice';
import {
  useGetProfileStatusQuery,
  useGetFullProfileQuery,
  useGetSessionInfoQuery,
} from '../store/api/authApi';

/**
 * Main enterprise auth hook
 * Replaces the old AuthContext with Redux-based state
 */
export const useEnterpriseAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);

  // Auth actions
  const handleSignUp = useCallback(async (params: {
    email: string;
    password: string;
    fullName: string;
    userType: 'customer' | 'provider';
    phone?: string;
  }) => {
    return dispatch(signUp(params)).unwrap();
  }, [dispatch]);

  const handleSignIn = useCallback(async (params: {
    email: string;
    password: string;
  }) => {
    return dispatch(signIn(params)).unwrap();
  }, [dispatch]);

  const handleSignOut = useCallback(async () => {
    return dispatch(signOut()).unwrap();
  }, [dispatch]);

  const handleResetPassword = useCallback(async (email: string) => {
    return dispatch(resetPassword(email)).unwrap();
  }, [dispatch]);

  const handleResendVerification = useCallback(async (email: string) => {
    return dispatch(resendVerificationEmail(email)).unwrap();
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Onboarding flow management (Instagram/Meta pattern)
  const handleSetOnboardingStep = useCallback((step: 'signup' | 'verification' | 'profile' | 'discovery' | 'complete' | null) => {
    dispatch(setOnboardingStep(step));
  }, [dispatch]);

  const handleMarkFirstTimeUser = useCallback((isFirstTime: boolean) => {
    dispatch(markAsFirstTimeUser(isFirstTime));
  }, [dispatch]);

  const handleSetNeedsProfileSetup = useCallback((needs: boolean) => {
    dispatch(setNeedsProfileSetup(needs));
  }, [dispatch]);

  return {
    // State
    user: auth.user,
    session: auth.session,
    isLoading: auth.isLoading,
    isInitialized: auth.isInitialized,
    error: auth.error,

    // Computed state
    isAuthenticated: !!auth.session && !!auth.user,
    isEmailVerified: auth.isEmailVerified,
    profileExists: auth.profileExists,
    isProvider: auth.isProvider,
    emailVerificationSent: auth.emailVerificationSent,

    // Enterprise features
    authMethod: auth.authMethod,
    sessionRefreshCount: auth.sessionRefreshCount,
    lastActiveAt: auth.lastActiveAt,
    profileLoading: auth.profileLoading,

    // Onboarding flow state (Instagram/Meta pattern)
    onboardingStep: auth.onboardingStep,
    isFirstTimeUser: auth.isFirstTimeUser,
    needsProfileSetup: auth.needsProfileSetup,

    // Actions
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    resendVerification: handleResendVerification,
    clearError: handleClearError,

    // Onboarding flow actions (Instagram/Meta pattern)
    setOnboardingStep: handleSetOnboardingStep,
    markFirstTimeUser: handleMarkFirstTimeUser,
    setNeedsProfileSetup: handleSetNeedsProfileSetup,
  };
};

/**
 * Auth status hook with server state caching
 * Separates server state (profile data) from client state (UI state)
 */
export const useAuthStatus = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isEmailVerified = useAppSelector(selectIsEmailVerified);
  const profileExists = useAppSelector(selectProfileExists);
  const isProvider = useAppSelector(selectIsProvider);
  const isLoading = useAppSelector(selectAuthLoading);

  // Server state via RTK Query (cached, auto-refetched)
  const {
    data: profileStatus,
    isLoading: profileStatusLoading,
    error: profileStatusError,
    refetch: refetchProfileStatus,
  } = useGetProfileStatusQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: sessionInfo,
    isLoading: sessionInfoLoading,
  } = useGetSessionInfoQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 2 * 60 * 1000, // 2 minutes
  });

  return {
    // Client state (UI state)
    isAuthenticated,
    isEmailVerified,
    profileExists,
    isProvider,
    isLoading: isLoading || profileStatusLoading || sessionInfoLoading,

    // Server state (cached)
    profileStatus,
    sessionInfo,

    // Error handling
    error: profileStatusError,

    // Actions
    refetchProfileStatus,

    // Computed state
    needsEmailVerification: isAuthenticated && !isEmailVerified,
    needsProfileCreation: isAuthenticated && isEmailVerified && !profileExists,
    isReady: isAuthenticated && isEmailVerified && profileExists,
  };
};

/**
 * Profile data hook with RTK Query caching
 * Server state management for profile data
 */
export const useProfileData = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const profileExists = useAppSelector(selectProfileExists);

  const {
    data: profileData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetFullProfileQuery(undefined, {
    skip: !isAuthenticated || !profileExists,
    // Keep profile data fresh
    refetchOnMountOrArgChange: true,
    // Background refetch every 30 minutes
    pollingInterval: 30 * 60 * 1000,
  });

  return {
    profile: profileData?.profile,
    providerProfile: profileData?.providerProfile,
    isLoading,
    isFetching,
    error,
    refetch,

    // Computed state
    hasProfile: !!profileData?.profile,
    hasProviderProfile: !!profileData?.providerProfile,
    isProvider: !!profileData?.providerProfile,
  };
};

/**
 * Simplified auth hook for components that just need basic auth state
 * Instagram/Meta enterprise pattern with onboarding flow
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isEmailVerified,
    isLoading,
    onboardingStep,
    isFirstTimeUser,
    needsProfileSetup,
    authMethod
  } = useEnterpriseAuth();
  const { isReady, needsEmailVerification, needsProfileCreation } = useAuthStatus();

  return {
    user,
    isAuthenticated,
    isEmailVerified,
    isLoading,
    isReady,
    needsEmailVerification,
    needsProfileCreation,

    // Onboarding flow state (Instagram/Meta pattern)
    onboardingStep,
    isFirstTimeUser,
    needsProfileSetup,
    authMethod,

    // Simple computed states for common use cases
    canAccessApp: isReady && !isFirstTimeUser,
    shouldShowEmailVerification: needsEmailVerification || onboardingStep === 'verification',
    shouldShowProfileCreation: needsProfileCreation || onboardingStep === 'profile',
    shouldShowServiceDiscovery: onboardingStep === 'discovery',
    isOnboardingComplete: onboardingStep === 'complete',
  };
};

/**
 * Auth actions hook for forms and auth screens
 */
export const useAuthActions = () => {
  const {
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerification,
    clearError,
  } = useEnterpriseAuth();

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerification,
    clearError,
  };
};

/**
 * Session management hook
 */
export const useSession = () => {
  const { session, sessionRefreshCount, lastActiveAt } = useEnterpriseAuth();
  const { sessionInfo } = useAuthStatus();

  return {
    session,
    sessionRefreshCount,
    lastActiveAt,
    sessionInfo,

    // Computed state
    hasValidSession: !!session && !!sessionInfo?.hasValidSession,
    sessionExpiresAt: sessionInfo?.expiresAt,
    hasRefreshToken: !!sessionInfo?.refreshToken,
  };
};