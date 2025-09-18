import { createClient, SupabaseClient, processLock } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { AppState, Platform } from 'react-native';

// Environment validation with detailed error messages
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL is required. Check your .env file and ensure it starts with https://');
}

if (!supabaseAnonKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required. Check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error(`Invalid EXPO_PUBLIC_SUPABASE_URL format: ${supabaseUrl}. Must be a valid HTTPS URL.`);
}

// Modern 2025: Enterprise redirect URL configuration
const getAuthRedirectUrl = (): string => {
  // ENTERPRISE APPROACH: Use web callback that handles deep linking
  // Web page processes verification tokens and redirects to mobile app
  if (__DEV__) {
    // Development: Use web callback for reliable email verification
    return 'https://auth.manito.cl';
  } else {
    // Production: Use web callback for reliable email verification
    return 'https://auth.manito.cl';
  }
};

// Alternative redirect for web-based auth flows
export const getWebAuthRedirectUrl = (): string => {
  if (__DEV__) {
    return 'http://localhost:3000/auth/callback';
  }
  return 'https://app.manito.cl/auth/callback';
};

// Helper function to create session from URL tokens (following Supabase best practices)
export const createSessionFromUrl = async (url: string) => {
  try {
    // Parse URL to extract tokens
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search || urlObj.hash.substring(1));

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresAt = params.get('expires_at');

    if (!accessToken || !refreshToken) {
      throw new Error('Missing authentication tokens in URL');
    }

    // Set session using Supabase's setSession method
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    console.log('✅ Session created successfully from URL tokens');
    return data.session;
  } catch (error) {
    console.error('Error creating session from URL:', error);
    throw error;
  }
};

// Create typed Supabase client with modern 2025 configuration
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Platform-specific storage configuration
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),

    // Session management
    autoRefreshToken: true,
    persistSession: true,

    // MODERN 2025: Enable native URL detection for React Native
    // This allows Supabase to handle auth callbacks natively
    detectSessionInUrl: Platform.OS === "web",

    // Process lock for session management
    lock: processLock,

    // MODERN 2025: Use PKCE flow for enhanced security (will switch to implicit when dashboard is updated)
    flowType: 'pkce',

    // Enable debug for development
    debug: __DEV__,

    // Storage key namespace for multi-app scenarios
    storageKey: 'manito-auth',
  },

  // Database configuration
  db: {
    schema: 'public',
  },

  // Global settings
  global: {
    headers: {
      'X-Client-Info': 'manito-react-native',
      'X-App-Version': '1.0.0',
    },
  },
});

// Auto-refresh session management based on app state
if (Platform.OS !== "web") {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

// Auth callback URL for email verification
export const AUTH_REDIRECT_URL = getAuthRedirectUrl();

// Helper function to validate session
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session validation error:', error);
      return { valid: false, error };
    }

    if (!session) {
      return { valid: false, error: null };
    }

    // Validate token expiration
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.warn('Session expired, attempting refresh...');

      // Attempt to refresh the session
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('Session refresh failed:', refreshError);
        return { valid: false, error: refreshError };
      }

      return { valid: true, session: data.session };
    }

    return { valid: true, session };
  } catch (error) {
    console.error('Unexpected error during session validation:', error);
    return { valid: false, error };
  }
};

// Helper function to safely sign out
export const safeSignOut = async () => {
  try {
    // Clear any pending operations
    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      console.error('Sign out error:', error);
      // Force local session clear even if server signout fails
      await AsyncStorage.removeItem('supabase.auth.token');
    }

    return { success: !error, error };
  } catch (error) {
    console.error('Unexpected sign out error:', error);
    // Force local cleanup
    try {
      await AsyncStorage.removeItem('supabase.auth.token');
    } catch (storageError) {
      console.error('Storage cleanup error:', storageError);
    }
    return { success: false, error };
  }
};

// Auth state change listener (moved from auth.ts for clean architecture)
export const onAuthStateChange = (
  callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void
) => {
  console.log('📡 Setting up auth state listener');
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', {
      event,
      hasSession: !!session,
      timestamp: new Date().toISOString()
    });
    callback(event, session);
  });
};

// Helper exports with proper typing
export const auth = supabase.auth;
export const db = supabase;

// Type exports for components
export type { Session, User, AuthError } from '@supabase/supabase-js';

// Configuration export for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey.substring(0, 20) + '...', // Partial key for debugging
  redirectUrl: AUTH_REDIRECT_URL,
} as const;