/**
 * LoginScreen - Professional Authentication
 * Trust-focused login with Chilean market considerations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/ui';
import PhoneInput from '../../components/ui/PhoneInput';
import { validateEmail } from '../../utils/chilean';
import { theme } from '../../theme';

type LoginMethod = 'email' | 'phone';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signIn, signInWithPhone } = useAuth();

  // Form state
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (loginMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Ingresa un email válido';
      }

      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      }
    } else {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'El número de teléfono es requerido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors || {}).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;
      
      if (loginMethod === 'email') {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signInWithPhone(formData.phoneNumber);
      }

      if (result.error) {
        Alert.alert('Error', result.error.message || 'Error al iniciar sesión');
      }
      // Success is handled by auth context automatically
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🏠</Text>
              <Text style={styles.appName}>Manito</Text>
            </View>
            
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>Bienvenido de vuelta a Manito</Text>
          </View>

          {/* Login Method Toggle */}
          <Card style={styles.methodToggle} padding="none">
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, loginMethod === 'email' && styles.toggleButtonActive]}
                onPress={() => setLoginMethod('email')}
              >
                <Text style={[styles.toggleText, loginMethod === 'email' && styles.toggleTextActive]}>
                  📧 Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, loginMethod === 'phone' && styles.toggleButtonActive]}
                onPress={() => setLoginMethod('phone')}
              >
                <Text style={[styles.toggleText, loginMethod === 'phone' && styles.toggleTextActive]}>
                  📱 Teléfono
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Form */}
          <Card style={styles.formCard} padding="large">
            {loginMethod === 'email' ? (
              <>
                <Input
                  label="Email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  error={errors.email}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  autoCapitalize="none"
                  leftIcon={<Text style={styles.inputIcon}>📧</Text>}
                  required
                />

                <Input
                  label="Contraseña"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  error={errors.password}
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
                  showPasswordToggle
                  required
                />

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  placeholder="Número de teléfono"
                  error={errors.phoneNumber}
                />
                <Text style={styles.helperText}>
                  Te enviaremos un código de verificación por SMS
                </Text>
              </>
            )}
          </Card>

          {/* Login Button */}
          <Button
            title={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            size="large"
            fullWidth
            style={styles.loginButton}
          />

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>¿No tienes cuenta?</Text>
            <Button
              title="Crear cuenta"
              onPress={() => navigation.navigate('Register' as never)}
              variant="ghost"
              size="medium"
            />
          </View>
          
          {/* Trust indicator */}
          <View style={styles.trustIndicator}>
            <Text style={styles.trustText}>🛡️ Tus datos están protegidos con encriptación de grado bancario</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.semantic.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing[6],
    justifyContent: 'center',
  },
  
  // Header
  header: {
    marginBottom: theme.spacing[8],
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing[4],
    padding: theme.spacing[2],
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  logo: {
    fontSize: theme.typography.fontSize['3xl'],
    marginRight: theme.spacing[2],
  },
  appName: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  
  // Method Toggle
  methodToggle: {
    marginBottom: theme.spacing[6],
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[1],
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.semantic.background,
    ...theme.shadows.sm,
  },
  toggleText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  toggleTextActive: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  // Form
  formCard: {
    marginBottom: theme.spacing[6],
  },
  inputIcon: {
    fontSize: theme.typography.fontSize.base,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginTop: theme.spacing[2],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    padding: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  forgotPasswordText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Buttons
  loginButton: {
    marginBottom: theme.spacing[4],
  },
  
  // Sign Up
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[6],
  },
  signUpText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    marginRight: theme.spacing[2],
  },
  
  // Trust Indicator
  trustIndicator: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  trustText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed,
  },
});

export default LoginScreen;