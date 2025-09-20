/**
 * UNIVERSAL AUTH HANDLER - META/REDDIT STANDARD
 * Handles all auth verification deep links with tokens
 * - auth/verified?access_token=...
 * - auth/callback?access_token=...
 * - auth/email-confirmed (legacy)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useEnterpriseAuth';

interface AuthHandlerRouteParams {
  // URL params from deep link
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  token_type?: string;
  auth_method?: string;
  flow_type?: string;
  verified?: string;
  // Legacy support
  token_hash?: string;
  type?: string;
}

type AuthHandlerScreenRouteProp = RouteProp<{
  AuthHandler: AuthHandlerRouteParams;
}, 'AuthHandler'>;

interface AuthState {
  status: 'loading' | 'success' | 'error' | 'retry';
  message: string;
  error?: string;
  retryCount: number;
}

const colors = {
  primary: '#2563EB',
  secondary: '#10B981',
  background: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const UniversalAuthHandlerScreen: React.FC<{
  navigation: { replace: (screen: string) => void };
}> = ({ navigation }) => {
  const route = useRoute<AuthHandlerScreenRouteProp>();
  const { user, isAuthenticated, isReady } = useAuth();
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    message: 'Procesando verificación...',
    retryCount: 0,
  });

  // Extract tokens from URL params (passed via deep link)
  const urlParams = route.params || {};
  const {
    access_token,
    refresh_token,
    expires_at,
    token_hash,
    type,
    verified,
  } = urlParams;

  console.log('🔗 UniversalAuthHandler: Received params:', {
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    hasTokenHash: !!token_hash,
    type,
    verified,
    authMethod: urlParams.auth_method,
    flowType: urlParams.flow_type,
  });

  /**
   * ENTERPRISE PATTERN: Handle verification signals (not tokens)
   * Meta/Stripe approach: Deep links signal verification happened, app establishes own session
   */
  const processVerificationSignal = async (retryAttempt = 0) => {
    try {
      setAuthState({
        status: 'loading',
        message: retryAttempt > 0
          ? `Reintentando verificación... (${retryAttempt + 1}/3)`
          : 'Procesando verificación...',
        retryCount: retryAttempt,
      });

      // ENTERPRISE SECURITY: Never use tokens from deep links
      // Instead, check if verification happened server-side
      console.log('🔗 Enterprise: Checking verification status (not using deep link tokens)');

      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        // No existing session - user needs to sign in normally
        console.log('📱 Enterprise: No session found - user needs to sign in');

        setAuthState({
          status: 'success',
          message: '¡Email verificado!',
          retryCount: retryAttempt,
        });

        // Navigate to sign in screen where verified users can log in
        setTimeout(() => {
          navigation.replace('SignIn');
        }, 2000);
        return;
      }

      // Check if email is verified
      if (currentUser.email_confirmed_at) {
        console.log('✅ Enterprise: Email verification confirmed', {
          userId: currentUser.id,
          email: currentUser.email,
          verifiedAt: currentUser.email_confirmed_at,
        });

        setAuthState({
          status: 'success',
          message: '¡Verificación exitosa!',
          retryCount: retryAttempt,
        });

        // ENTERPRISE PATTERN: Let useEnterpriseAuth polling handle the transition
        // The hook will detect verification and update app state automatically
        console.log('✅ Enterprise: Verification confirmed - useEnterpriseAuth will handle navigation');
      } else {
        // Still not verified - user should continue waiting
        console.log('⏳ Enterprise: Email not yet verified - redirecting to pending screen');

        setAuthState({
          status: 'success',
          message: 'Procesando verificación...',
          retryCount: retryAttempt,
        });

        setTimeout(() => {
          navigation.replace('EmailVerificationPending');
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Enterprise: Verification check error:', error);

      // ENTERPRISE PATTERN: Exponential backoff retry
      if (retryAttempt < 2) {
        const delay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s

        setAuthState({
          status: 'retry',
          message: `Error de conexión. Reintentando en ${delay / 1000}s...`,
          error: error instanceof Error ? error.message : 'Error desconocido',
          retryCount: retryAttempt,
        });

        setTimeout(() => {
          processVerificationSignal(retryAttempt + 1);
        }, delay);
      } else {
        setAuthState({
          status: 'error',
          message: 'No se pudo verificar el estado de la cuenta',
          error: error instanceof Error ? error.message : 'Error desconocido',
          retryCount: retryAttempt,
        });
      }
    }
  };

  /**
   * Initialize verification signal processing on mount
   */
  useEffect(() => {
    // ENTERPRISE PATTERN: Process verification signals (not tokens)
    if (verified === 'true' || token_hash || access_token) {
      console.log('🔗 Enterprise: Processing verification signal from deep link');
      processVerificationSignal();
    } else {
      // No verification signal, just show success (legacy flow)
      setAuthState({
        status: 'success',
        message: '¡Enlace procesado!',
        retryCount: 0,
      });

      // Navigate back to appropriate screen
      setTimeout(() => {
        navigation.replace('Auth');
      }, 2000);
    }
  }, []);

  /**
   * Handle manual retry
   */
  const handleRetry = () => {
    processVerificationSignal(0);
  };

  /**
   * Render different states
   */
  const renderContent = () => {
    switch (authState.status) {
      case 'loading':
      case 'retry':
        return (
          <>
            <View style={styles.iconContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={styles.title}>Verificando cuenta</Text>
            <Text style={styles.subtitle}>{authState.message}</Text>
          </>
        );

      case 'success':
        return (
          <>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✅</Text>
            </View>
            <Text style={styles.title}>¡Verificación exitosa!</Text>
            <Text style={styles.subtitle}>
              Tu cuenta ha sido verificada exitosamente
            </Text>
            <Card style={styles.successCard}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>¡Bienvenido a Manito!</Text>
                <Text style={styles.cardDescription}>
                  Tu cuenta está lista para conectar con profesionales de confianza.
                </Text>
              </View>
            </Card>
          </>
        );

      case 'error':
        return (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.error }]}>
              <Text style={styles.icon}>❌</Text>
            </View>
            <Text style={styles.title}>Error de verificación</Text>
            <Text style={styles.subtitle}>{authState.message}</Text>

            {authState.error && (
              <Card style={styles.errorCard}>
                <Text style={styles.errorText}>
                  Detalles: {authState.error}
                </Text>
              </Card>
            )}

            <Button
              title="Reintentar verificación"
              onPress={handleRetry}
              style={styles.retryButton}
            />

            <Button
              title="Ir al inicio"
              onPress={() => navigation.replace('Auth')}
              variant="outline"
              style={styles.homeButton}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  successCard: {
    width: '100%',
    marginBottom: 30,
  },
  errorCard: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#FEF2F2',
    borderColor: colors.error,
    borderWidth: 1,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: colors.primary,
  },
  homeButton: {
    width: '100%',
  },
});