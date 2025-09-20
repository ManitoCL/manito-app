import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface EmailConfirmedScreenProps {
  navigation: {
    replace: (screen: string) => void;
  };
}

const colors = {
  primary: '#2563EB',
  secondary: '#10B981',
  background: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  success: '#10B981',
};

export const EmailConfirmedScreen: React.FC<EmailConfirmedScreenProps> = ({
  navigation,
}) => {
  useEffect(() => {
    // Enterprise Auth: AppNavigator will handle navigation automatically based on auth state
    // No manual navigation needed - middleware manages the flow
    console.log('✅ Email confirmed - AppNavigator will handle transition to authenticated state');
  }, []);

  const handleContinue = () => {
    // Enterprise Auth: AppNavigator handles navigation automatically
    console.log('✅ Continue pressed - AppNavigator will transition based on auth state');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✅</Text>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>¡Email Confirmado!</Text>
        <Text style={styles.subtitle}>
          Tu cuenta ha sido verificada exitosamente
        </Text>

        {/* Success Card */}
        <Card style={styles.successCard}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>¡Bienvenido a Manito!</Text>
            <Text style={styles.cardDescription}>
              Tu cuenta está lista. Ahora puedes conectar con profesionales
              de confianza para todos los servicios de tu hogar.
            </Text>
          </View>
        </Card>

        {/* Continue Button */}
        <Button
          title="Continuar a la App"
          onPress={handleContinue}
          style={styles.continueButton}
        />

        {/* Auto-redirect Message */}
        <Text style={styles.autoRedirectText}>
          Te redirigiremos automáticamente en unos segundos...
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  successCard: {
    width: '100%',
    marginBottom: 30,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    width: '100%',
    marginBottom: 20,
  },
  autoRedirectText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});