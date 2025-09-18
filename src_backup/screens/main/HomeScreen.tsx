/**
 * HomeScreen - Manito Marketplace Dashboard
 * Personalized dashboard experience for consumers and providers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Badge, Avatar } from '../../components/ui';
import { VerificationBadge } from '../../components/marketplace';
import { theme } from '../../theme';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // TODO: Load actual booking data from API
      // For now, showing sample data structure
      setRecentBookings([]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboardData().then(() => setRefreshing(false));
  }, []);

  const renderHeader = () => {
    const firstName = user?.fullName?.split(' ')[0] || 'Usuario';
    const isProvider = user?.userType === 'provider';

    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Avatar
              size="medium"
              initials={user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
              source={undefined}
              verified={user?.userType === 'provider'}
            />
            <View style={styles.userText}>
              <Text style={styles.greeting}>¡Hola, {firstName}!</Text>
              <View style={styles.userTypeContainer}>
                <Badge
                  label={isProvider ? 'Profesional' : 'Cliente'}
                  variant={isProvider ? 'verified' : 'primary'}
                  size="small"
                />
                {isProvider && (
                  <VerificationBadge
                    status="pending"
                    size="small"
                    style={styles.verificationBadge}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.welcomeMessage}>
          {isProvider
            ? 'Administra tus servicios y trabajos'
            : 'Encuentra profesionales confiables para tu hogar'
          }
        </Text>
      </View>
    );
  };

  const renderQuickActions = () => {
    const isProvider = user?.userType === 'provider';

    if (isProvider) {
      return (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>📋</Text>
              </View>
              <Text style={styles.quickActionText}>Ver Solicitudes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>⚙️</Text>
              </View>
              <Text style={styles.quickActionText}>Mis Servicios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>📊</Text>
              </View>
              <Text style={styles.quickActionText}>Estadísticas</Text>
            </TouchableOpacity>
          </View>
        </Card>
      );
    }

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>¿Qué necesitas hoy?</Text>
        <View style={styles.serviceCategories}>
          <TouchableOpacity style={styles.serviceCategory}>
            <View style={styles.serviceCategoryIcon}>
              <Text style={styles.serviceCategoryIconText}>🔧</Text>
            </View>
            <Text style={styles.serviceCategoryText}>Plomería</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceCategory}>
            <View style={styles.serviceCategoryIcon}>
              <Text style={styles.serviceCategoryIconText}>⚡</Text>
            </View>
            <Text style={styles.serviceCategoryText}>Electricidad</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceCategory}>
            <View style={styles.serviceCategoryIcon}>
              <Text style={styles.serviceCategoryIconText}>🧹</Text>
            </View>
            <Text style={styles.serviceCategoryText}>Limpieza</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceCategory}>
            <View style={styles.serviceCategoryIcon}>
              <Text style={styles.serviceCategoryIconText}>🌱</Text>
            </View>
            <Text style={styles.serviceCategoryText}>Jardín</Text>
          </TouchableOpacity>
        </View>
        <Button
          title="Ver Todos los Servicios"
          onPress={() => {/* TODO: Navigate to search */}}
          variant="outline"
          style={styles.viewAllButton}
        />
      </Card>
    );
  };

  const renderRecentActivity = () => {
    const isProvider = user?.userType === 'provider';

    if (recentBookings.length === 0) {
      return (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isProvider ? 'Trabajos Recientes' : 'Mis Solicitudes'}
          </Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>
              {isProvider ? '👷‍♂️' : '🏠'}
            </Text>
            <Text style={styles.emptyStateText}>
              {isProvider
                ? 'Aún no tienes trabajos asignados'
                : 'Aún no has solicitado ningún servicio'
              }
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {isProvider
                ? 'Los trabajos aparecerán aquí cuando los clientes te contacten'
                : 'Explora nuestros servicios y encuentra lo que necesitas'
              }
            </Text>
            <Button
              title={isProvider ? 'Completar Perfil' : 'Explorar Servicios'}
              onPress={() => {/* TODO: Navigate accordingly */}}
              variant="secondary"
              style={styles.emptyStateButton}
            />
          </View>
        </Card>
      );
    }

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        {/* TODO: Render actual bookings */}
      </Card>
    );
  };

  const renderProviderStats = () => {
    if (user?.userType !== 'provider') return null;

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Tu Rendimiento</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Trabajos Completados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Calificación</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>$0</Text>
            <Text style={styles.statLabel}>Ingresos del Mes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Tiempo Respuesta</Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderTips = () => {
    const isProvider = user?.userType === 'provider';

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Consejos Manito</Text>
        <View style={styles.tip}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              {isProvider ? 'Completa tu verificación' : 'Compara antes de elegir'}
            </Text>
            <Text style={styles.tipText}>
              {isProvider
                ? 'Los profesionales verificados reciben 3x más trabajos'
                : 'Lee reseñas y compara precios para tomar la mejor decisión'
              }
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderQuickActions()}
        {renderProviderStats()}
        {renderRecentActivity()}
        {renderTips()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.semantic.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing[6],
  },

  // Header
  header: {
    backgroundColor: theme.colors.semantic.background,
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userText: {
    marginLeft: theme.spacing[3],
    flex: 1,
  },
  greeting: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[1],
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  verificationBadge: {
    marginLeft: theme.spacing[1],
  },
  welcomeMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },

  // Sections
  section: {
    margin: theme.spacing[4],
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[4],
  },

  // Quick Actions (Provider)
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    padding: theme.spacing[2],
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  quickActionIconText: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },

  // Service Categories (Consumer)
  serviceCategories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  serviceCategory: {
    alignItems: 'center',
    flex: 1,
    padding: theme.spacing[2],
  },
  serviceCategoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.secondary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  serviceCategoryIconText: {
    fontSize: 28,
  },
  serviceCategoryText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
  viewAllButton: {
    marginTop: theme.spacing[2],
  },

  // Stats (Provider)
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.neutral[50],
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: theme.spacing[3],
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[800],
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing[4],
  },
  emptyStateButton: {
    minWidth: 200,
  },

  // Tips
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.secondary[50],
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary[500],
  },
  tipIcon: {
    fontSize: 24,
    marginRight: theme.spacing[3],
    marginTop: theme.spacing[1],
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[1],
  },
  tipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
});

export default HomeScreen;