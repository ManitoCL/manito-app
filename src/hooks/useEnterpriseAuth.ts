/**
 * PHASE 2: Single Enterprise Auth Hook (Meta/Instagram Pattern)
 * Replaces all complex auth hooks with one minimal, reliable hook
 * Features device-agnostic verification polling + client-side profile completion
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { User, Session } from '@supabase/supabase-js';
import {
  calculateProfileCompletion,
  getProfileCompletionStatus,
  getMissingProfileFields,
  meetsMinimumCompletion,
  getNextRecommendedAction
} from '../utils/profileCompletion';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: 'customer' | 'provider' | 'admin';
  is_verified: boolean;
  email_verified_at: string | null;
  onboarding_completed: boolean;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

interface EnterpriseAuthState {
  // Core state (≤5 properties as per enterprise standards)
  isLoading: boolean;
  hasSession: boolean;
  user: User | null;
  profile: Profile | null;
  error: string | null;
  // Verification status for device-agnostic flow
  verificationDetected?: boolean;
}

type AuthStatus = 'unauthenticated' | 'authenticated_pending_profile' | 'authenticated_ready';

interface UseEnterpriseAuthResult extends EnterpriseAuthState {
  // Computed properties
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  needsOnboarding: boolean;
  isProvider: boolean;

  // Profile completion properties (client-side calculation)
  profileCompletionPercentage: number;
  profileCompletionStatus: {
    status: 'excellent' | 'good' | 'moderate' | 'incomplete';
    message: string;
    color: string;
    description: string;
  };
  isProfileComplete: boolean;
  missingProfileFields: string[];
  nextRecommendedAction: {
    action: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  };

  // Actions
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  startVerificationPolling: (email: string) => void;
  stopVerificationPolling: () => void;
}

/**
 * ENTERPRISE: Exponential backoff polling configuration
 * Meta/Instagram pattern: Gentle, efficient polling
 */
const POLLING_CONFIG = {
  initialInterval: 2000,   // Start with 2 seconds
  maxInterval: 30000,      // Max 30 seconds
  maxAttempts: 20,         // Poll for ~10 minutes total
  backoffMultiplier: 1.3,  // Gentle exponential increase
};

/**
 * Single Enterprise Auth Hook
 * Replaces: useAuth, useAuthStatus, useAuthActions, useProfileData, usePhase1Auth
 */
