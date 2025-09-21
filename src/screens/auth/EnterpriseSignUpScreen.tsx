/**
 * Enterprise SignUp Screen - Redux-First Pattern
 * Uses Redux actions instead of direct Supabase calls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';
import { AutofillAwareInput } from '../../components/ui/AutofillAwareInput';
import { RutInput } from '../../components/chilean/RutInput';
import { SMSPhoneInput } from '../../components/chilean/PhoneInput';
import { ComunaSelector } from '../../components/chilean/AddressInput';
import { validateRut, RutValidationResult } from '../../utils/chilean/rutValidation';
import { validatePhoneByContext, PhoneValidationResult } from '../../utils/chilean/phoneValidation';
import { supabase } from '../../services/supabase';
import { analytics } from '../../services/analytics';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nombres: string;
  apellidos: string;
  userType: 'customer' | 'provider';
  phone: string;
  // Provider-only fields
  rut: string;
  comunaCode: string;
}

export const EnterpriseSignUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isLoading, error, user, isEmailVerified } = useEnterpriseAuth();

  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nombres: '',
    apellidos: '',
    userType: 'customer',
    phone: '',
    rut: '',
    comunaCode: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<SignUpFormData>>({});
  const [showEmailCheck, setShowEmailCheck] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [rutValidation, setRutValidation] = useState<RutValidationResult>({ isValid: false });
  const [phoneValidation, setPhoneValidation] = useState<PhoneValidationResult>({ isValid: false });

  // Simple email availability state (replacing RTK Query)
  const [emailAvailability, setEmailAvailability] = useState<{ available: boolean; reason?: string } | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);

  // Use ref for timeout management and caching
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailCacheRef = useRef<Map<string, { available: boolean; reason?: string; timestamp: number }>>(new Map());

  // Optimized email availability checking with caching
  const checkEmailAvailability = async (email: string) => {
    const startTime = Date.now();
    console.log('📧 Email check started for:', email);

    try {
      setCheckingEmail(true);
      setEmailCheckError(null);

      // Simple email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailAvailability({
          available: false,
          reason: 'Invalid email format'
        });
        console.log('📧 Email format invalid, took:', Date.now() - startTime, 'ms');
        return;
      }

      const normalizedEmail = email.toLowerCase();

      // Check cache first (cache for 2 minutes)
      const cached = emailCacheRef.current.get(normalizedEmail);
      if (cached && Date.now() - cached.timestamp < 120000) {
        setEmailAvailability(cached);
        console.log('📧 Email result from cache, took:', Date.now() - startTime, 'ms');
        return;
      }

      console.log('🔍 Making Supabase query...');
      const queryStart = Date.now();

      // Optimized query: Check users table with minimal data transfer
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', normalizedEmail)
        .limit(1);

      console.log('🔍 Supabase query took:', Date.now() - queryStart, 'ms');

      let result;
      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        result = {
          available: false,
          reason: 'Email already registered'
        };
      } else {
        result = { available: true };
      }

      // Cache the result
      emailCacheRef.current.set(normalizedEmail, {
        ...result,
        timestamp: Date.now()
      });

      setEmailAvailability(result);
      console.log('✅ Email check completed, total time:', Date.now() - startTime, 'ms');

      // Analytics: Track email availability check
      analytics.trackEmailAvailabilityChecked(normalizedEmail, result.available, Date.now() - startTime);

    } catch (error) {
      console.error('❌ Email check error:', error);
      setEmailCheckError('Failed to check email availability');
      setEmailAvailability(null);
      console.log('❌ Email check failed, total time:', Date.now() - startTime, 'ms');
    } finally {
      setCheckingEmail(false);
    }
  };

  // Removed debug log that was running on every keystroke - moved to actual check function

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, []);

  // Auth state debug logging
  useEffect(() => {
    console.log('🔍 Auth state debug:', {
      user: !!user,
      isEmailVerified,
      userEmail: user?.email
    });
  }, [user, isEmailVerified]);

  // Analytics: Track signup flow started
  useEffect(() => {
    analytics.trackSignupStarted(formData.userType);
  }, []); // Only track once on mount

  const validateForm = (): boolean => {
    const errors: Partial<SignUpFormData> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    } else if (emailAvailability && !emailAvailability.available) {
      errors.email = emailAvailability.reason || 'Email no disponible';
    } else if (emailCheckError) {
      // Don't block signup if email check fails - just warn
      console.warn('Email availability check failed:', emailCheckError);
    }

    // Password validation (must match Supabase provider settings)
    if (!formData.password) {
      errors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'Contraseña debe tener al menos 8 caracteres';
    } else {
      // Check complexity requirements (lowercase, uppercase, numbers)
      const hasLowercase = /[a-z]/.test(formData.password);
      const hasUppercase = /[A-Z]/.test(formData.password);
      const hasNumbers = /\d/.test(formData.password);

      if (!hasLowercase || !hasUppercase || !hasNumbers) {
        errors.password = 'Contraseña debe tener minúsculas, mayúsculas y números';
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Chilean name validation
    if (!formData.nombres.trim()) {
      errors.nombres = 'Nombres es requerido';
    } else if (formData.nombres.trim().length < 2) {
      errors.nombres = 'Nombres debe tener al menos 2 caracteres';
    }

    if (!formData.apellidos.trim()) {
      errors.apellidos = 'Apellidos es requerido';
    } else if (formData.apellidos.trim().length < 2) {
      errors.apellidos = 'Apellidos debe tener al menos 2 caracteres';
    }

    // Phone validation (required for all users per user stories)
    if (!formData.phone.trim()) {
      errors.phone = 'Teléfono es requerido';
    } else if (formData.userType === 'provider' && !phoneValidation.isValid) {
      // For providers, validate Chilean phone format
      errors.phone = phoneValidation.error || 'Teléfono inválido';
    }

    // Provider-specific validations (only for maestros per user stories)
    if (formData.userType === 'provider') {
      // RUT validation (required for Chilean compliance - providers only)
      if (!formData.rut.trim()) {
        errors.rut = 'RUT es requerido para proveedores';
      } else if (!rutValidation.isValid) {
        errors.rut = rutValidation.error || 'RUT inválido';
      }

      // Comuna validation (required for service area - providers only)
      if (!formData.comunaCode.trim()) {
        errors.comunaCode = 'Comuna es requerida para proveedores';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSigningUp(true);

    try {
      console.log('🚀 Starting enterprise signup via Edge Function...');

      const signUpData: any = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: `${formData.nombres.trim()} ${formData.apellidos.trim()}`,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        userType: formData.userType,
        phoneNumber: formData.phone.trim().replace(/\s/g, ''), // Remove all spaces
      };

      // Add provider-specific fields only for maestros
      if (formData.userType === 'provider') {
        signUpData.rut = formData.rut.trim();
        signUpData.comunaCode = formData.comunaCode.trim();
      }

      console.log('📡 Calling enterprise-signup edge function...', {
        email: signUpData.email,
        userType: signUpData.userType,
        hasPhoneNumber: !!signUpData.phoneNumber,
      });

      // ENTERPRISE PATTERN: Call edge function instead of Redux
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/enterprise-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(signUpData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Enterprise signup failed:', result);

        // Log detailed validation errors for debugging
        if (result.details && Array.isArray(result.details)) {
          console.error('❌ Validation errors:', result.details);
          throw new Error(`Validation failed: ${result.details.join(', ')}`);
        }

        throw new Error(result.error || 'Signup failed');
      }

      console.log('✅ Enterprise signup completed:', result);

      // Analytics: Track verification email sent
      analytics.trackVerificationEmailSent(formData.email.trim().toLowerCase(), formData.userType);

      // ENTERPRISE UX: Navigate directly to pending verification screen
      // This provides clear guidance instead of leaving user on signup form
      navigation.navigate('EmailVerificationPending', {
        email: formData.email.trim().toLowerCase(),
        userType: formData.userType,
      });

      console.log('📧 Navigated to EmailVerificationPendingScreen for enterprise UX');

    } catch (error) {
      console.error('❌ Enterprise signup error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al crear la cuenta');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleResendEmail = async () => {
    if (!formData.email) return;

    try {
      // Call edge function for resend
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/enterprise-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          resend: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend email');
      }

      Alert.alert('Email Enviado', 'Hemos reenviado el enlace de verificación.');
    } catch (error) {
      Alert.alert('Error', error as string);
    }
  };

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Analytics: Track user type selection
    if (field === 'userType') {
      analytics.trackSignupStarted(value as 'customer' | 'provider');
    }

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Enable email checking after user stops typing
    if (field === 'email') {
      setShowEmailCheck(false);

      // Clear existing timeout
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }

      // Only set timeout for valid email format
      const trimmedValue = value.trim().toLowerCase();
      if (trimmedValue.length >= 3 && trimmedValue.includes('@')) {
        // Set new timeout to debounce email checking
        emailCheckTimeoutRef.current = setTimeout(() => {
          if (/\S+@\S+\.\S+/.test(trimmedValue)) {
            setShowEmailCheck(true);
            checkEmailAvailability(trimmedValue);
          }
          emailCheckTimeoutRef.current = null;
        }, 1000); // Longer debounce time for stability
      } else {
        // Clear email availability when email becomes invalid
        setEmailAvailability(null);
        setEmailCheckError(null);
      }
    }
  };

  const isSignUpDisabled = isSigningUp || isLoading || (checkingEmail && !emailCheckError) || (emailAvailability && !emailAvailability.available);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>
            Únete a la plataforma de servicios para el hogar más confiable de Chile
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <Text style={styles.label}>¿Qué tipo de usuario eres?</Text>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  formData.userType === 'customer' && styles.userTypeButtonActive
                ]}
                onPress={() => handleInputChange('userType', 'customer')}
              >
                <Text style={[
                  styles.userTypeButtonText,
                  formData.userType === 'customer' && styles.userTypeButtonTextActive
                ]}>
                  Cliente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  formData.userType === 'provider' && styles.userTypeButtonActive
                ]}
                onPress={() => handleInputChange('userType', 'provider')}
              >
                <Text style={[
                  styles.userTypeButtonText,
                  formData.userType === 'provider' && styles.userTypeButtonTextActive
                ]}>
                  Proveedor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Chilean Names */}
          <AutofillAwareInput
            label="Nombres"
            value={formData.nombres}
            onChangeText={(value) => handleInputChange('nombres', value)}
            error={formErrors.nombres}
            textContentType="givenName"
            autoComplete="given-name"
            placeholder="Ej: María José"
            required
          />

          <AutofillAwareInput
            label="Apellidos"
            value={formData.apellidos}
            onChangeText={(value) => handleInputChange('apellidos', value)}
            error={formErrors.apellidos}
            textContentType="familyName"
            autoComplete="family-name"
            placeholder="Ej: González Rodríguez"
            required
          />

          {/* Email */}
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
            rightIcon={
              checkingEmail && !emailCheckError ? '⏳' :
              emailCheckError ? '⚠️' :
              emailAvailability?.available === false ? '❌' :
              emailAvailability?.available === true ? '✅' : undefined
            }
          />

          {/* Phone (Required for all users per user stories) */}
          {formData.userType === 'provider' ? (
            <SMSPhoneInput
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              onValidationChange={setPhoneValidation}
              errorMessage={formErrors.phone}
              style={{ marginBottom: 16 }}
            />
          ) : (
            <AutofillAwareInput
              label="Teléfono/WhatsApp"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              error={formErrors.phone}
              textContentType="telephoneNumber"
              autoComplete="tel"
              keyboardType="phone-pad"
              placeholder="+56912345678"
              required
            />
          )}

          {/* Provider-only fields (per user stories - maestros only) */}
          {formData.userType === 'provider' && (
            <>
              {/* RUT (Required for Chilean compliance - providers only) */}
              <RutInput
                value={formData.rut}
                onChangeText={(value) => handleInputChange('rut', value)}
                onValidationChange={setRutValidation}
                errorMessage={formErrors.rut}
                style={{ marginBottom: 16 }}
              />

              {/* Comuna Selection (Required for service area - providers only) */}
              <ComunaSelector
                value={formData.comunaCode}
                onChange={(value) => handleInputChange('comunaCode', value)}
                placeholder="Selecciona tu comuna de servicio"
                style={{ marginBottom: 16 }}
              />
              {formErrors.comunaCode && (
                <Text style={styles.fieldError}>{formErrors.comunaCode}</Text>
              )}
            </>
          )}

          {/* Password */}
          <AutofillAwareInput
            label="Contraseña"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            error={formErrors.password}
            textContentType="newPassword"
            autoComplete="new-password"
            secureTextEntry
            placeholder="8+ caracteres, minúsculas, mayúsculas y números"
            required
          />

          {/* Confirm Password */}
          <AutofillAwareInput
            label="Confirmar Contraseña"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            error={formErrors.confirmPassword}
            textContentType="newPassword"
            autoComplete="new-password"
            secureTextEntry
            placeholder="Repite tu contraseña"
            required
          />

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, isSignUpDisabled && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={isSignUpDisabled}
          >
            <Text style={styles.signUpButtonText}>
              {isSigningUp ? 'Creando cuenta...' : isLoading ? 'Cargando...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.signInLinkText}>
              ¿Ya tienes cuenta? <Text style={styles.signInLinkTextBold}>Inicia Sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
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
  userTypeContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  userTypeButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  userTypeButtonTextActive: {
    color: '#3b82f6',
  },
  signUpButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  signUpButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  signInLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signInLinkText: {
    fontSize: 16,
    color: '#6b7280',
  },
  signInLinkTextBold: {
    fontWeight: '600',
    color: '#3b82f6',
  },
  fieldError: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
});