/**
 * Enterprise Login Screen - Redux-First Pattern
 * Uses enterprise auth actions instead of direct Supabase calls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../../design/tokens';
import { useEnterpriseAuth, useAuthActions } from '../../hooks/useEnterpriseAuth';
import { AutofillAwareInput } from '../../components/ui/AutofillAwareInput';
import type { AuthStackParamList } from '../../types';

interface EnterpriseLoginScreenProps {
  navigation: NavigationProp<AuthStackParamList, 'Login'>;
}

type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;

interface LoginFormData {
  email: string;
  password: string;
}

export const EnterpriseLoginScreen: React.FC<EnterpriseLoginScreenProps> = ({ navigation }) => {
  const route = useRoute<LoginScreenRouteProp>();
  const { isLoading, error, isAuthenticated } = useEnterpriseAuth();
  const { signIn, clearError } = useAuthActions();

  // Get email from navigation params (passed from verification screen)
  const prefilledEmail = route.params?.email || '';

  const [formData, setFormData] = useState<LoginFormData>({
    email: prefilledEmail,
    password: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<LoginFormData>>({});

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle successful login
  useEffect(() => {
    if (isAuthenticated) {
      // Navigation handled by AppNavigator based on auth state
      console.log('✅ Enterprise login successful - navigation handled by auth state');
    }
  }, [isAuthenticated]);

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'Contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🚀 Starting Redux-based login...');

      await signIn({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log('✅ Login completed via Redux');

    } catch (error) {
      console.error('❌ Redux login error:', error);

      // Error is handled by Redux and shown via error state
      // Additional user-friendly error handling
      const errorMessage = typeof error === 'string' ? error : 'Error al iniciar sesión';

      if (errorMessage.includes('Invalid login credentials')) {
        Alert.alert('Error', 'Email o contraseña incorrectos');
      } else if (errorMessage.includes('Email not confirmed')) {
        Alert.alert('Error', 'Confirma tu email antes de iniciar sesión');
      } else if (errorMessage.includes('Too many requests')) {
        Alert.alert('Error', 'Demasiados intentos. Espera unos minutos');
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow with Redux
    Alert.alert(
      'Recuperar Contraseña',
      'Esta funcionalidad se implementará próximamente. Por ahora, contacta soporte.',
    );
  };

  const handleSignUp = () => {
    navigation.navigate('UserTypeSelection');
  };

  const isLoginDisabled = isLoading || !formData.email || !formData.password;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bienvenido de vuelta</Text>
            <Text style={styles.subtitle}>
              Inicia sesión en tu cuenta de Manito
            </Text>
          </View>

          {/* Global Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <AutofillAwareInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={formErrors.email}
              textContentType="emailAddress"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="tu@email.com"
              required
              editable={!isLoading}
            />

            {/* Password Input */}
            <AutofillAwareInput
              label="Contraseña"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              error={formErrors.password}
              textContentType="password"
              autoComplete="current-password"
              secureTextEntry
              placeholder="Tu contraseña"
              required
              editable={!isLoading}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoginDisabled && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoginDisabled}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
                <Text style={styles.signUpLink}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    fontSize: typography.fontSize['2xl'].size,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.lg.size,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: typography.fontSize.lg.lineHeight,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: spacing[6],
    marginTop: -spacing[2],
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm.size,
    color: colors.primary[600],
    fontWeight: '500',
  },
  loginButton: {
    height: 52,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
    ...shadows.md,
  },
  loginButtonDisabled: {
    backgroundColor: colors.neutral[400],
  },
  loginButtonText: {
    fontSize: typography.fontSize.base.size,
    fontWeight: '600',
    color: colors.surface.primary,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: typography.fontSize.base.size,
    color: colors.neutral[600],
  },
  signUpLink: {
    fontSize: typography.fontSize.base.size,
    color: colors.primary[600],
    fontWeight: '600',
  },
});