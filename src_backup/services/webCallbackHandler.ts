/**
 * Web Callback Handler for Email Confirmations
 *
 * This handles the bridge between web email links and mobile deep links
 * Required because email clients open web URLs, not deep links directly
 */

import { supabase } from './supabase';
import * as Linking from 'expo-linking';

export class WebCallbackHandler {
  // Extract auth tokens from web callback URL
  static extractAuthTokens(url: string) {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        expires_in: params.get('expires_in'),
        token_type: params.get('token_type'),
        type: params.get('type') || 'signup',
        error: params.get('error'),
        error_description: params.get('error_description'),
      };
    } catch (error) {
      console.error('Error parsing callback URL:', error);
      return { error: 'Invalid callback URL' };
    }
  }

  // Process email confirmation from web callback
  static async processEmailConfirmation(callbackUrl: string) {
    const tokens = this.extractAuthTokens(callbackUrl);

    if (tokens.error) {
      return {
        success: false,
        error: tokens.error,
        errorDescription: tokens.error_description,
      };
    }

    if (!tokens.access_token) {
      return {
        success: false,
        error: 'Missing access token',
      };
    }

    try {
      // Set the session using the tokens from the callback
      const { data, error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || '',
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('Error setting session from callback:', error);
      return {
        success: false,
        error: 'Failed to process authentication',
      };
    }
  }

  // Generate the proper redirect URL based on environment
  static getRedirectUrl(): string {
    // IMPORTANT: Always use production auth callback for email confirmations
    // The Expo dev server doesn't serve the callback page - it's deployed to Vercel
    // This ensures consistent behavior across dev and prod environments
    return 'https://auth.manito.cl';
  }

  // Create a universal link that works for both web and mobile
  static createUniversalAuthUrl(path: string = '/auth/callback'): string {
    const webUrl = this.getRedirectUrl();
    const deepLink = Linking.createURL(path);

    // IMPORTANT: Always use web callback URL for email confirmations
    // The web callback handles platform detection and appropriate redirects
    // This provides consistent, professional UX across all environments
    return webUrl;
  }

  // Handle incoming deep link from web callback
  static async handleDeepLink(url: string) {
    const { hostname, path, queryParams } = Linking.parse(url);

    if (path === '/auth/callback') {
      // This is an email confirmation callback
      const fullUrl = `${url}`;
      return this.processEmailConfirmation(fullUrl);
    }

    return { success: false, error: 'Unknown deep link path' };
  }

  // For debugging: log what URLs are being generated
  static debugUrls() {
    console.group('🔗 URL Debug Information');
    console.log('Environment:', __DEV__ ? 'Development' : 'Production');
    console.log('Deep Link URL:', Linking.createURL('/auth/callback'));
    console.log('Web Redirect URL:', this.getRedirectUrl());
    console.log('Universal URL:', this.createUniversalAuthUrl());
    console.groupEnd();
  }
}

// Export a function to update auth service with proper URLs
export const updateAuthServiceUrls = () => {
  return {
    emailRedirectTo: WebCallbackHandler.createUniversalAuthUrl('/auth/callback'),
    webRedirectTo: WebCallbackHandler.getRedirectUrl(),
    deepLinkUrl: Linking.createURL('/auth/callback'),
  };
};