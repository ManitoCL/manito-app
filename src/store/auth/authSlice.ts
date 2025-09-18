/**
 * Enterprise Auth Slice - Instagram/Meta Pattern
 * Centralized auth state management with RTK Query integration
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';
import { User } from '../../types';

// Enhanced Auth State Interface
interface AuthState {
  // Core auth state
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Profile state
  profileExists: boolean;
  isProvider: boolean;
  profileLoading: boolean;

  // Email verification
  isEmailVerified: boolean;
  emailVerificationSent: boolean;

  // UI state
  error: string | null;
  lastAction: string | null;

  // Enterprise features
  authMethod: 'email' | 'whatsapp' | 'deeplink' | null;
  sessionRefreshCount: number;
  lastActiveAt: string | null;

  // Onboarding flow state (Instagram/Meta pattern)
  onboardingStep: 'signup' | 'verification' | 'profile' | 'discovery' | 'complete' | null;
  needsProfileSetup: boolean;
  isFirstTimeUser: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  profileExists: false,
  isProvider: false,
  profileLoading: false,

  isEmailVerified: false,
  emailVerificationSent: false,

  error: null,
  lastAction: null,

  authMethod: null,
  sessionRefreshCount: 0,
  lastActiveAt: null,

  // Onboarding flow state
  onboardingStep: null,
  needsProfileSetup: false,
  isFirstTimeUser: false,
};

// Transform Supabase user to our User type
const transformUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  fullName: supabaseUser.user_metadata?.full_name || '',
  phoneNumber: supabaseUser.user_metadata?.phone,
  userType: supabaseUser.user_metadata?.user_type || 'customer',
  isEmailVerified: !!supabaseUser.email_confirmed_at,
  createdAt: supabaseUser.created_at,
  updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
});

// =============================================================================
// ASYNC THUNKS - Enterprise Auth Operations
// =============================================================================

/**
 * Initialize auth system
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚀 Initializing enterprise auth system...');

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.warn('⚠️ Auth initialization error (clearing invalid session):', error.message);
        await supabase.auth.signOut();
        return { session: null, user: null, isEmailVerified: false };
      }

      if (session?.user) {
        console.log('✅ Valid session found during initialization');
        const transformedUser = transformUser(session.user);
        return {
          session,
          user: transformedUser,
          isEmailVerified: transformedUser.isEmailVerified,
        };
      }

      console.log('ℹ️ No valid session found during initialization');
      return { session: null, user: null, isEmailVerified: false };

    } catch (error) {
      console.error('💥 Auth initialization failed:', error);

      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.warn('⚠️ Could not clear corrupted session:', signOutError);
      }

      return { session: null, user: null, isEmailVerified: false };
    }
  }
);

/**
 * Enterprise 2025: Sign up with PKCE flow (Industry best practice)
 */
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (params: {
    email: string;
    password: string;
    fullName: string;
    userType: 'customer' | 'provider';
    phone?: string;
    authMethod?: 'email' | 'whatsapp';
  }, { rejectWithValue }) => {
    try {
      console.log('📝 Starting enterprise PKCE signup process...', {
        email: params.email,
        userType: params.userType,
        hasPhone: !!params.phone
      });

      // Import AUTH_REDIRECT_URL dynamically to avoid circular deps
      const { AUTH_REDIRECT_URL } = await import('../../services/supabase');

      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            user_type: params.userType,
            phone: params.phone,
          },
          emailRedirectTo: AUTH_REDIRECT_URL,
        },
      });

      if (error) {
        console.error('❌ Modern signup error:', error);
        return rejectWithValue(error.message);
      }

      if (!data.user) {
        return rejectWithValue('No user returned from signup');
      }

      console.log('✅ Enterprise PKCE signup successful, verification email sent to:', params.email);
      console.log('📧 Email will redirect to:', AUTH_REDIRECT_URL);

      return {
        user: transformUser(data.user),
        session: data.session,
        emailVerificationSent: !data.user.email_confirmed_at,
        isEmailVerified: !!data.user.email_confirmed_at,
      };

    } catch (error) {
      console.error('💥 Modern signup error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Signup failed');
    }
  }
);


/**
 * Sign in with email and password
 */
