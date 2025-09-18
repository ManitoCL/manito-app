import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/auth';
import { chileanPhoneUtils } from '../../utils/chilean';
import UserTypeSelection from './UserTypeSelection';
import EmailRegistrationForm from './EmailRegistrationForm';
import PhoneRegistrationForm from './PhoneRegistrationForm';
import { User } from '../../types';

type RegistrationMethod = 'email' | 'phone';
type RegistrationStep = 'userType' | 'method' | 'form';

interface ComprehensiveRegistrationScreenProps {
  onNavigateToLogin?: () => void;
}

const ComprehensiveRegistrationScreen: React.FC<ComprehensiveRegistrationScreenProps> = ({
  onNavigateToLogin
}) => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('userType');
  const [selectedUserType, setSelectedUserType] = useState<'consumer' | 'provider' | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<RegistrationMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'phone' | 'verification' | 'details'>('phone');

  const { signUp } = useAuth();

  const handleUserTypeSelect = (userType: 'consumer' | 'provider') => {
    setSelectedUserType(userType);
    setCurrentStep('method');
  };

  const handleMethodSelect = (method: RegistrationMethod) => {
    setSelectedMethod(method);
    setCurrentStep('form');
  };

  const handleEmailRegistration = async (userData: Partial<User> & { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await AuthService.signUp(userData.email, userData.password, userData);
      
      if (result.error) {
        Alert.alert(
          'Error de registro',
          result.error.message || 'No se pudo crear la cuenta. Intenta nuevamente.'
        );
        return;
      }

      Alert.alert(
        'Cuenta creada',
        'Te hemos enviado un email de verificación. Por favor revisa tu bandeja de entrada.',
        [
          {
            text: 'OK',
            onPress: () => onNavigateToLogin?.()
          }
        ]
      );
    } catch (error: any) {
      console.error('Email registration error:', error);
      Alert.alert(
        'Error',
        error.message || 'Ocurrió un error durante el registro. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRegistration = async (userData: Partial<User> & { phoneNumber: string }) => {
    setLoading(true);
    try {
      const cleanPhoneNumber = chileanPhoneUtils.getCleanPhoneNumber(userData.phoneNumber);
      
      const result = await AuthService.signUpWithPhone(cleanPhoneNumber, userData);
      
      if (result.error) {
        Alert.alert(
          'Error de registro',
          result.error.message || 'No se pudo crear la cuenta. Intenta nuevamente.'
        );
        return;
      }

      Alert.alert(
        'Cuenta creada',
        'Tu cuenta ha sido creada exitosamente.',
        [
          {
            text: 'OK',
            onPress: () => onNavigateToLogin?.()
          }
        ]
      );
    } catch (error: any) {
      console.error('Phone registration error:', error);
      Alert.alert(
        'Error',
        error.message || 'Ocurrió un error durante el registro. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      const cleanPhoneNumber = chileanPhoneUtils.getCleanPhoneNumber(phoneNumber);
      const result = await AuthService.verifyPhoneOTP(cleanPhoneNumber, otp);
      return !result.error;
    } catch (error) {
      console.error('OTP verification error:', error);
      return false;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'method':
        setCurrentStep('userType');
        setSelectedUserType(null);
        break;
      case 'form':
        setCurrentStep('method');
        setSelectedMethod(null);
        setPhoneStep('phone');
        break;
      default:
        break;
    }
  };

  const renderProgressIndicator = () => {
    const steps = ['userType', 'method', 'form'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <View style={[
              styles.progressDot,
              index <= currentIndex && styles.progressDotActive
            ]} />
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                index < currentIndex && styles.progressLineActive
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderUserTypeStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <UserTypeSelection
        selectedType={selectedUserType}
        onSelectType={handleUserTypeSelect}
      />
    </ScrollView>
  );

  const renderMethodStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>¿Cómo prefieres registrarte?</Text>
      <Text style={styles.stepDescription}>
        Elige el método que prefieras para crear tu cuenta
      </Text>

      <View style={styles.methodContainer}>
        <TouchableOpacity
          style={styles.methodCard}
          onPress={() => handleMethodSelect('email')}
          activeOpacity={0.8}
        >
          <Text style={styles.methodIcon}>📧</Text>
          <Text style={styles.methodTitle}>Con Email</Text>
          <Text style={styles.methodDescription}>
            Usa tu dirección de email para registrarte
          </Text>
          <View style={styles.methodBenefits}>
            <Text style={styles.methodBenefit}>• Fácil recuperación de cuenta</Text>
            <Text style={styles.methodBenefit}>• Notificaciones por email</Text>
            <Text style={styles.methodBenefit}>• Acceso desde cualquier dispositivo</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.methodCard}
          onPress={() => handleMethodSelect('phone')}
          activeOpacity={0.8}
        >
          <Text style={styles.methodIcon}>📱</Text>
          <Text style={styles.methodTitle}>Con Teléfono</Text>
          <Text style={styles.methodDescription}>
            Usa tu número de teléfono chileno
          </Text>
          <View style={styles.methodBenefits}>
            <Text style={styles.methodBenefit}>• Verificación instantánea</Text>
            <Text style={styles.methodBenefit}>• Notificaciones por SMS</Text>
            <Text style={styles.methodBenefit}>• Registro más rápido</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backTextButton} onPress={handleBack}>
        <Text style={styles.backTextButtonText}>← Cambiar tipo de cuenta</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFormStep = () => (
    <View style={styles.formContainer}>
      {selectedMethod === 'email' && selectedUserType && (
        <EmailRegistrationForm
          userType={selectedUserType}
          onSubmit={handleEmailRegistration}
          loading={loading}
        />
      )}
      
      {selectedMethod === 'phone' && selectedUserType && (
        <PhoneRegistrationForm
          userType={selectedUserType}
          onSubmit={handlePhoneRegistration}
          onVerifyOTP={handleVerifyOTP}
          loading={loading}
          step={phoneStep}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentStep !== 'userType' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Manito</Text>
      </View>

      {renderProgressIndicator()}

      <View style={styles.content}>
        {currentStep === 'userType' && renderUserTypeStep()}
        {currentStep === 'method' && renderMethodStep()}
        {currentStep === 'form' && renderFormStep()}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={onNavigateToLogin}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta? <Text style={styles.footerLink}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  backButtonText: {
    fontSize: 20,
    color: '#333333',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginRight: 40, // Compensate for back button
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
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
  methodContainer: {
    gap: 16,
    marginBottom: 32,
  },
  methodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  methodBenefits: {
    gap: 4,
  },
  methodBenefit: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
  },
  backTextButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  backTextButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  footerLink: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default ComprehensiveRegistrationScreen;