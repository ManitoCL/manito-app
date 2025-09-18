/**
 * Real-time Cross-Device Authentication Hook
 *
 * Monitors authentication state changes in real-time across ALL devices using Supabase realtime.
 * Works universally: Mobile (iPhone/Android/etc.) ↔ Computer (Windows/Mac/Linux/etc.)
 *
 * Example workflows:
 * - iPhone → Windows laptop → iPhone
 * - Android → MacBook → Android
 * - Samsung → Chromebook → Samsung
 * - Any mobile → Any computer → Any mobile
 */

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ensureUserProfile } from '../services/profileCreation';

interface UseRealtimeAuthOptions {
  onEmailVerified?: () => void;
  onAuthStateChange?: (event: string) => void;
  enableCrossDeviceSync?: boolean;
}

export const useRealtimeAuth = (options: UseRealtimeAuthOptions = {}) => {
  const { user, isAuthenticated } = useAuth();
  const {
    onEmailVerified,
    onAuthStateChange,
    enableCrossDeviceSync = true
  } = options;

  const lastCheckRef = useRef<number>(0);
  const verificationChannelRef = useRef<any>(null);
  const appStateRef = useRef(AppState.currentState);

  // Real-time session monitoring for cross-device verification
  useEffect(() => {
    if (!user?.id || !enableCrossDeviceSync) return;

    console.log('🔄 Setting up real-time cross-device auth monitoring for user:', user.id);

    // Subscribe to user authentication changes in real-time
    const channel = supabase
      .channel(`auth_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'auth',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔔 Real-time auth change detected:', {
            event: payload.eventType,
            emailConfirmed: !!payload.new?.email_confirmed_at,
            timestamp: new Date().toISOString()
          });

          // Check if email was just verified
          if (payload.new?.email_confirmed_at && !payload.old?.email_confirmed_at) {
            console.log('✅ Email verification detected via real-time sync!');

            try {
              // Refresh the current session to get updated user data
              const { data: { session }, error } = await supabase.auth.refreshSession();

              if (error) {
                console.error('Error refreshing session after email verification:', error);
                return;
              }

              if (session?.user?.email_confirmed_at) {
                // Ensure user profile exists
                await ensureUserProfile('realtime-sync');

                // Trigger callback for UI updates
                onEmailVerified?.();
                onAuthStateChange?.('EMAIL_VERIFIED');
              }
            } catch (error) {
              console.error('Error processing real-time email verification:', error);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time auth subscription status:', status);
      });

    verificationChannelRef.current = channel;

    return () => {
      console.log('🔌 Cleaning up real-time auth monitoring');
      channel.unsubscribe();
      verificationChannelRef.current = null;
    };
  }, [user?.id, enableCrossDeviceSync, onEmailVerified, onAuthStateChange]);

  // Fallback app state monitoring (only as backup, not primary detection)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      console.log('📱 App state changed:', {
        from: previousState,
        to: nextAppState,
        timestamp: new Date().toISOString()
      });

      // ONLY as fallback if real-time subscription fails
      // Real-time subscription should handle verification immediately
      if (nextAppState === 'active' && previousState.match(/inactive|background/)) {
        const timeSinceLastCheck = Date.now() - lastCheckRef.current;

        // Only check if it's been more than 30 seconds (fallback only)
        if (timeSinceLastCheck > 30000) {
          console.log('🔄 Fallback check on app focus (real-time should have caught this)...');
          lastCheckRef.current = Date.now();

          try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
              console.error('Error in fallback session check:', error);
              return;
            }

            if (session?.user?.email_confirmed_at && !isAuthenticated) {
              console.log('✅ Fallback verification detected (real-time missed this)');
              await ensureUserProfile('fallback-app-focus');
              onEmailVerified?.();
              onAuthStateChange?.('FALLBACK_VERIFIED');
            }
          } catch (error) {
            console.error('Error in fallback verification check:', error);
          }
        }
      }
    };

    // Set up app state listener (as fallback only)
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, onEmailVerified, onAuthStateChange]);

  // Manual verification check function
  const checkVerificationStatus = async (): Promise<boolean> => {
    try {
      console.log('🔍 Manual verification status check...');

      const { data: { session }, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Error during manual verification check:', error);
        return false;
      }

      if (session?.user?.email_confirmed_at) {
        console.log('✅ Manual verification check: Email is verified!');

        // Ensure profile exists
        await ensureUserProfile('manual-verification-check');

        // Trigger callbacks
        onEmailVerified?.();
        onAuthStateChange?.('MANUAL_CHECK_VERIFIED');

        return true;
      }

      console.log('ℹ️ Manual verification check: Email not yet verified');
      return false;
    } catch (error) {
      console.error('Error in manual verification check:', error);
      return false;
    }
  };

  // Cleanup function for manual use
  const cleanup = () => {
    if (verificationChannelRef.current) {
      verificationChannelRef.current.unsubscribe();
      verificationChannelRef.current = null;
    }
  };

  return {
    checkVerificationStatus,
    cleanup,
    isMonitoring: !!verificationChannelRef.current,
  };
};