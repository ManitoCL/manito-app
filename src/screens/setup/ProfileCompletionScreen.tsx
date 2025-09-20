/**
 * PHASE 2: Enterprise Profile Completion Screen
 * Final setup step for profile completion
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';

export const ProfileCompletionScreen: React.FC = () => {
  console.log('🚀 Phase 2: ProfileCompletionScreen');

  const { profile, refreshAuth } = useEnterpriseAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');

  console.log('🔍 ProfileCompletion State:', {
    userType: profile?.user_type,
    hasDisplayName: !!profile?.display_name,
    hasPhoneNumber: !!profile?.phone_number,
  });

  const handleCompleteProfile = async () => {
    if (isCompleting) return;

    // Basic validation
    if (!displayName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu número de teléfono');
      return;
    }

    // Basic phone validation
    if (!/^\+56[2-9]\d{8}$/.test(phoneNumber.trim())) {
      Alert.alert(
        'Error',
        'Número de teléfono inválido. Debe incluir +56 y 9 dígitos.\nEjemplo: +56912345678'
      );
      return;
    }

    setIsCompleting(true);
    try {
      console.log('✅ Phase 2: Completing profile...', {
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      // TODO: Call Supabase function to update profile
      // For now, simulate completion and refresh auth state
      setTimeout(async () => {
        await refreshAuth();
        setIsCompleting(false);
      }, 2000);

    } catch (error) {
      console.error('❌ Profile completion error:', error);
      Alert.alert('Error', 'No se pudo completar el perfil');
      setIsCompleting(false);
    }
  };

  const isProvider = profile?.user_type === 'provider';
  const canComplete = displayName.trim() && phoneNumber.trim() && !isCompleting;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👤</Text>
          </View>
          <Text style={styles.title}>Completa tu Perfil</Text>
          <Text style={styles.subtitle}>
            Necesitamos algunos datos adicionales para finalizar tu registro
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre a Mostrar</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="¿Cómo quieres que te llamen?"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={50}
            />
            <Text style={styles.inputHint}>
              Este nombre aparecerá en tu perfil público
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número de Teléfono</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+56912345678"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              autoCorrect={false}
              maxLength={12}
            />
            <Text style={styles.inputHint}>
              Incluye +56 seguido de tu número completo (9 dígitos)
            </Text>
          </View>

          {isProvider && (
            <View style={styles.providerNote}>
              <Text style={styles.providerNoteIcon}>ℹ️</Text>
              <View style={styles.providerNoteText}>
                <Text style={styles.providerNoteTitle}>Proveedores</Text>
                <Text style={styles.providerNoteDescription}>
                  Después de completar tu perfil, necesitarás verificar tu identidad
                  y credenciales profesionales para comenzar a recibir solicitudes.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            !canComplete && styles.completeButtonDisabled,
          ]}
          onPress={handleCompleteProfile}
          disabled={!canComplete}
        >
          <Text style={styles.completeButtonText}>
            {isCompleting ? 'Completando...' : 'Finalizar Registro'}
          </Text>
        </TouchableOpacity>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            Al completar tu perfil, aceptas nuestros{' '}
            <Text style={styles.privacyLink}>Términos de Servicio</Text> y{' '}
            <Text style={styles.privacyLink}>Política de Privacidad</Text>.
            Tu información será tratada de forma confidencial.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  inputHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
  },
  providerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginTop: 8,
  },
  providerNoteIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  providerNoteText: {
    flex: 1,
  },
  providerNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  providerNoteDescription: {
    fontSize: 13,
    color: '#3730A3',
    lineHeight: 18,
  },
  completeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  completeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  privacyNote: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  privacyLink: {
    color: '#667eea',
    fontWeight: '500',
  },
});