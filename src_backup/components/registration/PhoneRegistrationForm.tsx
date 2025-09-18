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

interface PhoneRegistrationFormProps {
  userType: 'consumer' | 'provider';
  onSubmit: (userData: Partial<User> & { phoneNumber: string }) => Promise<void>;
  onVerifyOTP: (phoneNumber: string, otp: string) => Promise<boolean>;
  loading?: boolean;
  step?: 'phone' | 'verification' | 'details';
}

interface FormData {
  phoneNumber: string;
  otp: string;
  fullName: string;
  rut: string;
  businessName?: string;
  description?: string;
  selectedServices?: string[];
  region: string;
}

interface FormErrors {
  [key: string]: string;
}

const PhoneRegistrationForm: React.FC<PhoneRegistrationFormProps> = ({
  userType,
  onSubmit,
  onVerifyOTP,
  loading = false,
  step = 'phone'
}) => {
  const [currentStep, setCurrentStep] = useState<'phone' | 'verification' | 'details'>(step);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    otp: '',
    fullName: '',
    rut: '',
    businessName: '',
    description: '',
    selectedServices: [],
    region: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isRUTValid, setIsRUTValid] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validatePhoneStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = validationMessages.phone.required;
    } else if (!isPhoneValid) {
      newErrors.phoneNumber = validationMessages.phone.invalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors || {}).length === 0;
  };

  const validateOTPStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.otp) {
      newErrors.otp = 'Ingresa el código de verificación';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'El código debe tener 6 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors || {}).length === 0;
  };

  const validateDetailsStep = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = validationMessages.name.required;
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = validationMessages.name.minLength;
    }

    // RUT validation (optional)
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

  const handleSendOTP = async () => {
    if (!validatePhoneStep()) {
      return;
    }

    try {
      // This would trigger the OTP sending via the parent component
      setCurrentStep('verification');
      setOtpTimer(60); // 60 seconds countdown
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'No se pudo enviar el código de verificación. Intenta nuevamente.');
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTPStep()) {
      return;
    }

    try {
      const isValid = await onVerifyOTP(formData.phoneNumber, formData.otp);
      if (isValid) {
        setCurrentStep('details');
      } else {
        setErrors({ otp: 'Código de verificación incorrecto' });
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', 'No se pudo verificar el código. Intenta nuevamente.');
    }
  };

  const handleSubmit = async () => {
    if (!validateDetailsStep()) {
      Alert.alert('Formulario incompleto', 'Por favor corrige los errores antes de continuar');
      return;
    }

    const userData: Partial<User> & { phoneNumber: string } = {
      phoneNumber: formData.phoneNumber,
      fullName: formData.fullName,
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

  const handleResendOTP = () => {
    if (otpTimer > 0) return;
    
    handleSendOTP();
    setFormData(prev => ({ ...(prev || {}), otp: '' }));
  };

  const toggleService = (serviceValue: string) => {
    const currentServices = formData.selectedServices || [];
    const updatedServices = currentServices.includes(serviceValue)
      ? currentServices.filter(s => s !== serviceValue)
      : [...currentServices, serviceValue];

    setFormData(prev => ({ ...(prev || {}), selectedServices: updatedServices }));
  };

  const renderPhoneStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verifica tu número</Text>
      <Text style={styles.stepDescription}>
        Te enviaremos un código de verificación por SMS
      </Text>

      <ChileanPhoneInput
        value={formData.phoneNumber}
        onChangeText={(text) => setFormData(prev => ({ ...(prev || {}), phoneNumber: text }))}
        onValidationChange={setIsPhoneValid}
        error={errors.phoneNumber}
        required
        label="Número de teléfono"
      />

      <TouchableOpacity
        style={[styles.primaryButton, !isPhoneValid && styles.primaryButtonDisabled]}
        onPress={handleSendOTP}
        disabled={!isPhoneValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Enviar código</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderVerificationStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Ingresa el código</Text>
      <Text style={styles.stepDescription}>
        Enviamos un código de 6 dígitos a {formData.phoneNumber}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Código de verificación *</Text>
        <TextInput
          style={[styles.input, styles.otpInput, errors.otp && styles.inputError]}
          value={formData.otp}
          onChangeText={(text) => {
            const numericText = text.replace(/\D/g, '');
            setFormData(prev => ({ ...(prev || {}), otp: numericText }));
          }}
          placeholder="123456"
          placeholderTextColor="#999999"
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, formData.otp.length !== 6 && styles.primaryButtonDisabled]}
        onPress={handleVerifyOTP}
        disabled={formData.otp.length !== 6 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Verificar código</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, otpTimer > 0 && styles.secondaryButtonDisabled]}
        onPress={handleResendOTP}
        disabled={otpTimer > 0}
      >
        <Text style={styles.secondaryButtonText}>
          {otpTimer > 0 ? `Reenviar en ${otpTimer}s` : 'Reenviar código'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentStep('phone')}
      >
        <Text style={styles.backButtonText}>Cambiar número</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDetailsStep = () => (
    <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Completa tu perfil</Text>
      <Text style={styles.stepDescription}>
        {userType === 'consumer' 
          ? 'Información básica para tu cuenta'
          : 'Información para tu perfil profesional'
        }
      </Text>

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
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {userType === 'consumer' ? 'Crear cuenta' : 'Crear cuenta profesional'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentStep('verification')}
      >
        <Text style={styles.backButtonText}>Atrás</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {currentStep === 'phone' && renderPhoneStep()}
      {currentStep === 'verification' && renderVerificationStep()}
      {currentStep === 'details' && renderDetailsStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  stepContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
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
  otpInput: {
    fontSize: 24,
    letterSpacing: 4,
    fontWeight: 'bold',
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
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonDisabled: {
    borderColor: '#cccccc',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666666',
    textDecorationLine: 'underline',
  },
});

export default PhoneRegistrationForm;