/**
 * RegisterScreen - Main registration entry point
 * Following frontend-ui-expert principles: progressive disclosure, mobile-first design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import UserTypeSelection from '../../components/registration/UserTypeSelection';
import PhoneInput from '../../components/ui/PhoneInput';
import { validateEmail } from '../../utils/chilean';

type RegistrationStep = 'userType' | 'method' | 'form';
type AuthMethod = 'email' | 'phone';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signUp, signUpWithPhone } = useAuth();

  // Step management
  const [step, setStep] = useState<RegistrationStep>('userType');
  const [userType, setUserType] = useState<'consumer' | 'provider'>('consumer');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    businessName: '',
    description: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Common validations
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es requerido';
    }

    if (authMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Ingresa un email válido';
      }

      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    // Provider validations
    if (userType === 'provider') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'El nombre del negocio es requerido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors || {}).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;

      if (authMethod === 'email') {
        result = await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          userType,
          phoneNumber: formData.phoneNumber || undefined,
        });
      } else {
        result = await signUpWithPhone(formData.phoneNumber, {
          fullName: formData.fullName,
          userType,
        });
      }

      console.log("Registration result:", result);
      console.log("Registration result.error:", result.error);
      console.log("Registration result.needsConfirmation:", result.needsConfirmation);

      // Check if signup succeeded but needs email confirmation
      if (result.error && !result.needsConfirmation) {
        const errorMessage = result.error.message || "Error al crear cuenta";

        if (errorMessage.includes("rate limit")) {
          Alert.alert(
            "Demasiados intentos",
            "Has intentado crear una cuenta varias veces. Espera unos minutos o usa un email diferente."
          );
        } else {
          Alert.alert("Error", errorMessage);
        }
      } else if (result.needsConfirmation) {
        console.log("Email signup success - confirmation screen will be shown by AuthNavigator");
        // The AuthNavigator will automatically show EmailConfirmationScreen
        // No need to manually navigate
      } else {
        Alert.alert("Cuenta creada", "¡Bienvenido a Manito!");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Error inesperado al crear cuenta");
    } finally {
      setLoading(false);
    }
  };

  const renderUserTypeSelection = () => (
    <UserTypeSelection
      onSelectType={(type) => {
        setUserType(type);
        setStep('method');
      }}
    />
  );

  const renderMethodSelection = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('userType')}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>¿Cómo prefieres registrarte?</Text>
        </View>

        <View style={styles.methodContainer}>
          <TouchableOpacity
            style={[styles.methodCard, authMethod === 'email' && styles.methodCardSelected]}
            onPress={() => setAuthMethod('email')}
          >
            <Text style={styles.methodIcon}>📧</Text>
            <Text style={styles.methodTitle}>Email</Text>
            <Text style={styles.methodDescription}>Usa tu dirección de email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodCard, authMethod === 'phone' && styles.methodCardSelected]}
            onPress={() => setAuthMethod('phone')}
          >
            <Text style={styles.methodIcon}>📱</Text>
            <Text style={styles.methodTitle}>Teléfono</Text>
            <Text style={styles.methodDescription}>Verifica con SMS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => setStep('form')}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  const renderForm = () => (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep('method')}
            >
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              Crear cuenta {userType === 'provider' ? 'profesional' : 'personal'}
            </Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre Completo *</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...(formData || {}), fullName: text })}
              placeholder="Tu nombre completo"
              autoComplete="name"
              textContentType="name"
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          {/* Email or Phone */}
          {authMethod === 'email' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...(formData || {}), email: text })}
                  placeholder="tu@email.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña *</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...(formData || {}), password: text })}
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar Contraseña *</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...(formData || {}), confirmPassword: text })}
                  placeholder="Repite tu contraseña"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            </>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de Teléfono *</Text>
              <PhoneInput
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...(formData || {}), phoneNumber: text })}
                placeholder="Número de teléfono"
                error={errors.phoneNumber}
              />
            </View>
          )}

          {/* Provider-specific fields */}
          {userType === 'provider' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del Negocio *</Text>
                <TextInput
                  style={[styles.input, errors.businessName && styles.inputError]}
                  value={formData.businessName}
                  onChangeText={(text) => setFormData({ ...(formData || {}), businessName: text })}
                  placeholder="Ej: Electricidad González"
                />
                {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...(formData || {}), description: text })}
                  placeholder="Describe tus servicios y experiencia"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.loginLinkText}>
              ¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // Main render logic
  switch (step) {
    case 'userType':
      return renderUserTypeSelection();
    case 'method':
      return renderMethodSelection();
    case 'form':
      return renderForm();
    default:
      return renderUserTypeSelection();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  methodContainer: {
    gap: 16,
    marginBottom: 32,
  },
  methodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    alignItems: 'center',
  },
  methodCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    marginTop: 6,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 24,
    padding: 8,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#666666',
  },
  loginLinkBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default RegisterScreen;