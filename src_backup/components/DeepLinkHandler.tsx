import React, { useEffect, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';
import { ensureUserProfile } from '../services/profileCreation';
import { retrieveTokensFromCode } from '../services/secureTokenExchange';

interface DeepLinkHandlerProps {
  children: React.ReactNode;
}

const DeepLinkHandler: React.FC<DeepLinkHandlerProps> = ({ children }) => {
  // Helper function to process auth tokens asynchronously
  const processAuthTokens = useCallback(async (accessToken: string, refreshToken: string) => {
    try {
      console.log('🔄 Setting session from tokens...');

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('❌ Error setting session from deep link:', error);
      } else {
        console.log('✅ Session set successfully from deep link:', {
          hasUser: !!data.user,
          emailConfirmed: !!data.user?.email_confirmed_at,
          sessionCreated: true
        });

        // CRITICAL: Create user profile using centralized service
        // This ensures the mobile app has the same profile created by web callback
        await ensureUserProfile('deep-link');
      }
    } catch (err) {
      console.error('💥 Unexpected error in setSession:', err);
    }
  }, []);

  // Helper function to process session code from secure token exchange
  const processSessionCode = useCallback(async (sessionCode: string) => {
    try {
      console.log('🔓 Processing secure session code...');

      // Retrieve tokens using the secure session code
      const tokens = await retrieveTokensFromCode(sessionCode);

      if (!tokens) {
        console.error('❌ Failed to retrieve tokens from session code');
        return;
      }

      console.log('✅ Tokens retrieved from session code successfully');

      // Process the retrieved tokens
      await processAuthTokens(tokens.access_token, tokens.refresh_token);
    } catch (err) {
      console.error('💥 Unexpected error processing session code:', err);
    }
  }, [processAuthTokens]);

  // Helper function to process email confirmation asynchronously
  const processEmailConfirmation = useCallback(async (tokenHash: string, type: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'signup' | 'recovery' | 'invite' | 'magiclink',
      });

      if (error) {
        console.error('Error verifying email confirmation:', error);
      } else {
        console.log('Email confirmation successful:', data);

        // Create user profile using centralized service
        await ensureUserProfile('email-confirmation');
      }
    } catch (err) {
      console.error('Unexpected error in verifyOtp:', err);
    }
  }, []);

  // Helper function to handle successful email confirmation via deep link
  const handleEmailConfirmed = useCallback(async () => {
    try {
      console.log('🔗 Deep link: Email confirmation successful - refreshing auth state');

      // Trigger auth state refresh
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session after deep link:', error);
      } else if (session?.user?.email_confirmed_at) {
        console.log('✅ Deep link: User authenticated and verified:', session.user.id);

        // Create user profile if needed (redundant safety)
        await ensureUserProfile('deep-link-verified');

        // The AuthContext and EmailConfirmationScreen will detect this state change
        // and handle the UI update automatically
      } else {
        console.log('Deep link processed but user not verified yet');
      }
    } catch (err) {
      console.error('Error handling deep link email confirmation:', err);
    }
  }, []);

  const handleDeepLink = useCallback(({ url }: { url: string }) => {
    console.log('🔗 Deep link received:', url);

    try {
      const parsedURL = Linking.parse(url);
      console.log('🔍 Parsed URL:', parsedURL);

      // Handle auth callback with tokens or session code from web callback
      if (parsedURL.path === '/auth/callback') {
        const { queryParams } = parsedURL;
        console.log('🔑 Auth callback query params:', queryParams);

        // Priority 1: Check for secure session code (new secure method)
        if (queryParams?.session_code) {
          console.log('🔐 Processing secure session code from web callback deep link...', {
            hasSessionCode: !!queryParams.session_code,
            sessionCodeLength: queryParams.session_code?.length,
            type: queryParams.type // Safe to log - not sensitive
          });

          // Process secure session code
          processSessionCode(queryParams.session_code as string);
        }
        // Priority 2: Fallback to direct tokens (legacy method)
        else if (queryParams?.access_token && queryParams?.refresh_token) {
          console.log('🔗 Processing auth tokens from web callback deep link (fallback)...', {
            hasAccessToken: !!queryParams.access_token,
            hasRefreshToken: !!queryParams.refresh_token,
            accessTokenLength: queryParams.access_token?.length,
            refreshTokenLength: queryParams.refresh_token?.length,
            type: queryParams.type // Safe to log - not sensitive
          });

          // Process auth tokens from web callback (fallback)
          processAuthTokens(queryParams.access_token as string, queryParams.refresh_token as string);
        }
        // Priority 3: Email confirmation flow
        else if (queryParams?.token_hash && queryParams?.type) {
          console.log('🔗 Processing email confirmation from deep link...');

          // Process email confirmation asynchronously
          processEmailConfirmation(queryParams.token_hash as string, queryParams.type as string);
        } else {
          console.log('ℹ️ Auth callback received but no tokens or session code found in query params');
        }
      }

      // Handle email confirmation success callback
      if (parsedURL.path === '/auth/confirmed') {
        console.log('Email confirmation success callback received');
        handleEmailConfirmed();
      }
    } catch (error) {
      console.error('Error parsing deep link:', error);
    }
  }, [processAuthTokens, processEmailConfirmation, processSessionCode, handleEmailConfirmed]);

  const checkInitialURL = useCallback(async () => {
    try {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        handleDeepLink({ url: initialURL });
      }
    } catch (error) {
      console.error('Error checking initial URL:', error);
    }
  }, [handleDeepLink]);

  useEffect(() => {
    let subscription: any = null;

    const setupDeepLinks = () => {
      try {
        // Handle deep links when the app is already running
        subscription = Linking.addEventListener('url', handleDeepLink);

        // Check initial URL asynchronously without blocking
        checkInitialURL();
      } catch (error) {
        console.error('Error setting up deep links:', error);
      }
    };

    setupDeepLinks();

    return () => {
      subscription?.remove();
    };
  }, [handleDeepLink, checkInitialURL]);

  return <>{children}</>;
};

export default DeepLinkHandler;