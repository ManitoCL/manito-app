/**
 * Enterprise Email Verification Pending Screen
 * Modern UX pattern following Meta/Stripe/Atlassian standards
 * Optimized for Chilean market with device-agnostic messaging
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';
import { Button } from '../../components/ui';
import { analytics } from '../../services/analytics';

interface RouteParams {
  email: string;
  userType: 'customer' | 'provider';
}

export const EmailVerificationPendingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, userType } = route.params as RouteParams;

  const { authStatus, isLoading, verificationDetected, startVerificationPolling, stopVerificationPolling } = useEnterpriseAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isPolling, setIsPolling] = useState(true);

  // Handle verification detection
  useEffect(() => {
    if (verificationDetected) {
      // Analytics: Track verification completed
      analytics.trackVerificationCompleted(email, 0); // TODO: Calculate actual time

      // ✅ Verification detected! Show sign-in prompt
      Alert.alert(
        '¡Correo verificado!',
        'Tu cuenta ha sido verificada exitosamente. Ahora debes iniciar sesión con tu contraseña para acceder a la app.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => {
              stopVerificationPolling();
              setIsPolling(false);
              // Navigate to sign-in screen with email pre-filled
              navigation.navigate('Login' as never, { email } as never);
            }
          }
        ]
      );
      return;
    }
  }, [verificationDetected, email, navigation, stopVerificationPolling]);

  // Handle authenticated state
  useEffect(() => {
    if (authStatus === 'authenticated_pending_profile' || authStatus === 'authenticated_ready') {
      // ✅ User is signed in! Auto-redirect
      Alert.alert(
        '¡Bienvenido!',
        'Has iniciado sesión exitosamente. Redirigiéndote...',
        [{ text: 'Continuar', onPress: () => {} }]
      );
      // Navigation will be handled by AppNavigator based on authStatus
      return;
    }
  }, [authStatus]);

  // Start verification polling on mount
  useEffect(() => {
    console.log('🚀 Starting device-agnostic verification polling for:', email);

    // Analytics: Track verification polling started
    analytics.trackVerificationPollingStarted(email);

    startVerificationPolling(email);

    // Cleanup on unmount
    return () => {
      stopVerificationPolling();
    };
  }, [email, startVerificationPolling, stopVerificationPolling]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      // Call edge function to resend verification email
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/enterprise-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          resend: true, // Flag to indicate this is a resend request
        }),
      });

      // Debug logging for troubleshooting
      console.log('📧 Resend response status:', response.status);
      console.log('📧 Resend response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resend failed - Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📧 Resend result:', result);

      if (result.success) {
        // Analytics: Track email resent
        analytics.trackVerificationEmailResent(email, 1); // TODO: Track actual attempt number

        Alert.alert(
          'Correo reenviado',
          'Te hemos enviado un nuevo enlace de verificación.',
          [{ text: 'Entendido' }]
        );
        setResendCooldown(60); // 60 second cooldown
      } else {
        throw new Error(result.error || 'Error al reenviar correo');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No pudimos reenviar el correo. Inténtalo nuevamente.',
        [{ text: 'Entendido' }]
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    Alert.alert(
      'Cambiar correo',
      '¿Quieres volver al formulario para corregir tu email?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cambiar',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const formatEmail = (email: string) => {
    // Highlight domain for better readability
    const [local, domain] = email.split('@');
    return { local, domain };
  };

  const { local, domain } = formatEmail(email);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>📧</Text>
          <Text style={styles.title}>Te enviamos un enlace de verificación</Text>
        </View>

        {/* Email Display */}
        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>Enviado a:</Text>
          <View style={styles.emailDisplay}>
            <Text style={styles.emailText}>
              {local}<Text style={styles.emailDomain}>@{domain}</Text>
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            Revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
          </Text>
          <Text style={styles.deviceNote}>
            💡 Puedes abrir este enlace en cualquier dispositivo
          </Text>
        </View>

        {/* Security Messaging */}
        <View style={styles.securityContainer}>
          <Text style={styles.securityTitle}>🔐 Información de Seguridad</Text>
          <Text style={styles.securityText}>
            • Tu enlace de verificación expira en 15 minutos por seguridad
          </Text>
          <Text style={styles.securityText}>
            • Después de verificar, deberás iniciar sesión con tu contraseña
          </Text>

          {userType === 'provider' && (
            <View style={styles.providerWarning}>
              <Text style={styles.providerWarningTitle}>⚠️ Aviso para Proveedores</Text>
              <Text style={styles.providerWarningText}>
                Como proveedor de servicios, mantén tu enlace de verificación privado.
                No lo compartas con nadie por tu seguridad y la de tus futuros clientes.
              </Text>
            </View>
          )}
        </View>

        {/* Status Indicator */}
        {isPolling && !verificationDetected && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}>Verificando automáticamente...</Text>
          </View>
        )}

        {verificationDetected && (
          <View style={styles.verifiedContainer}>
            <Text style={styles.verifiedText}>✅ ¡Verificación exitosa!</Text>
            <Text style={styles.verifiedSubtext}>Haz clic en "Iniciar Sesión" para continuar</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title={
              isResending
                ? "Reenviando..."
                : resendCooldown > 0
                  ? `Reenviar en ${resendCooldown}s`
                  : "Reenviar correo"
            }
            onPress={handleResendEmail}
            disabled={isResending || resendCooldown > 0}
            variant={resendCooldown > 0 ? "outline" : "primary"}
            style={styles.resendButton}
          />

          <TouchableOpacity
            onPress={handleChangeEmail}
            style={styles.changeEmailButton}
          >
            <Text style={styles.changeEmailText}>Cambiar correo electrónico</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            ¿No encuentras el correo? Revisa tu carpeta de spam o correo no deseado.
          </Text>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  content: {
    padding: 20,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 32,
  },
  emailContainer: {
    marginBottom: 24,
  },
  emailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailDisplay: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emailText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  emailDomain: {
    color: '#059669',
    fontWeight: '600',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructions: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  deviceNote: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1E40AF',
  },
  verifiedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  verifiedSubtext: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  resendButton: {
    marginBottom: 16,
  },
  changeEmailButton: {
    padding: 12,
  },
  changeEmailText: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  helpContainer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  securityContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  securityText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 6,
  },
  providerWarning: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  providerWarningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 6,
  },
  providerWarningText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});