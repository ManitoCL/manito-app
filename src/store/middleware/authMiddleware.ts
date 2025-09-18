/**
 * Enterprise Auth Middleware - Instagram/Meta Pattern
 * Handles all auth side effects in Redux middleware instead of components
 */

import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../index';
import { supabase, onAuthStateChange } from '../../services/supabase';
import { enterpriseProfileService } from '../../services/enterpriseProfileService';
import {
  // Auth actions
  initializeAuth,
  setAuthState,
  setLoading,
  clearError,
  authStateChanged,
  signUp,
  signIn,
  signOut,
  resetPassword,
  refreshSession,
  // New enterprise actions
  profileCreationStarted,
  profileCreationCompleted,
  profileCreationFailed,
} from '../auth/authSlice';
import * as Linking from 'expo-linking';
import { AppState } from 'react-native';

// Types
interface AuthMiddlewareState {
  authSubscription: any;
  linkingSubscription: any;
  appStateSubscription: any;
  isInitialized: boolean;
}

// Middleware state
let middlewareState: AuthMiddlewareState = {
  authSubscription: null,
  linkingSubscription: null,
  appStateSubscription: null,
  isInitialized: false,
};

// Transform Supabase user to our User type
const transformUser = (supabaseUser: any) => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  fullName: supabaseUser.user_metadata?.full_name || '',
  phoneNumber: supabaseUser.user_metadata?.phone,
  userType: supabaseUser.user_metadata?.user_type || 'customer',
  isEmailVerified: !!supabaseUser.email_confirmed_at,
  createdAt: supabaseUser.created_at,
  updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
});

/**
 * Enterprise Auth Middleware
 * Handles all auth-related side effects centrally
 */
export const authMiddleware: Middleware<{}, RootState, AppDispatch> =
  (store: MiddlewareAPI<AppDispatch, RootState>) =>
  (next: Dispatch<AnyAction>) =>
  async (action: AnyAction) => {

    const result = next(action);
    const { auth } = store.getState();

    // Handle auth initialization
    if (initializeAuth.fulfilled.match(action)) {
      if (!middlewareState.isInitialized) {
        console.log('🚀 Enterprise Auth Middleware: Initializing listeners...');
        await initializeAuthListeners(store);
        middlewareState.isInitialized = true;
      }
    }

    // Handle auth state changes
    if (authStateChanged.match(action)) {
      const { session, user, event } = action.payload;
      await handleAuthStateChange(store, session, user, event);
    }

    // Handle signup completion
    if (signUp.fulfilled.match(action)) {
      console.log('✅ Signup completed, user will receive verification email');
      // No profile creation here - happens after email verification
    }

    // Handle signin completion
    if (signIn.fulfilled.match(action)) {
      console.log('✅ Sign in completed');
      // Profile handling done in auth state change listener
    }


    // Handle signout
    if (signOut.fulfilled.match(action)) {
      console.log('🚪 User signed out, cleaning up');
      // Cleanup happens automatically via auth state change
    }

    // Handle deep links
    if (action.type === 'auth/handleDeepLink') {
      await handleDeepLink(store, action.payload.url);
    }

    return result;
  };

/**
 * Initialize all auth listeners
 */
