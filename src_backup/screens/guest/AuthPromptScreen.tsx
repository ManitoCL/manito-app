/**
 * AuthPromptScreen - Strategic authentication prompt
 * Marketplace UX: Show value before asking for signup
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AuthPromptScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleSignUp = () => {
    navigation.navigate('Auth' as never, { screen: 'Register' } as never);
  };

  const handleLogin = () => {
    navigation.navigate('Auth' as never, { screen: 'Login' } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🚀</Text>
          <Text style={styles.title}>¡Empecemos!</Text>
          <Text style={styles.subtitle}>
            Crea tu cuenta para reservar servicios o ofrecer tus habilidades profesionales
          </Text>
        </View>

        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>📱</Text>
            <Text style={styles.benefitText}>Reserva en segundos</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>💳</Text>
            <Text style={styles.benefitText}>Pago seguro y protegido</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>⭐</Text>
            <Text style={styles.benefitText}>Califica tu experiencia</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp}>
            <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
            <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  benefits: {
    marginBottom: 40,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AuthPromptScreen;