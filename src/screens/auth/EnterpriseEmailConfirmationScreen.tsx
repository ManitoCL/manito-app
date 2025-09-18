/**
 * Enterprise Email Confirmation Screen - Redux-First Pattern
 * Uses enterprise auth actions instead of direct Supabase calls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing, borderRadius } from '../../design/tokens';
import { useEnterpriseAuth, useAuthActions } from '../../hooks/useEnterpriseAuth';
import { UserType } from '../../types';
import { supabase } from '../../services/supabase';

interface EnterpriseEmailConfirmationScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    replace: (screen: string, params?: any) => void;
  };
  route: {
    params: {
      email: string;
      userType: UserType;
      isSignUp: boolean;
      password?: string;
    };
  };
}

export const EnterpriseEmailConfirmationScreen: React.FC<EnterpriseEmailConfirmationScreenProps> = ({
  navigation,
  route,
}) => {
  const { email, userType, isSignUp, password } = route.params;
  const {
    user,
    session,
    isEmailVerified,
    isAuthenticated,
    isLoading,
    error
  } = useEnterpriseAuth();

  const {
    resendVerification,
    signIn,
    clearError
  } = useAuthActions();

  const [isResendLoading, setIsResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  // Clear any errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Navigate away when user is authenticated and verified
  useEffect(() => {
    if (isAuthenticated && isEmailVerified) {
      console.log('✅ EnterpriseEmailConfirmationScreen: User verified, navigating...');
      setIsPolling(false);
      navigation.replace('EmailConfirmed');
    }
  }, [isAuthenticated, isEmailVerified, navigation]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Check verification status when app regains focus (Instagram approach)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('📱 App became active - checking email verification status');
        checkEmailVerification();
      }
    };

    const checkEmailVerification = async () => {
      if (!password) {
        console.log('📧 No password available for verification check');
        return;
      }

      try {
        console.log('🔍 Checking if email verification completed by attempting Redux sign in...');

        // Use Redux signIn which handles all the verification logic
        await signIn({
          email: email,
          password: password,
        });

        // If successful, the useEffect above will handle navigation
        console.log('✅ Email verification check via Redux completed');

      } catch (error) {
        // Expected if email not verified yet - no need to show error to user
        console.log('📧 Email verification check:', error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription?.remove();
  }, [email, password, signIn]);

  // OAUTH 2.1 STANDARD: Auth detection via deep links (handled by middleware)
  useEffect(() => {
    console.log('📧 Email verification screen ready - deep links will trigger authentication automatically');
    console.log('ℹ️ Verification flow: Email link → Frontend → Deep link → Auth middleware → Profile creation');
    setIsPolling(true); // Show monitoring status

    // Cleanup when verification completes
    return () => {
      setIsPolling(false);
    };
  }, [email]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    setIsResendLoading(true);

    try {
      console.log('🔄 Resending verification email via Redux...');

      await resendVerification(email);

      Alert.alert(
        'Email Reenviado',
        'Hemos enviado un nuevo email de confirmación. Revisa tu bandeja de entrada.'
      );

      setResendCooldown(60); // 60 second cooldown

    } catch (error) {
      console.error('❌ Redux resend verification error:', error);

      const errorMessage = typeof error === 'string' ? error : 'Error al reenviar el email';
      Alert.alert('Error', errorMessage);

    } finally {
      setIsResendLoading(false);
    }
  };

  const handleOpenEmailApp = () => {
    // Try to open the default email app
    Linking.openURL('mailto:').catch(() => {
      Alert.alert(
        'No se pudo abrir',
        'No se pudo abrir la aplicación de email. Por favor, revisa tu bandeja de entrada manualmente.'
      );
    });
  };

  const getEmailProvider = () => {
    const domain = email.split('@')[1]?.toLowerCase();

    if (domain?.includes('gmail')) return 'Gmail';
    if (domain?.includes('outlook') || domain?.includes('hotmail')) return 'Outlook';
    if (domain?.includes('yahoo')) return 'Yahoo';

    return 'tu aplicación de email';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>

          <Text style={styles.title}>Confirma tu Email</Text>
          <Text style={styles.subtitle}>
            Hemos enviado un enlace de confirmación a:
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Instructions Card */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.cardTitle}>Instrucciones</Text>

          <View style={styles.stepsList}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                Revisa tu bandeja de entrada en {getEmailProvider()}
              </Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                Busca un email de Manito con el asunto "Confirma tu cuenta"
              </Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                Haz clic en el enlace de confirmación
              </Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>
                ¡Listo! Tu cuenta será activada automáticamente
              </Text>
            </View>
          </View>

          <View style={styles.helpText}>
            <Text style={styles.helpTitle}>¿No encuentras el email?</Text>
            <Text style={styles.helpDescription}>
              • Revisa tu carpeta de spam o correo no deseado{'\n'}
              • Verifica que escribiste correctamente tu email{'\n'}
              • El email puede tardar unos minutos en llegar
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Abrir Email"
            onPress={handleOpenEmailApp}
            style={styles.actionButton}
            disabled={isLoading}
          />

          <Button
            title={
              resendCooldown > 0
                ? `Reenviar en ${resendCooldown}s`
                : 'Reenviar Email'
            }
            variant="secondary"
            onPress={handleResendEmail}
            loading={isResendLoading}
            disabled={resendCooldown > 0 || isLoading}
            style={styles.actionButton}
          />
        </View>

        {/* Status Indicator */}
        <Card style={styles.statusCard}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>
              {isLoading ? '⏳' : isPolling ? '🔄' : '📧'}
            </Text>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                {isLoading
                  ? 'Verificando...'
                  : isPolling
                    ? 'Esperando verificación...'
                    : 'Verificación completa'
                }
              </Text>
              <Text style={styles.statusDescription}>
                {isLoading
                  ? 'Verificando tu email automáticamente...'
                  : isPolling
                    ? 'Haz clic en el enlace de tu email. Te redirigiremos automáticamente a la app cuando verifiques.'
                    : 'Verificación completa. Serás redirigido automáticamente.'
                }
              </Text>
            </View>
          </View>
        </Card>

        {/* User Type Specific Message */}
        {userType === 'provider' && (
          <Card style={styles.providerCard}>
            <Text style={styles.providerTitle}>
              👨‍🔧 ¡Bienvenido, Profesional!
            </Text>
            <Text style={styles.providerText}>
              Una vez confirmado tu email, podrás completar tu perfil profesional
              y comenzar a recibir solicitudes de trabajo.
            </Text>
          </Card>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Email incorrecto?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate('SignUp', { userType })}
            >
              Cambiar Email
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
  },
  header: {
    alignItems: 'center',
    marginTop: spacing[10],
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.fontSize['2xl'].size,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base.size,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  email: {
    fontSize: typography.fontSize.base.size,
    fontWeight: '600',
    color: colors.primary[600],
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: typography.fontSize.sm.size,
    fontWeight: '500',
  },
  instructionsCard: {
    marginBottom: spacing[5],
  },
  cardTitle: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[4],
  },
  stepsList: {
    marginBottom: spacing[5],
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[600],
    color: colors.surface.primary,
    fontSize: typography.fontSize.xs.size,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: spacing[3],
    lineHeight: 24,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.sm.size,
    color: colors.neutral[700],
    lineHeight: typography.fontSize.sm.lineHeight,
  },
  helpText: {
    marginTop: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
  },
  helpTitle: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  helpDescription: {
    fontSize: typography.fontSize.xs.size,
    color: colors.neutral[600],
    lineHeight: typography.fontSize.xs.lineHeight + 2,
  },
  actionsContainer: {
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  actionButton: {
    // Button styles are handled by the Button component
  },
  statusCard: {
    marginBottom: spacing[5],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: spacing[3],
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  statusDescription: {
    fontSize: typography.fontSize.xs.size,
    color: colors.neutral[600],
    lineHeight: typography.fontSize.xs.lineHeight,
  },
  providerCard: {
    marginBottom: spacing[5],
    backgroundColor: '#FEF3C7', // Light yellow background
  },
  providerTitle: {
    fontSize: typography.fontSize.base.size,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  providerText: {
    fontSize: typography.fontSize.sm.size,
    color: colors.neutral[700],
    lineHeight: typography.fontSize.sm.lineHeight,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing[5],
  },
  footerText: {
    fontSize: typography.fontSize.sm.size,
    color: colors.neutral[600],
  },
  footerLink: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});