async function initializeAuthListeners(store: MiddlewareAPI<AppDispatch, RootState>) {
  const { dispatch } = store;

  // 1. Supabase auth state listener
  const { data: { subscription } } = onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth state change detected:', {
      event,
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      isEmailVerified: !!session?.user?.email_confirmed_at,
      timestamp: new Date().toISOString()
    });

    const user = session?.user ? transformUser(session.user) : null;

    dispatch(authStateChanged({
      session,
      user,
      event: event as any
    }));
  });

  middlewareState.authSubscription = subscription;

  // 2. Deep link listener
  middlewareState.linkingSubscription = Linking.addEventListener('url', ({ url }) => {
    console.log('🔗🔗🔗 DEEP LINK RECEIVED 🔗🔗🔗');
    console.log('URL:', url);
    console.log('Timestamp:', new Date().toISOString());
    console.log('URL length:', url?.length || 0);
    console.log('URL scheme:', url?.split('://')[0] || 'unknown');
    console.log('🔗🔗🔗 END DEEP LINK LOG 🔗🔗🔗');
    dispatch({ type: 'auth/handleDeepLink', payload: { url } });
  });

  // Check for initial deep link
  const initialUrl = await Linking.getInitialURL();
  console.log('🔗 Checking for initial deep link...');
  console.log('Initial URL result:', initialUrl);
  if (initialUrl) {
    console.log('🔗🔗🔗 INITIAL DEEP LINK FOUND 🔗🔗🔗');
    console.log('URL:', initialUrl);
    console.log('🔗🔗🔗 END INITIAL DEEP LINK LOG 🔗🔗🔗');
    dispatch({ type: 'auth/handleDeepLink', payload: { url: initialUrl } });
  } else {
    console.log('🔗 No initial deep link found');
  }

  // 3. App state listener for session refresh
  middlewareState.appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
    if (nextAppState === 'active') {
      console.log('🔄 App became active, refreshing session...');
      dispatch(refreshSession());
    }
  });

  console.log('✅ All auth listeners initialized');
}

/**
 * Handle auth state changes
 */
async function handleAuthStateChange(
  store: MiddlewareAPI<AppDispatch, RootState>,
  session: any,
  user: any,
  event: string
) {
  const { dispatch } = store;

  try {
    // Update auth state in Redux
    dispatch(setAuthState({ session, user }));

    // Handle profile creation for verified users (multiple auth events can trigger this)
    if (session?.user && user?.isEmailVerified && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
      console.log(`✅ Verified user auth event (${event}), starting enterprise profile workflow...`);
      console.log('📋 User details:', {
        userId: session.user.id,
        email: session.user.email,
        isEmailVerified: user.isEmailVerified,
        userMetadata: session.user.user_metadata
      });

      // Check if we're already in the middle of profile creation to avoid duplicates
      const currentState = store.getState();
      if (currentState.auth.profileLoading) {
        console.log('⏳ Profile creation already in progress, skipping...');
        return;
      }

      dispatch(profileCreationStarted());

      try {
        const profileResult = await enterpriseProfileService.ensureProfileExists(
          session.user.user_metadata
        );

        if (profileResult.success) {
          console.log('✅ Enterprise profile workflow completed:', {
            profile_exists: profileResult.profile_exists,
            is_provider: profileResult.is_provider,
            profile_id: profileResult.profile_id
          });

          dispatch(profileCreationCompleted({
            profile_id: profileResult.profile_id,
            profile_exists: profileResult.profile_exists,
            is_provider: profileResult.is_provider
          }));

        } else {
          console.error('❌ Enterprise profile workflow failed:', profileResult);

          dispatch(profileCreationFailed({
            error: profileResult.error || 'UNKNOWN_ERROR',
            message: profileResult.message || 'Profile creation failed'
          }));
        }

      } catch (error) {
        console.error('💥 Profile creation error:', error);

        dispatch(profileCreationFailed({
          error: 'UNEXPECTED_ERROR',
          message: error instanceof Error ? error.message : 'Unexpected error'
        }));
      }
    }

    // Handle sign out cleanup
    if (!session && event === 'SIGNED_OUT') {
      console.log('🧹 User signed out, clearing state');
      dispatch(clearError());
    }

  } catch (error) {
    console.error('💥 Auth state change handling error:', error);

    // Ensure clean state on error
    dispatch(setAuthState({ session: null, user: null }));
  }
}

/**
 * Enterprise 2025: Enhanced deep link processing with industry-standard PKCE
 */