export function useEnterpriseAuth(): UseEnterpriseAuthResult {
  // ENTERPRISE: Minimal state (≤5 properties)
  const [state, setState] = useState<EnterpriseAuthState>({
    isLoading: true,
    hasSession: false,
    user: null,
    profile: null,
    error: null,
    verificationDetected: false,
  });

  // Polling state
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptRef = useRef(0);
  const pollingIntervalRef = useRef(POLLING_CONFIG.initialInterval);

  /**
   * ENTERPRISE: Fetch profile once when session appears
   * Database auto-provisioning ensures profile always exists
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Enterprise: Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Enterprise: Profile fetch failed:', error.message);
        return null;
      }

      console.log('✅ Enterprise: Profile fetched successfully');
      return data as Profile;
    } catch (error) {
      console.error('❌ Enterprise: Profile fetch exception:', error);
      return null;
    }
  }, []);

  /**
   * ENTERPRISE: Refresh auth state
   * Meta/Instagram pattern: Simple session + profile check
   */
  const refreshAuth = useCallback(async () => {
    try {
      console.log('🔄 Enterprise: Refreshing auth state...');

      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Enterprise: Session error:', sessionError.message);
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasSession: false,
          user: null,
          profile: null,
          error: sessionError.message,
        }));
        return;
      }

      const session = sessionData.session;
      const user = session?.user || null;

      if (!session || !user) {
        console.log('📱 Enterprise: No active session');
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasSession: false,
          user: null,
          profile: null,
          error: null,
        }));
        return;
      }

      console.log('✅ Enterprise: Active session found');

      // Fetch profile (auto-provisioned by database triggers)
      const profile = await fetchProfile(user.id);

      setState(prev => ({
        ...prev,
        isLoading: false,
        hasSession: true,
        user,
        profile,
        error: null,
      }));

      console.log('✅ Enterprise: Auth state refreshed successfully');

    } catch (error) {
      console.error('❌ Enterprise: Auth refresh failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Auth refresh failed',
      }));
    }
  }, [fetchProfile]);

  /**
   * ENTERPRISE: Device-agnostic verification polling
   * SECURE APPROACH: Check auth.users table via database function
   * Uses SECURITY DEFINER function to access Supabase auth schema
   */
  const checkVerificationStatus = useCallback(async (email: string) => {
    try {
      if (!email || typeof email !== 'string') {
        console.error('❌ Enterprise: Invalid email provided for verification check');
        return { verified: false, error: 'Invalid email provided' };
      }

      console.log('🔍 Enterprise: Checking verification status for:', email);

      // CRITICAL FIX: Use database function to check auth.users table
      // This is where email_confirmed_at actually gets set by Supabase Auth
      const { data: verificationData, error: verificationError } = await supabase
        .rpc('check_email_verification_status', { email_param: email.toLowerCase().trim() });

      if (verificationError) {
        console.error('❌ Enterprise: Auth verification query error:', verificationError);
        return { verified: false, error: verificationError.message };
      }

      if (!verificationData || verificationData.length === 0) {
        console.log('❌ Enterprise: No verification data returned');
        return { verified: false, error: 'No verification data' };
      }

      const result = verificationData[0];
      console.log('🔍 Enterprise: Verification result:', result);

      // Debug: Get detailed info about user in both tables
      const { data: debugData, error: debugError } = await supabase
        .rpc('debug_auth_user_info', { email_param: email.toLowerCase().trim() });

      if (!debugError && debugData) {
        console.log('🐛 Enterprise: Debug info:', debugData);
      }

      if (result.is_verified) {
        console.log('✅ Enterprise: Email verification detected in auth.users!', {
          email_confirmed_at: result.email_confirmed_at,
          user_id: result.user_id
        });
        return { verified: true, needsSignIn: true };
      }

      console.log('📧 Enterprise: Email still not verified in auth.users');
      return { verified: false, needsVerification: true };

    } catch (error) {
      console.error('❌ Enterprise: Verification check failed:', error);

      // Fallback: Try sign-in attempt method
      console.log('🔄 Enterprise: Falling back to sign-in attempt method...');
      try {
        // This approach tests if email is verified by attempting sign-in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password: 'test-verification-only', // This will fail if not verified
        });

        if (signInError) {
          if (signInError.message?.includes('Email not confirmed')) {
            console.log('📧 Enterprise: Fallback confirms email not verified');
            return { verified: false, needsVerification: true };
          } else if (signInError.message?.includes('Invalid login credentials')) {
            // This means email is verified but password is wrong - which is what we expect
            console.log('✅ Enterprise: Fallback detected email is verified (wrong password expected)');
            return { verified: true, needsSignIn: true };
          }
        }

        // If sign-in actually succeeds, user is verified
        if (signInData.user && signInData.user.email_confirmed_at) {
          console.log('✅ Enterprise: Fallback confirmed verification via successful sign-in');
          // Sign out immediately since this was just a test
          await supabase.auth.signOut();
          return { verified: true, needsSignIn: true };
        }

        return { verified: false, needsVerification: true };

      } catch (fallbackError) {
        console.error('❌ Enterprise: Fallback verification also failed:', fallbackError);
        return { verified: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  }, []);

  /**
   * ENTERPRISE: Device-agnostic verification polling
   * Meta/Instagram pattern: Check verification status periodically
   */
  const pollVerificationStatus = useCallback(async (email: string) => {
    try {
      console.log(`🔄 Enterprise: Polling verification (attempt ${pollingAttemptRef.current + 1})`);

      const verificationResult = await checkVerificationStatus(email);

      if (verificationResult.verified) {
        console.log('✅ Enterprise: Email verification detected!');
        stopVerificationPolling();

        // Update state to trigger UI reaction
        setState(prev => ({
          ...prev,
          verificationDetected: true,
        }));

        return;
      }

      if (verificationResult.error && !verificationResult.needsVerification) {
        console.error('❌ Enterprise: Verification polling failed:', verificationResult.error);
        stopVerificationPolling();
        return { verified: false, error: verificationResult.error };
      }

      // Continue polling with exponential backoff
      pollingAttemptRef.current += 1;

      if (pollingAttemptRef.current >= POLLING_CONFIG.maxAttempts) {
        console.log('⏰ Enterprise: Polling timeout reached');
        stopVerificationPolling();
        return { verified: false, timeout: true };
      }

      // Increase polling interval (exponential backoff)
      pollingIntervalRef.current = Math.min(
        pollingIntervalRef.current * POLLING_CONFIG.backoffMultiplier,
        POLLING_CONFIG.maxInterval
      );

      // Schedule next poll
      pollingRef.current = setTimeout(() => pollVerificationStatus(email), pollingIntervalRef.current);

      return { verified: false, polling: true };

    } catch (error) {
      console.error('❌ Enterprise: Polling error:', error);
      stopVerificationPolling();
      return { verified: false, error: error instanceof Error ? error.message : 'Polling failed' };
    }
  }, [checkVerificationStatus]);

  /**
   * ENTERPRISE: Start verification polling
   * Use after user submits signup form
   */
  const startVerificationPolling = useCallback((email: string) => {
    console.log('🚀 Enterprise: Starting verification polling for:', email);

    // Reset polling state
    pollingAttemptRef.current = 0;
    pollingIntervalRef.current = POLLING_CONFIG.initialInterval;

    // Clear any existing polling
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
    }

    // Start polling
    pollingRef.current = setTimeout(() => pollVerificationStatus(email), POLLING_CONFIG.initialInterval);
  }, [pollVerificationStatus]);

  /**
   * ENTERPRISE: Stop verification polling
   */
  const stopVerificationPolling = useCallback(() => {
    console.log('🛑 Enterprise: Stopping verification polling');

    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }

    pollingAttemptRef.current = 0;
    pollingIntervalRef.current = POLLING_CONFIG.initialInterval;
  }, []);

  /**
   * ENTERPRISE: Sign out
   * Meta/Instagram pattern: Clear everything
   */
  const signOut = useCallback(async () => {
    try {
      console.log('🚪 Enterprise: Signing out...');

      // Stop any active polling
      stopVerificationPolling();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Enterprise: Sign out error:', error.message);
        setState(prev => ({ ...prev, error: error.message }));
        return;
      }

      // Clear state
      setState({
        isLoading: false,
        hasSession: false,
        user: null,
        profile: null,
        error: null,
      });

      console.log('✅ Enterprise: Signed out successfully');

    } catch (error) {
      console.error('❌ Enterprise: Sign out exception:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
    }
  }, [stopVerificationPolling]);

  // ENTERPRISE: Initialize auth state on mount
  useEffect(() => {
    console.log('🚀 Enterprise: Initializing auth...');
    refreshAuth();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Enterprise: Auth state changed:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshAuth();
        } else if (event === 'SIGNED_OUT') {
          stopVerificationPolling();
          setState({
            isLoading: false,
            hasSession: false,
            user: null,
            profile: null,
            error: null,
            verificationDetected: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      stopVerificationPolling();
    };
  }, []); // FIXED: Empty dependency array - this should only run once on mount

  // ENTERPRISE: Computed properties (no redundant state)
  const authStatus: AuthStatus = !state.hasSession
    ? 'unauthenticated'
    : !state.profile
    ? 'authenticated_pending_profile'
    : 'authenticated_ready';

  const isAuthenticated = state.hasSession && !!state.user;
  const isEmailVerified = !!state.user?.email_confirmed_at;
  const needsOnboarding = state.profile ? !state.profile.onboarding_completed : false;
  const isProvider = state.profile?.user_type === 'provider';

  // ENTERPRISE: Client-side profile completion calculation (replaces database triggers)
  const profileCompletionPercentage = useMemo(() => {
    if (!state.profile) return 0;

    // Convert Profile interface to format expected by calculateProfileCompletion
    const profileData = {
      full_name: state.profile.full_name,
      email_verified_at: state.profile.email_verified_at,
      phone_verified_at: null, // Will be updated when phone verification is implemented
      avatar_url: null, // Will be updated when avatar upload is implemented
      rut_verified: false, // Will be updated when RUT verification is implemented
      date_of_birth: null, // Will be updated when date of birth is collected
      whatsapp_number: null, // Will be updated when WhatsApp is collected
      user_type: state.profile.user_type,
    };

    // For now, we don't have address or provider profile data in this hook
    // This will be enhanced when those features are implemented
    return calculateProfileCompletion(profileData, null, null);
  }, [state.profile]);

  const profileCompletionStatus = useMemo(() => {
    return getProfileCompletionStatus(profileCompletionPercentage);
  }, [profileCompletionPercentage]);

  const isProfileComplete = useMemo(() => {
    return meetsMinimumCompletion(profileCompletionPercentage);
  }, [profileCompletionPercentage]);

  const missingProfileFields = useMemo(() => {
    if (!state.profile) return [];

    const profileData = {
      full_name: state.profile.full_name,
      email_verified_at: state.profile.email_verified_at,
      phone_verified_at: null,
      avatar_url: null,
      rut_verified: false,
      date_of_birth: null,
      whatsapp_number: null,
      user_type: state.profile.user_type,
    };

    return getMissingProfileFields(profileData, null, null);
  }, [state.profile]);

  const nextRecommendedAction = useMemo(() => {
    if (!state.profile) {
      return {
        action: 'Completar perfil',
        description: 'Completa tu información básica para comenzar',
        priority: 'high' as const
      };
    }

    const profileData = {
      full_name: state.profile.full_name,
      email_verified_at: state.profile.email_verified_at,
      phone_verified_at: null,
      avatar_url: null,
      rut_verified: false,
      date_of_birth: null,
      whatsapp_number: null,
      user_type: state.profile.user_type,
    };

    return getNextRecommendedAction(profileData, null, null);
  }, [state.profile]);

  return {
    // Core state
    ...state,

    // Computed properties
    authStatus,
    isAuthenticated,
    isEmailVerified,
    needsOnboarding,
    isProvider,

    // Profile completion properties (client-side calculation)
    profileCompletionPercentage,
    profileCompletionStatus,
    isProfileComplete,
    missingProfileFields,
    nextRecommendedAction,

    // Actions
    refreshAuth,
    signOut,
    startVerificationPolling,
    stopVerificationPolling,

    // Debug functions
    debugUserCreation: async (email: string) => {
      try {
        const { data, error } = await supabase
          .rpc('debug_user_creation_status', { email_param: email });

        if (error) {
          console.error('❌ Debug user creation failed:', error);
          return { error: error.message };
        }

        console.log('🐛 Debug user creation result:', data);
        return { data };
      } catch (error) {
        console.error('❌ Debug user creation exception:', error);
        return { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    debugTokenTracking: async (email: string) => {
      try {
        const { data, error } = await supabase
          .rpc('debug_token_tracking', { email_param: email });

        if (error) {
          console.error('❌ Debug token tracking failed:', error);
          return { error: error.message };
        }

        console.log('🐛 Debug token tracking result:', data);
        return { data };
      } catch (error) {
        console.error('❌ Debug token tracking exception:', error);
        return { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
  };
}

/**
 * BACKWARD COMPATIBILITY HOOKS
 * These maintain compatibility with existing screens while transitioning to useEnterpriseAuth
 */

// Simple auth hook for basic components
export function useAuth() {
  const enterpriseAuth = useEnterpriseAuth();
  return {
    user: enterpriseAuth.user,
    isAuthenticated: enterpriseAuth.isAuthenticated,
    isReady: !enterpriseAuth.isLoading,
    signOut: enterpriseAuth.signOut,
    refreshUser: enterpriseAuth.refreshAuth,
  };
}

// Auth actions for forms and interactions
export function useAuthActions() {
  const enterpriseAuth = useEnterpriseAuth();

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      if (!email || typeof email !== 'string') {
        throw new Error('Email is required and must be a valid string');
      }
      if (!password || typeof password !== 'string') {
        throw new Error('Password is required and must be a valid string');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  }, []);

  const signUp = useCallback(async (userData: any) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/enterprise-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Signup failed');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  }, []);

  const clearError = useCallback(() => {
    // FIXED: Don't call refreshAuth() - this causes infinite loops
    // Error clearing should be handled differently
    console.log('🔄 Clear error called - avoiding infinite loop');
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/enterprise-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, resend: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Resend failed');
      return { success: true };
    } catch (error) {
      console.error('❌ Resend failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Resend failed' };
    }
  }, []);

  return {
    signIn,
    signUp,
    clearError,
    resendVerificationEmail,
  };
}

// Auth status for server state checks
export function useAuthStatus() {
  const enterpriseAuth = useEnterpriseAuth();
  return {
    isReady: !enterpriseAuth.isLoading && enterpriseAuth.hasSession,
    authStatus: enterpriseAuth.authStatus,
    isLoading: enterpriseAuth.isLoading,
    error: enterpriseAuth.error,
  };
}

// Profile data access with completion information
export function useProfileData() {
  const enterpriseAuth = useEnterpriseAuth();
  return {
    profile: enterpriseAuth.profile,
    isLoading: enterpriseAuth.isLoading,
    error: enterpriseAuth.error,
    refreshProfile: enterpriseAuth.refreshAuth,

    // Profile completion data (client-side calculation)
    profileCompletionPercentage: enterpriseAuth.profileCompletionPercentage,
    profileCompletionStatus: enterpriseAuth.profileCompletionStatus,
    isProfileComplete: enterpriseAuth.isProfileComplete,
    missingProfileFields: enterpriseAuth.missingProfileFields,
    nextRecommendedAction: enterpriseAuth.nextRecommendedAction,
  };
}

/**
 * ENTERPRISE BENEFITS:
 * ✅ Single hook replaces 5+ auth hooks
 * ✅ ≤5 core state properties (enterprise standard)
 * ✅ Device-agnostic verification polling
 * ✅ No deep link dependencies
 * ✅ Auto-profile loading via database triggers
 * ✅ Meta/Instagram enterprise patterns
 * ✅ Exponential backoff polling (gentle on servers)
 * ✅ Proper cleanup and error handling
 * ✅ Backward compatibility with existing screens
 */