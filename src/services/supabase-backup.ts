import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Database } from '../types/database';

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

// Generate secure deep link URL for auth callbacks
const getAuthRedirectUrl = (): string => {
  const scheme = Linking.createURL('/');
  // Remove trailing slash to create clean deep link
  const baseUrl = scheme.endsWith('/') ? scheme.slice(0, -1) : scheme;
  return `${baseUrl}/auth/callback`;
};

// Create typed Supabase client with proper configuration
export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // React Native specific storage configuration
    storage: AsyncStorage,

    // Session management
    autoRefreshToken: true,
    persistSession: true,

    // CRITICAL: Must be false for React Native
    detectSessionInUrl: false,

    // PKCE flow for enhanced security (OAuth 2.1 standard)
    flowType: 'pkce',

    // Debug mode based on environment
    debug: __DEV__,
  },

  // Database configuration
  db: {
    schema: 'public',
  },

  // Global settings
  global: {
    headers: {
      'X-Client-Info': 'manito-react-native',
    },
  },
});

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