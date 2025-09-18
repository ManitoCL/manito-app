import * as Linking from 'expo-linking';
import { supabase, AUTH_REDIRECT_URL } from '../services/supabase';
import type { Session, User } from '@supabase/supabase-js';

// Enhanced interface with proper typing
export interface DeepLinkAuthParams {
  access_token?: string;
  refresh_token?: string;
  code?: string;
  session_code?: string;
  type?: 'signup' | 'recovery' | 'invite' | 'magiclink';
  error?: string;
  error_description?: string;
  expires_in?: string;
  token_type?: string;
}

export interface AuthCallbackResult {
  success: boolean;
  error?: string;
  data?: {
    user: User;
    session: Session;
  };
  needsConfirmation?: boolean;
}

export interface DeepLinkResult {
  shouldNavigate: boolean;
  route?: string;
  params?: any;
  handled: boolean;
}

/**
 * SECURE: Parse auth callback URL with validation
 */
export const parseAuthCallback = (url: string): DeepLinkAuthParams => {
  try {
    if (!url || typeof url !== 'string') {
      console.warn('Invalid URL provided to parseAuthCallback');
      return {};
    }

    console.log('🔍 Parsing auth callback URL');

    // Extract parameters from either hash or query string
    let paramString = '';

    // Supabase PKCE flow typically uses hash fragments
    if (url.includes('#')) {
      paramString = url.split('#')[1];
    } else if (url.includes('?')) {
      paramString = url.split('?')[1];
    }

    if (!paramString) {
      console.warn('No parameters found in auth callback URL');
      return {};
    }

    const urlParams = new URLSearchParams(paramString);

    const params: DeepLinkAuthParams = {
      access_token: urlParams.get('access_token') || undefined,
      refresh_token: urlParams.get('refresh_token') || undefined,
      code: urlParams.get('code') || undefined,
      session_code: urlParams.get('session_code') || undefined,
      type: (urlParams.get('type') as any) || undefined,
      error: urlParams.get('error') || undefined,
      error_description: urlParams.get('error_description') || undefined,
      expires_in: urlParams.get('expires_in') || undefined,
      token_type: urlParams.get('token_type') || undefined,
    };

    console.log('✅ Parsed auth callback parameters:', {
      hasAccessToken: !!params.access_token,
      hasRefreshToken: !!params.refresh_token,
      hasCode: !!params.code,
      hasSessionCode: !!params.session_code,
      type: params.type,
      hasError: !!params.error,
    });

    return params;
  } catch (error) {
    console.error('💥 Error parsing auth callback URL:', error);
    return {};
  }
};

/**
 * SECURE: Handle auth callback with enhanced validation
 */
export const handleAuthCallback = async (url: string): Promise<AuthCallbackResult> => {
  try {
    console.log('🔐 Handling auth callback');

    const params = parseAuthCallback(url);

    // Check for errors in the callback first
    if (params.error) {
      console.error('❌ Auth callback error:', params.error);
      return {
        success: false,
        error: params.error_description || params.error,
      };
    }

    let authResult;

    if (params.code) {
      // PKCE Code flow: exchange code for session (preferred for security)
      console.log('🔑 Using PKCE code flow');

      try {
        authResult = await supabase.auth.exchangeCodeForSession(params.code);
      } catch (codeError) {
        console.error('❌ Code exchange failed:', codeError);
        return {
          success: false,
          error: 'Error al procesar el código de verificación',
        };
      }
    } else if (params.session_code) {
      // Secure session code flow (custom implementation)
      console.log('🔒 Using secure session code flow');

      try {
        // Retrieve tokens from secure endpoint
        const response = await fetch('https://auth.manito.cl/api/retrieve-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_code: params.session_code,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve session from secure code');
        }

        const sessionData = await response.json();

        authResult = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        });
      } catch (sessionError) {
        console.error('❌ Secure session retrieval failed:', sessionError);
        return {
          success: false,
          error: 'Error al recuperar la sesión segura',
        };
      }
    } else if (params.access_token && params.refresh_token) {
      // Direct token flow (fallback, less secure)
      console.log('🎫 Using direct token flow');

      // Validate token format before using
      if (!validateTokenFormat(params.access_token, params.refresh_token)) {
        return {
          success: false,
          error: 'Formato de tokens inválido',
        };
      }

      try {
        authResult = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      } catch (tokenError) {
        console.error('❌ Direct token session failed:', tokenError);
        return {
          success: false,
          error: 'Error al establecer la sesión con tokens',
        };
      }
    } else {
      console.warn('⚠️ No valid auth parameters found');
      return {
        success: false,
        error: 'No se encontraron parámetros de autenticación válidos',
      };
    }

    const { data, error } = authResult;

    if (error) {
      console.error('❌ Authentication error:', error);
      return {
        success: false,
        error: error.message || 'Error de autenticación',
      };
    }

    if (!data?.user || !data?.session) {
      console.warn('⚠️ No user or session data received');
      return {
        success: false,
        error: 'No se recibieron datos de usuario o sesión',
      };
    }

    console.log('✅ Auth callback successful:', {
      userId: data.user.id,
      emailVerified: !!data.user.email_confirmed_at,
      sessionExpiry: data.session.expires_at,
    });

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    };
  } catch (error: any) {
    console.error('💥 Unexpected auth callback error:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado al procesar la autenticación',
    };
  }
};

