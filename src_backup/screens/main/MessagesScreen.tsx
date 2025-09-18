/**
 * MessagesScreen - Messaging center for marketplace communication
 * Secure communication between consumers and providers
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Badge } from '../../components/ui';
import { theme } from '../../theme';

const MessagesScreen: React.FC = () => {
  const { user } = useAuth();
  const isProvider = user?.userType === 'provider';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mensajes</Text>
          <Badge
            label="0"
            variant="primary"
            size="small"
          />
        </View>
        <Text style={styles.subtitle}>
          {isProvider
            ? 'Comunícate con tus clientes de forma segura'
            : 'Chatea con profesionales antes y después del servicio'
          }
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>Sin conversaciones</Text>
        <Text style={styles.emptyMessage}>
          {isProvider
            ? 'Los mensajes con clientes aparecerán aquí. Una vez aceptes un trabajo, podrás comunicarte directamente con el cliente.'
            : 'Los mensajes con profesionales aparecerán aquí. Una vez solicites un servicio, podrás comunicarte con el profesional asignado.'
          }
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Mensajes cifrados</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📷</Text>
            <Text style={styles.featureText}>Comparte fotos</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⏰</Text>
            <Text style={styles.featureText}>Historial completo</Text>
          </View>
        </View>

        <Button
          title={isProvider ? 'Buscar Trabajos' : 'Explorar Servicios'}
          onPress={() => {/* TODO: Navigate to search */}}
          variant="secondary"
          style={styles.actionButton}
        />

        {/* User context indicator */}
        <View style={styles.userContext}>
          <Text style={styles.userContextText}>
            {user?.fullName} • {isProvider ? 'Profesional' : 'Cliente'} • Sin conversaciones activas
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.semantic.surface,
  },
  header: {
    backgroundColor: theme.colors.semantic.background,
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
    gap: theme.spacing[3],
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[900],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing[3],
  },
  emptyMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
  },
  features: {
    flexDirection: 'row',
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  feature: {
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  actionButton: {
    minWidth: 200,
    marginBottom: theme.spacing[6],
  },
  userContext: {
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.lg,
  },
  userContextText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
});

export default MessagesScreen;