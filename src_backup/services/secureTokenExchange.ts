/**
 * Secure Token Exchange Service
 *
 * Replaces raw JWT tokens in deep links with encrypted session codes
 * to prevent token exposure in URLs, logs, and browser history.
 */

import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';

// React Native crypto polyfill with expo-crypto
const getCrypto = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return crypto;
  }

  // Use expo-crypto for React Native
  return {
    getRandomValues: (array: Uint8Array) => {
      // Generate random bytes using expo-crypto
      const randomBytes = Crypto.getRandomBytes(array.length);
      for (let i = 0; i < array.length; i++) {
        array[i] = randomBytes[i];
      }
      return array;
    }
  };
};

interface SessionTokens {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  type?: string;
}

interface SessionCode {
  code: string;
  expires_at: number;
}

// In-memory store for session codes (production would use Redis/database)
const sessionCodeStore = new Map<string, SessionTokens>();

/**
 * Creates a secure session code that can be safely passed in deep links
 * @param tokens - The auth tokens to store securely
 * @returns Promise<SessionCode> - Secure code and expiration
 */
export const createSecureSessionCode = async (tokens: SessionTokens): Promise<SessionCode> => {
  try {
    // Generate a secure random code (not predictable)
    const randomBytes = new Uint8Array(32);
    const cryptoInstance = getCrypto();
    cryptoInstance.getRandomValues(randomBytes);
    const code = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');

    // Set expiration (5 minutes from now)
    const expires_at = Date.now() + (5 * 60 * 1000);

    // Store tokens with the code (in production, use encrypted database storage)
    sessionCodeStore.set(code, {
      ...(tokens || {}),
      expires_in: expires_at
    });

    console.log('🔐 Created secure session code:', {
      codeLength: code.length,
      expiresAt: new Date(expires_at).toISOString(),
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token
    });

    // Clean up expired codes
    cleanupExpiredCodes();

    return {
      code,
      expires_at
    };

  } catch (error) {
    console.error('❌ Error creating secure session code:', error);
    throw new Error('Failed to create secure session code');
  }
};

/**
 * Retrieves tokens using a secure session code from the auth callback API
 * @param code - The secure session code
 * @returns Promise<SessionTokens | null> - The tokens or null if invalid/expired
 */
export const retrieveTokensFromCode = async (code: string): Promise<SessionTokens | null> => {
  try {
    console.log('🔓 Retrieving tokens from secure session code via API...');

    // Validate code format
    if (!code || code.length !== 64) {
      console.error('❌ Invalid session code format');
      return null;
    }

    // Call the auth callback API to retrieve tokens
    const response = await fetch('https://auth.manito.cl/api/retrieve-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_code: code
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Session code retrieval failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return null;
    }

    const tokens = await response.json();

    console.log('✅ Successfully retrieved tokens from session code via API');

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      type: tokens.type
    };

  } catch (error) {
    console.error('❌ Error retrieving tokens from session code:', error);
    return null;
  }
};

/**
 * Validates a session code without consuming it
 * @param code - The session code to validate
 * @returns boolean - Whether the code is valid and not expired
 */
export const validateSessionCode = (code: string): boolean => {
  try {
    if (!code || code.length !== 64) {
      return false;
    }

    const tokens = sessionCodeStore.get(code);
    if (!tokens) {
      return false;
    }

    const now = Date.now();
    if (tokens.expires_in && tokens.expires_in < now) {
      sessionCodeStore.delete(code);
      return false;
    }

    return true;

  } catch (error) {
    console.error('❌ Error validating session code:', error);
    return false;
  }
};

/**
 * Cleans up expired session codes from memory
 */
function cleanupExpiredCodes(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [code, tokens] of sessionCodeStore.entries()) {
    if (tokens.expires_in && tokens.expires_in < now) {
      sessionCodeStore.delete(code);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired session codes`);
  }
}

/**
 * Creates a secure deep link using session code instead of raw tokens
 * @param tokens - The auth tokens
 * @param basePath - The deep link base path (default: '/auth/callback')
 * @returns Promise<string> - Secure deep link URL
 */
export const createSecureDeepLink = async (
  tokens: SessionTokens,
  basePath: string = '/auth/callback'
): Promise<string> => {
  try {
    const sessionCode = await createSecureSessionCode(tokens);

    // Create deep link with secure session code instead of raw tokens
    const deepLink = `manito://${basePath}?session_code=${sessionCode.code}&type=${tokens.type || 'signup'}`;

    console.log('🔗 Created secure deep link:', {
      deepLinkLength: deepLink.length,
      hasSessionCode: true,
      expiresAt: new Date(sessionCode.expires_at).toISOString()
    });

    return deepLink;

  } catch (error) {
    console.error('❌ Error creating secure deep link:', error);
    throw new Error('Failed to create secure deep link');
  }
};

/**
 * Gets statistics about session code usage (for monitoring)
 */
export const getSessionCodeStats = () => {
  const now = Date.now();
  let activeCount = 0;
  let expiredCount = 0;

  for (const [code, tokens] of sessionCodeStore.entries()) {
    if (tokens.expires_in && tokens.expires_in < now) {
      expiredCount++;
    } else {
      activeCount++;
    }
  }

  return {
    active: activeCount,
    expired: expiredCount,
    total: sessionCodeStore.size
  };
};