/**
 * BookingsScreen - Manito Marketplace Booking Management
 * Different experience for consumers (requests) vs providers (job requests)
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
import { Card, Button, Badge } from '../../components/ui';
import { theme } from '../../theme';

// Sample booking data structure for demo
interface MockBooking {
  id: string;
  serviceType: string;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  time: string;
  providerName?: string;
  consumerName?: string;
  price: number;
  address: string;
  description: string;
}

const BookingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isProvider = user?.userType === 'provider';

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // TODO: Load actual bookings from API
      // For now showing empty state
      setBookings([]);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBookings().then(() => setRefreshing(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'warning';
      case 'accepted':
        return 'primary';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'verified';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'requested':
        return 'Solicitado';
      case 'accepted':
        return 'Aceptado';
      case 'in_progress':
        return 'En Proceso';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>
        {isProvider ? 'Mis Trabajos' : 'Mis Solicitudes'}
      </Text>
      <Text style={styles.subtitle}>
        {isProvider
          ? 'Administra las solicitudes de trabajo'
          : 'Revisa el estado de tus solicitudes de servicio'
        }
      </Text>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'active' && styles.activeTab]}
        onPress={() => setActiveTab('active')}
      >
        <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
          Activos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'history' && styles.activeTab]}
        onPress={() => setActiveTab('history')}
      >
        <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
          Historial
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBookingCard = (booking: MockBooking) => (
    <Card key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.serviceType}>{booking.serviceType}</Text>
          <Badge
            label={getStatusText(booking.status)}
            variant={getStatusColor(booking.status) as any}
            size="small"
          />
        </View>
        <Text style={styles.bookingPrice}>
          ${booking.price.toLocaleString('es-CL')}
        </Text>
      </View>

      <View style={styles.bookingDetails}>
        <Text style={styles.bookingDate}>
          📅 {booking.date} a las {booking.time}
        </Text>
        <Text style={styles.bookingAddress}>📍 {booking.address}</Text>
        {isProvider && booking.consumerName && (
          <Text style={styles.bookingPerson}>👤 {booking.consumerName}</Text>
        )}
        {!isProvider && booking.providerName && (
          <Text style={styles.bookingPerson}>👨‍🔧 {booking.providerName}</Text>
        )}
      </View>

      {booking.description && (
        <Text style={styles.bookingDescription}>{booking.description}</Text>
      )}

      {renderBookingActions(booking)}
    </Card>
  );

  const renderBookingActions = (booking: MockBooking) => {
    if (booking.status === 'completed') return null;

    return (
      <View style={styles.bookingActions}>
        {isProvider ? (
          // Provider actions
          <>
            {booking.status === 'requested' && (
              <>
                <Button
                  title="Aceptar"
                  onPress={() => {/* TODO: Accept booking */}}
                  variant="success"
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="Rechazar"
                  onPress={() => {/* TODO: Reject booking */}}
                  variant="outline"
                  size="small"
                  style={styles.actionButton}
                />
              </>
            )}
            {booking.status === 'accepted' && (
              <Button
                title="Comenzar Trabajo"
                onPress={() => {/* TODO: Start work */}}
                variant="primary"
                size="small"
                style={styles.actionButton}
              />
            )}
            {booking.status === 'in_progress' && (
              <Button
                title="Marcar Completado"
                onPress={() => {/* TODO: Complete work */}}
                variant="success"
                size="small"
                style={styles.actionButton}
              />
            )}
          </>
        ) : (
          // Consumer actions
          <>
            {booking.status === 'requested' && (
              <Button
                title="Cancelar Solicitud"
                onPress={() => {/* TODO: Cancel booking */}}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
            )}
            {booking.status === 'in_progress' && (
              <Button
                title="Contactar Profesional"
                onPress={() => {/* TODO: Contact provider */}}
                variant="primary"
                size="small"
                style={styles.actionButton}
              />
            )}
          </>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>
        {isProvider ? '📋' : '🏠'}
      </Text>
      <Text style={styles.emptyTitle}>
        {activeTab === 'active'
          ? isProvider
            ? 'No tienes solicitudes activas'
            : 'No tienes servicios solicitados'
          : 'Sin historial aún'
        }
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'active'
          ? isProvider
            ? 'Las solicitudes de trabajo aparecerán aquí cuando los clientes te contacten'
            : 'Una vez solicites un servicio, podrás verlo y gestionarlo desde aquí'
          : 'Los servicios completados aparecerán en tu historial'
        }
      </Text>
      {activeTab === 'active' && !isProvider && (
        <Button
          title="Buscar Servicios"
          onPress={() => {/* TODO: Navigate to search */}}
          variant="secondary"
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );

  const activeBookings = bookings.filter(b =>
    ['requested', 'accepted', 'in_progress'].includes(b.status)
  );
  const historyBookings = bookings.filter(b =>
    ['completed', 'cancelled'].includes(b.status)
  );

  const currentBookings = activeTab === 'active' ? activeBookings : historyBookings;

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
        {renderTabs()}

        {currentBookings.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.bookingsContainer}>
            {currentBookings.map(renderBookingCard)}
          </View>
        )}
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

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.semantic.background,
    paddingHorizontal: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  tab: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[2],
    marginRight: theme.spacing[6],
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary[500],
  },
  tabText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[600],
  },
  activeTabText: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Bookings
  bookingsContainer: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  bookingCard: {
    marginBottom: theme.spacing[3],
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  bookingInfo: {
    flex: 1,
    marginRight: theme.spacing[3],
  },
  serviceType: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[2],
  },
  bookingPrice: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[500],
  },
  bookingDetails: {
    marginBottom: theme.spacing[3],
    gap: theme.spacing[1],
  },
  bookingDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
  },
  bookingAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
  },
  bookingPerson: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  bookingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    marginBottom: theme.spacing[3],
    fontStyle: 'italic',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing[8],
    marginTop: theme.spacing[8],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[800],
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
  },
  emptyStateButton: {
    minWidth: 200,
  },
});

export default BookingsScreen;