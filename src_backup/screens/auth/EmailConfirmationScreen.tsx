/**
 * EmailConfirmationScreen - Modern Email Verification Flow
 *
 * Follows modern UX best practices:
 * 1. Clear "email sent" confirmation with instructions
 * 2. Smart detection when user returns from email
 * 3. No immediate aggressive polling
 * 4. Progressive disclosure and helpful actions
 * 5. Professional messaging and clear visual hierarchy
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
  AppState,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui';
import { theme } from '../../theme';
import { supabase } from '../../services/supabase';
import { ensureUserProfile } from '../../services/profileCreation';

interface EmailConfirmationScreenProps {
  route?: {
    params: {
      email: string;
      needsConfirmation?: boolean;
    };
  };
}

type VerificationState = 'initial' | 'checking' | 'verified' | 'help';

const EmailConfirmationScreen: React.FC<EmailConfirmationScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();

  // State management
  const [verificationState, setVerificationState] = useState<VerificationState>('initial');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [showHelpSection, setShowHelpSection] = useState(false);

  // Refs for cleanup
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appStateSubscriptionRef = useRef<any>(null);
  const hasUserLeftAppRef = useRef(false);
  const initialLoadTimeRef = useRef(Date.now());

  // Get email from route params
  const email = route?.params?.email || 'your email';

  // Auto-redirect when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email_confirmed_at && verificationState !== 'verified') {
      console.log('✅ EmailConfirmationScreen: User authenticated and verified, redirecting...');
      setVerificationState('verified');

      // Brief delay to show success state before redirect
      setTimeout(() => {
        navigation.navigate('Home' as never);
      }, 1500);
    }
  }, [isAuthenticated, user?.email_confirmed_at, navigation, verificationState]);

  // Smart verification detection - only start checking when user likely returned from email
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log('📱 App state changed:', nextAppState);

      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // User left the app - they might be checking email
        hasUserLeftAppRef.current = true;
        console.log('👋 User left app - likely checking email');
      } else if (nextAppState === 'active' && hasUserLeftAppRef.current) {
        // User returned to app after leaving - check verification
        console.log('👋 User returned to app - checking verification');
        checkEmailVerification();
      }
    };

    // Subscribe to app state changes
    appStateSubscriptionRef.current = AppState.addEventListener('change', handleAppStateChange);

    // Also start a gentle check after reasonable delay (user has had time to see instructions)
    verificationTimeoutRef.current = setTimeout(() => {
      if (verificationState === 'initial') {
        console.log('⏰ Starting gentle verification check after delay');
        checkEmailVerification();
      }
    }, 10000); // 10 seconds - reasonable time to read instructions

    // Cleanup function
    return () => {
      if (appStateSubscriptionRef.current) {
        appStateSubscriptionRef.current.remove();
      }
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, [verificationState]);

  // Single verification check function
  const checkEmailVerification = async () => {
    if (verificationState === 'verified' || verificationState === 'checking') {
      return; // Already verified or currently checking
    }

    setVerificationState('checking');

    try {
      console.log('🔄 Checking email verification...');

      // Check current session first
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email_confirmed_at) {
        console.log('✅ Email verification detected via session!');
        await ensureUserProfile('verification-check');
        setVerificationState('verified');
        return;
      }

      // Also check auth.users table directly as backup
      const { data: verificationCheck } = await supabase.rpc('check_email_verification', {
        check_email: email
      });

      if (verificationCheck?.email_verified) {
        console.log('✅ Email verification detected via direct check!');
        await supabase.auth.refreshSession();
        setVerificationState('verified');
        return;
      }

      // If we've been showing instructions for more than 30 seconds, show help
      const timeSinceLoad = Date.now() - initialLoadTimeRef.current;
      if (timeSinceLoad > 30000) {
        setShowHelpSection(true);
      }

      // Return to initial state after check
      setVerificationState('initial');

    } catch (error) {
      console.error('EmailConfirmationScreen: Verification check error:', error);
      setVerificationState('initial');
    }
  };

  // Handle resend email functionality
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    try {
      console.log('📧 Resending verification email...');

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Resend error:', error);
      } else {
        console.log('✅ Verification email resent successfully');

        // Start cooldown
        setResendCooldown(60);
        const cooldownInterval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(cooldownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      console.error('Unexpected resend error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  // Handle opening email app
  const handleOpenEmailApp = async () => {
    try {
      console.log('📱 Opening email app...');

      let emailUrl = '';

      if (Platform.OS === 'ios') {
        // For iOS, try the Mail app first
        emailUrl = 'message://';
      } else {
        // For Android, try the generic email intent
        emailUrl = 'mailto:';
      }

      const supported = await Linking.canOpenURL(emailUrl);

      if (supported) {
        await Linking.openURL(emailUrl);
        console.log('✅ Email app opened successfully');
      } else {
        // Fallback to web email providers if no native app
        const webEmailUrls = [
          'https://gmail.com',
          'https://outlook.com',
          'https://mail.yahoo.com'
        ];

        // Try opening Gmail web first as it's most common
        await Linking.openURL(webEmailUrls[0]);
        console.log('📧 Opened web email client as fallback');
      }
    } catch (error) {
      console.error('Error opening email app:', error);
      // Silent fail - not critical functionality
    }
  };

  // Helper function to manually trigger verification check
  const handleCheckNow = () => {
    console.log('🔄 Manual verification check triggered');
    checkEmailVerification();
  };

  // Get the appropriate content based on current state
  const getHeaderContent = () => {
    switch (verificationState) {
      case 'verified':
        return {
          icon: '✅',
          title: '¡Email Verificado!',
          subtitle: 'Tu cuenta ha sido verificada exitosamente',
          showEmail: false,
        };
      case 'checking':
        return {
          icon: '🔍',
          title: 'Verificando...',
          subtitle: 'Confirmando tu verificación de email',
          showEmail: false,
        };
      default:
        return {
          icon: '📧',
          title: 'Revisa tu Email',
          subtitle: 'Te hemos enviado un enlace de verificación a:',
          showEmail: true,
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header - Clear email sent confirmation */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.emailIcon}>{headerContent.icon}</Text>
          </View>

          <Text style={styles.title}>{headerContent.title}</Text>
          <Text style={styles.subtitle}>{headerContent.subtitle}</Text>

          {headerContent.showEmail && (
            <Text style={styles.email}>{email}</Text>
          )}
        </View>

        {/* Main Content - Progressive disclosure based on state */}
        <View style={styles.mainContent}>
          {verificationState === 'verified' ? (
            // Success State
            <View style={styles.successSection}>
              <Text style={styles.successText}>
                Redirigiendo a la aplicación...
              </Text>
              <ActivityIndicator
                size="large"
                color={theme.colors.success[600]}
                style={styles.loader}
              />
            </View>
          ) : verificationState === 'checking' ? (
            // Checking State
            <View style={styles.checkingSection}>
              <ActivityIndicator
                size="large"
                color={theme.colors.primary[600]}
                style={styles.loader}
              />
              <Text style={styles.checkingText}>
                Verificando tu email...
              </Text>
            </View>
          ) : (
            // Initial State - Clear instructions
            <>
              {/* Step-by-step instructions */}
              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsTitle}>Para continuar:</Text>
                <View style={styles.stepsList}>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>1</Text>
                    <Text style={styles.stepText}>Abre tu aplicación de email o revisa tu bandeja de entrada</Text>
                  </View>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>2</Text>
                    <Text style={styles.stepText}>Busca el email de Manito (revisa spam si es necesario)</Text>
                  </View>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>3</Text>
                    <Text style={styles.stepText}>Haz clic en el enlace "Verificar Email" del mensaje</Text>
                  </View>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>4</Text>
                    <Text style={styles.stepText}>Regresa a la app - la verificación será automática</Text>
                  </View>
                </View>
              </View>

              {/* Primary Actions */}
              <View style={styles.primaryActions}>
                <Button
                  title="📱 Abrir App de Email"
                  onPress={handleOpenEmailApp}
                  variant="primary"
                  size="large"
                  fullWidth
                  style={styles.openEmailButton}
                />
              </View>

              {/* Secondary Actions */}
              <View style={styles.secondaryActions}>
                <Button
                  title="🔄 Verificar Ahora"
                  onPress={handleCheckNow}
                  variant="outline"
                  size="medium"
                  style={styles.checkButton}
                />

                <Button
                  title={
                    resendCooldown > 0
                      ? `Reenviar en ${resendCooldown}s`
                      : '📧 Reenviar Email'
                  }
                  onPress={handleResendEmail}
                  variant="outline"
                  size="medium"
                  disabled={resendCooldown > 0}
                  loading={resendLoading}
                  style={styles.resendButton}
                />
              </View>

              {/* Help Section - Progressive disclosure */}
              {showHelpSection && (
                <View style={styles.helpSection}>
                  <Text style={styles.helpTitle}>¿Necesitas ayuda?</Text>
                  <View style={styles.helpList}>
                    <Text style={styles.helpItem}>• Revisa tu carpeta de spam o correo no deseado</Text>
                    <Text style={styles.helpItem}>• Verifica que la dirección {email} sea correcta</Text>
                    <Text style={styles.helpItem}>• El email puede demorar unos minutos en llegar</Text>
                    <Text style={styles.helpItem}>• Asegúrate de tener conexión a internet</Text>
                  </View>

                  <View style={styles.helpActions}>
                    <Text style={styles.helpFooter}>
                      Si continúas teniendo problemas, puedes reenviar el email de verificación.
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing[6],
    justifyContent: 'flex-start',
    paddingTop: theme.spacing[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  emailIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[900],
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: theme.spacing[2],
    lineHeight: 24,
  },
  email: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginTop: theme.spacing[2],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
  },
  mainContent: {
    flex: 1,
  },
  // Success state
  successSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing[8],
  },
  successText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.success[700],
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  // Checking state
  checkingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing[8],
  },
  checkingText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[700],
    textAlign: 'center',
    marginTop: theme.spacing[4],
  },
  // Instructions section
  instructionsSection: {
    marginBottom: theme.spacing[8],
  },
  instructionsTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[4],
  },
  stepsList: {
    gap: theme.spacing[4],
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[600],
    color: 'white',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[700],
    lineHeight: 22,
  },
  // Actions
  primaryActions: {
    marginBottom: theme.spacing[4],
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  openEmailButton: {
    backgroundColor: theme.colors.primary[600],
  },
  checkButton: {
    flex: 1,
    borderColor: theme.colors.primary[300],
  },
  resendButton: {
    flex: 1,
    borderColor: theme.colors.neutral[300],
  },
  // Help section
  helpSection: {
    marginTop: theme.spacing[4],
    padding: theme.spacing[5],
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
  },
  helpTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.blue[800],
    marginBottom: theme.spacing[3],
  },
  helpList: {
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  helpItem: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.blue[700],
    lineHeight: 20,
  },
  helpActions: {
    marginTop: theme.spacing[2],
  },
  helpFooter: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.blue[600],
    lineHeight: 18,
    fontStyle: 'italic',
  },
  loader: {
    marginVertical: theme.spacing[2],
  },
});

export default EmailConfirmationScreen;