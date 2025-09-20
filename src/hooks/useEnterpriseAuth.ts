/**
 * PHASE 2: Single Enterprise Auth Hook (Meta/Instagram Pattern)
 * Replaces all complex auth hooks with one minimal, reliable hook
 * Features device-agnostic verification polling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { User, Session } from '@supabase/supabase-js';

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
}

type AuthStatus = 'unauthenticated' | 'authenticated_pending_profile' | 'authenticated_ready';

interface UseEnterpriseAuthResult extends EnterpriseAuthState {
  // Computed properties
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  needsOnboarding: boolean;
  isProvider: boolean;

  // Actions
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  startVerificationPolling: () => void;
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
   * Meta/Instagram pattern: Check verification status periodically
   */
  const pollVerificationStatus = useCallback(async () => {
    try {
      console.log(`🔄 Enterprise: Polling verification (attempt ${pollingAttemptRef.current + 1})`);

      const { data: { user: currentUser }, error } = await supabase.auth.getUser();

      if (error || !currentUser) {
        console.log('❌ Enterprise: No user during polling, stopping');
        stopVerificationPolling();
        return;
      }

      // Check if email is now verified
      if (currentUser.email_confirmed_at) {
        console.log('✅ Enterprise: Email verification detected!');
        stopVerificationPolling();

        // Refresh full auth state
        await refreshAuth();
        return;
      }

      // Continue polling with exponential backoff
      pollingAttemptRef.current += 1;

      if (pollingAttemptRef.current >= POLLING_CONFIG.maxAttempts) {
        console.log('⏰ Enterprise: Polling timeout reached');
        stopVerificationPolling();
        return;
      }

      // Increase polling interval (exponential backoff)
      pollingIntervalRef.current = Math.min(
        pollingIntervalRef.current * POLLING_CONFIG.backoffMultiplier,
        POLLING_CONFIG.maxInterval
      );

      // Schedule next poll
      pollingRef.current = setTimeout(pollVerificationStatus, pollingIntervalRef.current);

    } catch (error) {
      console.error('❌ Enterprise: Polling error:', error);
      stopVerificationPolling();
    }
  }, [refreshAuth]);

  /**
   * ENTERPRISE: Start verification polling
   * Use after user submits signup form
   */
  const startVerificationPolling = useCallback(() => {
    console.log('🚀 Enterprise: Starting verification polling');

    // Reset polling state
    pollingAttemptRef.current = 0;
    pollingIntervalRef.current = POLLING_CONFIG.initialInterval;

    // Clear any existing polling
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
    }

    // Start polling
    pollingRef.current = setTimeout(pollVerificationStatus, POLLING_CONFIG.initialInterval);
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
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      stopVerificationPolling();
    };
  }, [refreshAuth, stopVerificationPolling]);

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

  return {
    // Core state
    ...state,

    // Computed properties
    authStatus,
    isAuthenticated,
    isEmailVerified,
    needsOnboarding,
    isProvider,

    // Actions
    refreshAuth,
    signOut,
    startVerificationPolling,
    stopVerificationPolling,
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
  return {
    signIn: async (email: string, password: string) => {
      try {
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
    },
    signUp: async (userData: any) => {
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
    },
    clearError: () => {
      // Error clearing handled by main hook
      enterpriseAuth.refreshAuth();
    },
    resendVerificationEmail: async (email: string) => {
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
    },
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

// Profile data access
export function useProfileData() {
  const enterpriseAuth = useEnterpriseAuth();
  return {
    profile: enterpriseAuth.profile,
    isLoading: enterpriseAuth.isLoading,
    error: enterpriseAuth.error,
    refreshProfile: enterpriseAuth.refreshAuth,
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