export const signIn = createAsyncThunk(
  'auth/signIn',
  async (params: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🔑 Starting signin process...', { email: params.email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (error) {
        console.error('❌ Signin error:', error);
        return rejectWithValue(error.message);
      }

      if (!data.user || !data.session) {
        return rejectWithValue('No user or session returned from signin');
      }

      console.log('✅ Signin successful');

      return {
        user: transformUser(data.user),
        session: data.session,
        isEmailVerified: !!data.user.email_confirmed_at,
      };

    } catch (error) {
      console.error('💥 Signin error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Signin failed');
    }
  }
);

/**
 * Sign out
 */
export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚪 Starting signout process...');

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Signout error:', error);
        return rejectWithValue(error.message);
      }

      console.log('✅ Signout successful');
      return true;

    } catch (error) {
      console.error('💥 Signout error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Signout failed');
    }
  }
);

/**
 * Refresh session
 */
export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      console.log('🔄 Refreshing session...', {
        currentRefreshCount: state.auth.sessionRefreshCount
      });

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.warn('⚠️ Session refresh error:', error.message);
        await supabase.auth.signOut();
        return { session: null, user: null };
      }

      if (session?.user) {
        console.log('✅ Session refreshed successfully');
        return {
          session,
          user: transformUser(session.user),
          isEmailVerified: !!session.user.email_confirmed_at,
        };
      }

      console.log('ℹ️ No session found during refresh');
      return { session: null, user: null };

    } catch (error) {
      console.error('💥 Session refresh error:', error);
      return { session: null, user: null };
    }
  }
);

/**
 * Reset password
 */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      console.log('🔑 Sending password reset email...', { email });

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error('❌ Password reset error:', error);
        return rejectWithValue(error.message);
      }

      console.log('✅ Password reset email sent');
      return { email };

    } catch (error) {
      console.error('💥 Password reset error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Password reset failed');
    }
  }
);

/**
 * Modern 2025: Resend verification email with native redirect
 */
export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      console.log('📧 Resending modern verification email...', { email });

      // Import AUTH_REDIRECT_URL dynamically to avoid circular deps
      const { AUTH_REDIRECT_URL } = await import('../../services/supabase');

      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: AUTH_REDIRECT_URL,
        },
      });

      console.log('📧 Supabase resend response:', { data, error });

      if (error) {
        console.error('❌ Modern resend verification error:', error);
        return rejectWithValue(error.message);
      }

      console.log('✅ Modern verification email resent to:', email);
      console.log('📧 Email will redirect to:', AUTH_REDIRECT_URL);
      console.log('📧 Resend data:', data);
      return { email };

    } catch (error) {
      console.error('💥 Modern resend verification error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Resend failed');
    }
  }
);