async function handleDeepLink(
  store: MiddlewareAPI<AppDispatch, RootState>,
  url: string
) {
  const { dispatch } = store;

  try {
    // Input validation
    if (!url || typeof url !== 'string' || url.length > 2000) {
      console.warn('⚠️ Invalid deep link URL');
      return;
    }

    console.log('🔗 Processing deep link:', url);

    // MODERN 2025: Handle different auth deep link patterns
    if (url.includes('auth/verified') || url.includes('auth/callback') || url.includes('auth/verify')) {
      await handleAuthVerificationDeepLink(store, url);
    } else if (url.includes('auth/error')) {
      await handleAuthErrorDeepLink(store, url);
    } else {
      console.log('ℹ️ Non-auth deep link, ignoring');
    }

  } catch (error) {
    console.error('💥 Deep link processing error:', error);
  }
}

/**
 * Handle email verification success deep links
 */
async function handleAuthVerificationDeepLink(
  store: MiddlewareAPI<AppDispatch, RootState>,
  url: string
) {
  const { dispatch } = store;

  try {
    console.log('✅ Email verification deep link detected');

    // Check if deep link contains session tokens (from web verification)
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search || urlObj.hash.substring(1));

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    const tokenHash = params.get('token_hash');
    const type = params.get('type');

    let session, error;

    if (accessToken && refreshToken) {
      console.log('🔗 Deep link contains session tokens, setting session directly');

      // Set session using tokens from deep link
      const result = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      session = result.data.session;
      error = result.error;
    } else if (tokenHash) {
      console.log('🔗 Deep link contains token_hash, performing PKCE verification');

      // Direct verification from email link (mobile app button)
      const result = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type || 'email'
      });

      session = result.data.session;
      error = result.error;
    } else {
      console.log('🔗 No tokens in deep link, checking current session');

      // ENTERPRISE PKCE APPROACH: Let Supabase handle verification automatically
      const result = await supabase.auth.getSession();
      session = result.data.session;
      error = result.error;
    }

    if (error) {
      console.error('❌ Session retrieval error after verification:', error);
      return;
    }

    if (session?.user) {
      console.log('🎉 PKCE email verification successful, session found!');

      const transformedUser = transformUser(session.user);

      // Update auth state
      dispatch(setAuthState({
        session,
        user: transformedUser
      }));

      // Handle profile creation for verified users
      if (transformedUser.isEmailVerified) {
        console.log('👤 Starting profile creation for verified user...');
        dispatch(profileCreationStarted());

        try {
          const profileResult = await enterpriseProfileService.ensureProfileExists(
            session.user.user_metadata
          );

          if (profileResult.success) {
            dispatch(profileCreationCompleted({
              profile_id: profileResult.profile_id,
              profile_exists: profileResult.profile_exists,
              is_provider: profileResult.is_provider
            }));
          } else {
            dispatch(profileCreationFailed({
              error: profileResult.error || 'PROFILE_ERROR',
              message: profileResult.message || 'Profile creation failed'
            }));
          }

        } catch (error) {
          dispatch(profileCreationFailed({
            error: 'UNEXPECTED_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      }
    } else {
      console.warn('⚠️ No session found after email verification');
    }

  } catch (error) {
    console.error('💥 Auth verification deep link error:', error);
  }
}

/**
 * Handle auth error deep links
 */
async function handleAuthErrorDeepLink(
  store: MiddlewareAPI<AppDispatch, RootState>,
  url: string
) {
  const { dispatch } = store;

  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search || urlObj.hash.substring(1));

    const error = params.get('error');
    const errorDescription = params.get('error_description');

    console.error('❌ Auth error deep link:', error, errorDescription);

    // Update Redux state with error
    dispatch(setAuthState({
      session: null,
      user: null
    }));

    // You can dispatch a specific error action here if needed
    // dispatch(setAuthError(errorDescription || 'Authentication error occurred'));

  } catch (error) {
    console.error('💥 Auth error deep link processing error:', error);
  }
}

/**
 * Cleanup auth listeners
 */
export function cleanupAuthListeners() {
  console.log('🧹 Cleaning up auth middleware listeners');

  middlewareState.authSubscription?.unsubscribe();
  middlewareState.linkingSubscription?.remove();
  middlewareState.appStateSubscription?.remove();

  middlewareState = {
    authSubscription: null,
    linkingSubscription: null,
    appStateSubscription: null,
    isInitialized: false,
  };
}