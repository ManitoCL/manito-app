/**
 * PHASE 2: Enterprise Onboarding Flow Screen
 * Handles user onboarding completion after email verification
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';

export const OnboardingFlowScreen: React.FC = () => {
  console.log('🚀 Phase 2: OnboardingFlowScreen');

  const { profile, refreshAuth } = useEnterpriseAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  console.log('🔍 Onboarding State:', {
    userType: profile?.user_type,
    needsOnboarding: profile?.onboarding_completed === false,
  });

  const handleCompleteOnboarding = async () => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      // TODO: Call Supabase function to mark onboarding as completed
      console.log('✅ Phase 2: Completing onboarding...');

      // For now, simulate completion and refresh auth state
      setTimeout(async () => {
        await refreshAuth();
        setIsCompleting(false);
      }, 2000);

    } catch (error) {
      console.error('❌ Onboarding completion error:', error);
      Alert.alert('Error', 'No se pudo completar la configuración inicial');
      setIsCompleting(false);
    }
  };

  const isProvider = profile?.user_type === 'provider';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👋</Text>
          </View>
          <Text style={styles.title}>¡Bienvenido a Manito!</Text>
          <Text style={styles.subtitle}>
            {isProvider
              ? 'Estás registrado como Proveedor de Servicios'
              : 'Estás registrado como Cliente'}
          </Text>
        </View>

        {/* Onboarding Content */}
        <View style={styles.contentContainer}>
          {isProvider ? (
            <ProviderOnboardingContent />
          ) : (
            <CustomerOnboardingContent />
          )}
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={[styles.completeButton, isCompleting && styles.completeButtonDisabled]}
          onPress={handleCompleteOnboarding}
          disabled={isCompleting}
        >
          <Text style={styles.completeButtonText}>
            {isCompleting ? 'Configurando...' : 'Continuar a Manito'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const CustomerOnboardingContent: React.FC = () => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>Como Cliente puedes:</Text>

    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>🔍</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>Buscar Profesionales</Text>
        <Text style={styles.featureDescription}>
          Encuentra electricistas, plomeros, limpieza, jardinería y más
        </Text>
      </View>
    </View>

    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>⭐</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>Ver Reseñas y Calificaciones</Text>
        <Text style={styles.featureDescription}>
          Revisa las experiencias de otros clientes antes de contratar
        </Text>
      </View>
    </View>

    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>🔒</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>Pagos Seguros</Text>
        <Text style={styles.featureDescription}>
          Sistema de pagos protegido con garantía de devolución
        </Text>
      </View>
    </View>

    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>📱</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>Seguimiento en Tiempo Real</Text>
        <Text style={styles.featureDescription}>
          Mantente informado sobre el progreso de tus servicios
        </Text>
      </View>
    </View>
  </View>
);

const ProviderOnboardingContent: React.FC = () => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>Como Proveedor puedes:</Text>

    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>💼</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>Recibir Solicitudes de Trabajo</Text>
        <Text style={styles.featureDescription}>
          Conecta con clientes que necesitan tus servicios profesionales
        </Text>
      </View>
    </View>

    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>💰</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>Pagos Garantizados</Text>
        <Text style={styles.featureDescription}>
          Recibe pagos seguros una vez completado el trabajo
        </Text>
      </View>
    </View>

    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>📈</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>Construye tu Reputación</Text>
        <Text style={styles.featureDescription}>
          Acumula reseñas positivas y atrae más clientes
        </Text>
      </View>
    </View>

    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>⚠️</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>Próximo Paso: Verificación</Text>
        <Text style={styles.featureDescription}>
          Necesitarás completar la verificación de tu perfil profesional
        </Text>
      </View>
    </View>
  </View>
);

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
    backgroundColor: '#DCFCE7',
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
  },
  contentContainer: {
    flex: 1,
    marginBottom: 32,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});