// =============================================================================
// AUTH SLICE
// =============================================================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Core state management
    setAuthState: (state, action: PayloadAction<{ session: Session | null; user: User | null }>) => {
      state.session = action.payload.session;
      state.user = action.payload.user;
      state.isEmailVerified = action.payload.user?.isEmailVerified || false;
      state.isLoading = false;
      state.error = null;
      state.lastActiveAt = new Date().toISOString();
    },

    // Auth state change from middleware
    authStateChanged: (state, action: PayloadAction<{
      session: Session | null;
      user: User | null;
      event: string;
    }>) => {
      state.session = action.payload.session;
      state.user = action.payload.user;
      state.isEmailVerified = action.payload.user?.isEmailVerified || false;
      state.lastAction = action.payload.event;
      state.lastActiveAt = new Date().toISOString();

      // Clear profile state if user signed out
      if (!action.payload.session) {
        state.profileExists = false;
        state.isProvider = false;
        state.profileLoading = false;
      }
    },

    // Profile management actions (called by middleware)
    profileCreationStarted: (state) => {
      state.profileLoading = true;
      state.error = null;
    },

    profileCreationCompleted: (state, action: PayloadAction<{
      profile_id: string;
      profile_exists: boolean;
      is_provider: boolean;
    }>) => {
      state.profileLoading = false;
      state.profileExists = action.payload.profile_exists;
      state.isProvider = action.payload.is_provider;
      state.error = null;
    },

    profileCreationFailed: (state, action: PayloadAction<{
      error: string;
      message: string;
    }>) => {
      state.profileLoading = false;
      state.error = action.payload.message;
    },

    // UI state management
    clearError: (state) => {
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Mark as initialized (called by middleware)
    markAsInitialized: (state) => {
      state.isInitialized = true;
      state.isLoading = false;
    },

    // Email verification tracking
    setEmailVerificationSent: (state, action: PayloadAction<boolean>) => {
      state.emailVerificationSent = action.payload;
    },

    // Onboarding flow management (Instagram/Meta pattern)
    setOnboardingStep: (state, action: PayloadAction<typeof state.onboardingStep>) => {
      state.onboardingStep = action.payload;
    },

    markAsFirstTimeUser: (state, action: PayloadAction<boolean>) => {
      state.isFirstTimeUser = action.payload;
    },

    setNeedsProfileSetup: (state, action: PayloadAction<boolean>) => {
      state.needsProfileSetup = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.isEmailVerified = action.payload.isEmailVerified;
        state.isLoading = false;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.error.message || 'Auth initialization failed';
      })

      // Sign up
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isEmailVerified = action.payload.isEmailVerified;
        state.emailVerificationSent = action.payload.emailVerificationSent;
        state.isLoading = false;
        state.error = null;
        state.authMethod = 'email';

        // Onboarding flow management (Instagram/Meta pattern)
        state.isFirstTimeUser = true;
        state.onboardingStep = action.payload.isEmailVerified ? 'profile' : 'verification';
        state.needsProfileSetup = !action.payload.isEmailVerified; // Will be determined after verification
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })


      // Sign in
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isEmailVerified = action.payload.isEmailVerified;
        state.isLoading = false;
        state.error = null;
        state.authMethod = 'email';
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.isEmailVerified = false;
        state.profileExists = false;
        state.isProvider = false;
        state.profileLoading = false;
        state.emailVerificationSent = false;
        state.error = null;
        state.authMethod = null;
        state.sessionRefreshCount = 0;
      })
      .addCase(signOut.rejected, (state, action) => {
        // Clear state even on error for security
        state.user = null;
        state.session = null;
        state.isEmailVerified = false;
        state.profileExists = false;
        state.isProvider = false;
        state.profileLoading = false;
        state.error = action.payload as string;
      })

      // Refresh session
      .addCase(refreshSession.fulfilled, (state, action) => {
        if (action.payload.session && action.payload.user) {
          state.session = action.payload.session;
          state.user = action.payload.user;
          state.isEmailVerified = action.payload.isEmailVerified;
          state.sessionRefreshCount += 1;
        } else {
          // Session expired
          state.session = null;
          state.user = null;
          state.isEmailVerified = false;
          state.profileExists = false;
          state.isProvider = false;
        }
      })

      // Password reset
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Resend verification
      .addCase(resendVerificationEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.emailVerificationSent = true;
        state.error = null;

        // ALWAYS maintain verification step during resend (even if no session yet)
        state.onboardingStep = 'verification';
        console.log('🔄 Resend email completed - FORCED verification onboarding step');
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setAuthState,
  authStateChanged,
  profileCreationStarted,
  profileCreationCompleted,
  profileCreationFailed,
  clearError,
  setLoading,
  markAsInitialized,
  setEmailVerificationSent,
  setOnboardingStep,
  markAsFirstTimeUser,
  setNeedsProfileSetup,
} = authSlice.actions;

// Export selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.session && !!state.auth.user;
export const selectIsEmailVerified = (state: { auth: AuthState }) => state.auth.isEmailVerified;
export const selectProfileExists = (state: { auth: AuthState }) => state.auth.profileExists;
export const selectIsProvider = (state: { auth: AuthState }) => state.auth.isProvider;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading || state.auth.profileLoading;

// Onboarding flow selectors (Instagram/Meta pattern)
export const selectOnboardingStep = (state: { auth: AuthState }) => state.auth.onboardingStep;
export const selectIsFirstTimeUser = (state: { auth: AuthState }) => state.auth.isFirstTimeUser;
export const selectNeedsProfileSetup = (state: { auth: AuthState }) => state.auth.needsProfileSetup;
export const selectAuthMethod = (state: { auth: AuthState }) => state.auth.authMethod;

export const authReducer = authSlice.reducer;
export default authSlice.reducer;