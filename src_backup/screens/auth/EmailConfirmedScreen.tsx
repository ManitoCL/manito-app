/**
 * EmailConfirmedScreen - Shows success after email confirmation
 * Handles the redirect from email confirmation link
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui';
import { theme } from '../../theme';

const EmailConfirmedScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Auto-redirect after a short delay if user is authenticated
    if (user && !loading) {
      const timer = setTimeout(() => {
        // Navigate to main app
        navigation.navigate('Main' as never);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, loading, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Verificando tu cuenta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>✅</Text>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>¡Email Verificado!</Text>
        <Text style={styles.subtitle}>
          Tu cuenta ha sido verificada exitosamente
        </Text>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            🎉 ¡Bienvenido a Manito!
          </Text>
          <Text style={styles.descriptionText}>
            Ya puedes comenzar a encontrar los mejores profesionales para tu hogar
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {user ? (
            <Button
              title="Comenzar a Explorar"
              onPress={() => navigation.navigate('Main' as never)}
              size="large"
              fullWidth
              style={styles.primaryButton}
            />
          ) : (
            <Button
              title="Iniciar Sesión"
              onPress={() => navigation.navigate('Login' as never)}
              size="large"
              fullWidth
              style={styles.primaryButton}
            />
          )}
        </View>

        {/* Auto-redirect Notice */}
        {user && (
          <Text style={styles.autoRedirectText}>
            Te redirigiremos automáticamente en unos segundos...
          </Text>
        )}
      </View>
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
    alignItems: 'center',
  },

  // Success Icon
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.success[50],
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[6],
    borderWidth: 2,
    borderColor: theme.colors.success[200],
  },
  successIcon: {
    fontSize: 60,
  },

  // Text Content
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[900],
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  },

  // Welcome Section
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
    paddingHorizontal: theme.spacing[4],
  },
  welcomeText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  descriptionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed,
  },

  // Actions
  actions: {
    width: '100%',
    marginBottom: theme.spacing[4],
  },
  primaryButton: {
    backgroundColor: theme.colors.primary[600],
  },

  // Loading & Auto-redirect
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginTop: theme.spacing[4],
  },
  autoRedirectText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EmailConfirmedScreen;