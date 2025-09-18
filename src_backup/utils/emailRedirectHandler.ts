/**
 * Temporary handler for SendGrid email redirects during development
 * This processes confirmation links that come from url8888.manito.cl
 */

import { supabase } from '../services/supabase';
import * as Linking from 'expo-linking';

export class EmailRedirectHandler {
  // Extract token and type from SendGrid redirect URL
  static extractTokenFromSendGridUrl(url: string): { token?: string, type?: string, error?: string } {
    try {
      const urlObj = new URL(url);

      // SendGrid typically includes the original parameters
      const token = urlObj.searchParams.get('token') ||
                   urlObj.searchParams.get('confirmation_token') ||
                   urlObj.searchParams.get('access_token');

      const type = urlObj.searchParams.get('type') || 'signup';

      if (!token) {
        return { error: 'No confirmation token found in URL' };
      }

      return { token, type };
    } catch (error) {
      return { error: 'Invalid URL format' };
    }
  }

  // Handle email confirmation from SendGrid redirect
  static async handleEmailConfirmation(sendgridUrl: string) {
    try {
      const { token, type, error } = this.extractTokenFromSendGridUrl(sendgridUrl);

      if (error || !token) {
        throw new Error(error || 'Invalid confirmation URL');
      }

      // Use Supabase's verifyOtp with the extracted token
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any,
      });

      if (verifyError) throw verifyError;

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Email confirmation error:', error);
      return { data: null, error, success: false };
    }
  }

  // Create a web endpoint that can handle SendGrid redirects
  static async createRedirectEndpoint() {
    // This would need to be implemented as a web service
    // that receives the SendGrid URL and processes it, then
    // redirects to your app with the proper deep link

    const webHandlerUrl = 'https://manito.cl/auth/sendgrid-handler';

    return webHandlerUrl;
  }
}

// Development helper: Log what URL would be generated
export const debugEmailRedirectUrl = () => {
  const deepLinkUrl = Linking.createURL('/auth/callback');
  console.log('Generated deep link URL:', deepLinkUrl);

  // This is what should be in Supabase config
  console.log('Expected in Supabase redirect URLs:', deepLinkUrl);

  return deepLinkUrl;
};