import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { validationMessages, serviceCategories, chileanRegions } from '../../utils/chilean';
import RUTInput from './RUTInput';
import ChileanPhoneInput from './ChileanPhoneInput';
import { User } from '../../types';

interface EmailRegistrationFormProps {
  userType: 'consumer' | 'provider';
  onSubmit: (userData: Partial<User> & { email: string; password: string }) => Promise<void>;
  loading?: boolean;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  rut: string;
  businessName?: string;
  description?: string;
  selectedServices?: string[];
  region: string;
}

interface FormErrors {
  [key: string]: string;
}

const EmailRegistrationForm: React.FC<EmailRegistrationFormProps> = ({
  userType,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    rut: '',
    businessName: '',
    description: '',
    selectedServices: [],
    region: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isRUTValid, setIsRUTValid] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = validationMessages.email.required;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = validationMessages.email.invalid;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = validationMessages.password.required;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = validationMessages.password.minLength;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = validationMessages.name.required;
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = validationMessages.name.minLength;
    }

    // Phone number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = validationMessages.phone.required;
    } else if (!isPhoneValid) {
      newErrors.phoneNumber = validationMessages.phone.invalid;
    }

    // RUT validation (optional for now)
    if (formData.rut && !isRUTValid) {
      newErrors.rut = validationMessages.rut.invalid;
    }

    // Provider-specific validations
    if (userType === 'provider') {
      if (!formData.businessName) {
        newErrors.businessName = validationMessages.businessName.required;
      } else if (formData.businessName.length < 2) {
        newErrors.businessName = validationMessages.businessName.minLength;
      }

      if (!formData.selectedServices || formData.selectedServices.length === 0) {
        newErrors.selectedServices = 'Selecciona al menos un servicio';
      }

      if (!formData.region) {
        newErrors.region = 'Selecciona tu región';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors || {}).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Formulario incompleto', 'Por favor corrige los errores antes de continuar');
      return;
    }

    const userData: Partial<User> & { email: string; password: string } = {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      userType,
    };

    if (userType === 'provider') {
      userData.businessName = formData.businessName;
      userData.description = formData.description;
      userData.services = formData.selectedServices || [];
      userData.serviceAreas = [formData.region];
    }

    try {
      await onSubmit(userData);
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Ocurrió un error durante el registro. Intenta nuevamente.');
    }
  };

  const toggleService = (serviceValue: string) => {
    const currentServices = formData.selectedServices || [];
    const updatedServices = currentServices.includes(serviceValue)
      ? currentServices.filter(s => s !== serviceValue)
      : [...currentServices, serviceValue];

    setFormData(prev => ({ ...(prev || {}), selectedServices: updatedServices }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          {userType === 'consumer' ? 'Crear cuenta como Cliente' : 'Crear cuenta como Profesional'}
        </Text>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...(prev || {}), email: text }))}
            placeholder="tu@email.com"
            placeholderTextColor="#999999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            value={formData.password}
            onChangeText={(text) => setFormData(prev => ({ ...(prev || {}), password: text }))}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#999999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar contraseña *</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData(prev => ({ ...(prev || {}), confirmPassword: text }))}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#999999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        {/* Full Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            value={formData.fullName}
            onChangeText={(text) => setFormData(prev => ({ ...(prev || {}), fullName: text }))}
            placeholder="Tu nombre y apellidos"
            placeholderTextColor="#999999"
            autoCapitalize="words"
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        {/* Phone Number Input */}
        <ChileanPhoneInput
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData(prev => ({ ...(prev || {}), phoneNumber: text }))}
          onValidationChange={setIsPhoneValid}
          error={errors.phoneNumber}
          required
        />

        {/* RUT Input */}
        <RUTInput
          value={formData.rut}
          onChangeText={(text) => setFormData(prev => ({ ...(prev || {}), rut: text }))}
          onValidationChange={setIsRUTValid}
          error={errors.rut}
          label="RUT (opcional)"
        />

        {/* Provider-specific fields */}
        {userType === 'provider' && (
          <>
            {/* Business Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del negocio *</Text>
              <TextInput
                style={[styles.input, errors.businessName && styles.inputError]}
                value={formData.businessName}
                onChangeText={(text) => setFormData(prev => ({ ...(prev || {}), businessName: text }))}
                placeholder="Nombre de tu empresa o negocio"
                placeholderTextColor="#999999"
                autoCapitalize="words"
              />
              {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...(prev || {}), description: text }))}
                placeholder="Describe tu experiencia y servicios"
                placeholderTextColor="#999999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Services */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Servicios que ofreces *</Text>
              <View style={styles.servicesContainer}>
                {serviceCategories.map((service) => (
                  <TouchableOpacity
                    key={service.value}
                    style={[
                      styles.serviceChip,
                      formData.selectedServices?.includes(service.value) && styles.serviceChipSelected
                    ]}
                    onPress={() => toggleService(service.value)}
                  >
                    <Text style={[
                      styles.serviceChipText,
                      formData.selectedServices?.includes(service.value) && styles.serviceChipTextSelected
                    ]}>
                      {service.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.selectedServices && <Text style={styles.errorText}>{errors.selectedServices}</Text>}
            </View>

            {/* Region */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Región donde ofreces servicios *</Text>
              <View style={styles.regionsContainer}>
                {chileanRegions.map((region) => (
                  <TouchableOpacity
                    key={region.value}
                    style={[
                      styles.regionOption,
                      formData.region === region.value && styles.regionOptionSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...(prev || {}), region: region.value }))}
                  >
                    <Text style={[
                      styles.regionOptionText,
                      formData.region === region.value && styles.regionOptionTextSelected
                    ]}>
                      {region.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.region && <Text style={styles.errorText}>{errors.region}</Text>}
            </View>
          </>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {userType === 'consumer' ? 'Crear cuenta' : 'Crear cuenta profesional'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    marginTop: 4,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  serviceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  serviceChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  serviceChipText: {
    fontSize: 14,
    color: '#666666',
  },
  serviceChipTextSelected: {
    color: '#ffffff',
    fontWeight: '500',
  },
  regionsContainer: {
    gap: 8,
    marginTop: 8,
  },
  regionOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  regionOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  regionOptionText: {
    fontSize: 16,
    color: '#666666',
  },
  regionOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default EmailRegistrationForm;