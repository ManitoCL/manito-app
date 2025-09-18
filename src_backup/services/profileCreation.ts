/**
 * Centralized Profile Creation Service
 *
 * This service handles user profile creation consistently across all auth flows.
 * Eliminates duplicate code and provides standardized error handling.
 */

import { supabase } from './supabase';

export class ProfileCreationError extends Error {
  constructor(
    message: string,
    public context: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ProfileCreationError';
  }
}

interface ProfileCreationResult {
  success: boolean;
  data?: any;
  error?: string;
  context: string;
}

// Global state to prevent concurrent profile creation attempts
const profileCreationAttempts = new Map<string, Promise<ProfileCreationResult>>();

/**
 * Ensures a user profile exists in the custom users table (idempotent & race-condition safe)
 * @param context - The context where profile creation is called from (for logging)
 * @returns Promise<ProfileCreationResult>
 */
export const ensureUserProfile = async (context: string): Promise<ProfileCreationResult> => {
  try {
    // Get current user to use as key for deduplication
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error(`❌ No authenticated user found in context: ${context}`);
      return {
        success: false,
        error: 'No authenticated user',
        context
      };
    }

    const userId = user.id;
    const attemptKey = `${userId}_${context}`;

    // Check if there's already a profile creation in progress for this user
    if (profileCreationAttempts.has(userId)) {
      console.log(`⏳ Profile creation already in progress for user ${userId}, waiting...`);
      const existingAttempt = profileCreationAttempts.get(userId)!;

      // Wait for the existing attempt to complete
      const result = await existingAttempt;
      console.log(`✅ Using result from concurrent profile creation: ${result.success}`);
      return result;
    }

    console.log(`🔄 Creating user profile via ${context} for user ${userId}...`);

    // Create a new promise for this profile creation attempt
    const creationPromise = createProfileInternal(context, userId);

    // Store the promise to prevent concurrent attempts
    profileCreationAttempts.set(userId, creationPromise);

    try {
      const result = await creationPromise;
      return result;
    } finally {
      // Always clean up the stored promise after completion
      profileCreationAttempts.delete(userId);
    }

  } catch (err) {
    const errorMessage = err instanceof ProfileCreationError
      ? err.message
      : `Profile creation error via ${context}`;

    console.error(`💥 ${errorMessage}:`, err);

    return {
      success: false,
      error: errorMessage,
      context
    };
  }
};

/**
 * Internal profile creation function (called by ensureUserProfile)
 */
async function createProfileInternal(context: string, userId: string): Promise<ProfileCreationResult> {
  try {
    const { data, error } = await supabase.rpc('create_user_profile_secure');

    if (error) {
      // Check if error is because profile already exists (this is OK)
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        console.log(`ℹ️ Profile already exists for user ${userId} via ${context} (this is OK)`);
        return {
          success: true,
          data: { message: 'Profile already exists' },
          context
        };
      }

      console.error(`❌ Profile creation failed via ${context} for user ${userId}:`, {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });

      throw new ProfileCreationError(
        error.message,
        context,
        error
      );
    }

    console.log(`✅ Profile created via ${context} for user ${userId}:`, data);

    return {
      success: true,
      data,
      context
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Checks if profile creation error is due to authentication issues
 * @param error - The error to check
 * @returns boolean - True if it's an auth error
 */
export const isAuthError = (error: any): boolean => {
  if (!error) return false;

  const message = error.message?.toLowerCase() || '';
  return message.includes('authentication required') ||
         message.includes('not authorized') ||
         message.includes('not authenticated');
};

/**
 * Gets user-friendly error message for profile creation failures
 * @param error - The error to translate
 * @param context - The context where the error occurred
 * @returns string - User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: any, context: string): string => {
  if (isAuthError(error)) {
    return 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
  }

  // Generic user-friendly message based on context
  switch (context) {
    case 'email-confirmation':
      return 'Hubo un problema al completar tu verificación de email. Por favor intenta nuevamente.';
    case 'deep-link':
      return 'Hubo un problema al procesar tu verificación. Por favor abre la app nuevamente.';
    case 'manual-check':
      return 'No se pudo verificar tu cuenta. Por favor revisa tu email o contacta soporte.';
    default:
      return 'Hubo un problema al crear tu perfil. Por favor intenta nuevamente.';
  }
};