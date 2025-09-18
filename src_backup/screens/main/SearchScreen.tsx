/**
 * SearchScreen - Role-specific search experience
 * Different functionality for consumers vs providers
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui';
import { theme } from '../../theme';

const SearchScreen: React.FC = () => {
  const { user } = useAuth();
  const isProvider = user?.userType === 'provider';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isProvider ? 'Mis Clientes' : 'Buscar Servicios'}
        </Text>
        <Text style={styles.subtitle}>
          {isProvider
            ? 'Administra tus clientes y solicitudes'
            : 'Encuentra el profesional perfecto para tu hogar'
          }
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emptyIcon}>
          {isProvider ? '👥' : '🔍'}
        </Text>
        <Text style={styles.emptyTitle}>
          {isProvider ? 'Panel de Clientes' : 'Explorador de Servicios'}
        </Text>
        <Text style={styles.emptyMessage}>
          {isProvider
            ? 'Aquí podrás ver y gestionar todas tus interacciones con los clientes. Esta funcionalidad estará disponible próximamente.'
            : 'Busca entre cientos de profesionales verificados en Santiago. Filtra por servicio, ubicación, precio y calificaciones.'
          }
        </Text>

        <Button
          title={isProvider ? 'Ver Demo' : 'Próximamente'}
          onPress={() => {/* TODO: Implement search functionality */}}
          variant="secondary"
          style={styles.actionButton}
        />

        {/* User context indicator */}
        <View style={styles.userContext}>
          <Text style={styles.userContextText}>
            Conectado como: {user?.fullName} ({isProvider ? 'Profesional' : 'Cliente'})
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
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[2],
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
  actionButton: {
    minWidth: 200,
    marginBottom: theme.spacing[8],
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

export default SearchScreen;