/**
 * SECURE: Validate token format before usage
 */
const validateTokenFormat = (accessToken: string, refreshToken: string): boolean => {
  // JWT access tokens should be at least 100 characters and have 3 parts
  if (!accessToken || accessToken.length < 100 || accessToken.split('.').length !== 3) {
    console.error('Invalid access token format');
    return false;
  }

  // Refresh tokens should be at least 8 characters
  if (!refreshToken || refreshToken.length < 8) {
    console.error('Invalid refresh token format');
    return false;
  }

  return true;
};

/**
 * SECURE: Check if a URL is an auth callback with proper validation
 */
export const isAuthCallback = (url: string): boolean => {
  try {
    if (!url || typeof url !== 'string') {
      return false;
    }

    const parsed = Linking.parse(url);

    const isAuthPath = (
      parsed.path === 'auth/callback' ||
      url.includes('auth/callback')
    );

    const hasAuthParams = (
      url.includes('access_token=') ||
      url.includes('code=') ||
      url.includes('session_code=')
    );

    return isAuthPath || hasAuthParams;
  } catch (error) {
    console.error('Error checking if URL is auth callback:', error);
    return false;
  }
};

/**
 * SECURE: Generate the auth callback URL for the mobile app
 */
export const getAuthCallbackUrl = (): string => {
  return AUTH_REDIRECT_URL;
};

/**
 * SECURE: Generate the web auth callback URL
 */
export const getWebAuthCallbackUrl = (): string => {
  return 'https://auth.manito.cl';
};

/**
 * SECURE: Main deep link router with comprehensive handling
 */
export const handleDeepLink = async (url: string): Promise<DeepLinkResult> => {
  try {
    if (!url || typeof url !== 'string') {
      return { shouldNavigate: false, handled: false };
    }

    console.log('🔗 Processing deep link:', url);

    const parsed = Linking.parse(url);

    // Handle auth callbacks
    if (isAuthCallback(url)) {
      console.log('📱 Processing auth callback deep link');

      const result = await handleAuthCallback(url);

      if (result.success) {
        console.log('✅ Auth callback successful, navigating to main app');
        return {
          shouldNavigate: true,
          route: 'Main',
          handled: true,
        };
      } else {
        console.log('❌ Auth callback failed, showing error');
        return {
          shouldNavigate: true,
          route: 'Auth',
          params: { error: result.error },
          handled: true,
        };
      }
    }

    // Handle other deep links
    switch (parsed.hostname) {
      case 'provider':
        // Handle provider deep links: manito://provider/123
        const providerId = parsed.path?.replace('/', '');
        if (providerId) {
          return {
            shouldNavigate: true,
            route: 'ProviderProfile',
            params: { providerId },
            handled: true,
          };
        }
        break;

      case 'booking':
        // Handle booking deep links: manito://booking/456
        const bookingId = parsed.path?.replace('/', '');
        if (bookingId) {
          return {
            shouldNavigate: true,
            route: 'BookingDetails',
            params: { bookingId },
            handled: true,
          };
        }
        break;

      case 'service':
        // Handle service deep links: manito://service/plumbing
        const serviceType = parsed.path?.replace('/', '');
        if (serviceType) {
          return {
            shouldNavigate: true,
            route: 'ServiceProviders',
            params: { serviceType },
            handled: true,
          };
        }
        break;

      default:
        console.log('🔍 Unknown deep link hostname:', parsed.hostname);
        break;
    }

    return { shouldNavigate: false, handled: false };
  } catch (error) {
    console.error('💥 Error handling deep link:', error);
    return { shouldNavigate: false, handled: false };
  }
};

/**
 * SECURE: Validate auth tokens with comprehensive checks
 */
export const validateAuthTokens = (params: DeepLinkAuthParams): boolean => {
  if (params.code) {
    // Code flow validation
    return params.code.length > 10;
  }

  if (params.session_code) {
    // Session code validation
    return params.session_code.length === 64; // Our secure codes are 64 chars
  }

  if (params.access_token && params.refresh_token) {
    // Token flow validation
    return validateTokenFormat(params.access_token, params.refresh_token);
  }

  return false;
};

/**
 * SECURE: Check if deep link is for email verification
 */
export const isEmailVerificationCallback = (url: string): boolean => {
  const params = parseAuthCallback(url);
  return params.type === 'signup' && (!!params.code || !!params.access_token);
};

/**
 * SECURE: Check if deep link is for password recovery
 */
export const isPasswordRecoveryCallback = (url: string): boolean => {
  const params = parseAuthCallback(url);
  return params.type === 'recovery' && (!!params.code || !!params.access_token);
};

/**
 * Export constants
 */
export const DEEP_LINK_CONSTANTS = {
  AUTH_CALLBACK_PATH: 'auth/callback',
  WEB_AUTH_URL: 'https://auth.manito.cl',
  MOBILE_SCHEME: 'manito',
} as const;