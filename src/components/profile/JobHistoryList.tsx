// =============================================================================
// JOB HISTORY LIST - CUSTOMER BOOKING HISTORY MANAGEMENT
// Epic #2: Profile Management - Job History Features
// =============================================================================
// Comprehensive job history display with filtering, rating, and rebooking
// Integrates with enterprise patterns and Chilean UX standards
// Author: Frontend UI Expert
// Created: 2025-09-19

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { es } from 'date-fns/locale';

// Enterprise auth hooks
import { useEnterpriseAuth, useProfileData } from '../../hooks/useEnterpriseAuth';

// Storage components for photos
import { AvatarProgressiveImage } from '../storage/ProgressiveImage';

// UI components
import { Button } from '../ui/Button';

const { width: screenWidth } = Dimensions.get('window');

// =============================================================================
// INTERFACES
// =============================================================================

export interface JobBooking {
  id: string;
  serviceType: string; // 'plumber', 'electrician', 'cleaner', etc.
  serviceCategory: string; // 'Plomería', 'Electricidad', 'Limpieza'
  title: string; // Service title/description
  description?: string; // Detailed description

  // Provider information
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  providerRating: number;
  providerCompletedJobs: number;

  // Booking details
  scheduledDate: string; // ISO date string
  scheduledTime: string; // Time slot like "09:00-11:00"
  duration: number; // Minutes
  price: number; // CLP
  currency: 'CLP';

  // Status tracking
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  paymentStatus: 'pending' | 'paid' | 'refunded';

  // Address information
  address: {
    label: string; // "Casa", "Trabajo"
    fullAddress: string;
    comuna: string;
    specialInstructions?: string;
  };

  // Customer feedback
  customerRating?: number; // 1-5 stars
  customerReview?: string;
  customerPhotos?: string[]; // Photos taken by customer
  reviewDate?: string;

  // Provider feedback
  providerNotes?: string;
  providerPhotos?: string[]; // Before/after photos

  // Timestamps
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  completedAt?: string; // ISO date
  cancelledAt?: string; // ISO date

  // Rebooking capability
  canRebook: boolean;
  canRate: boolean;
  canCancel: boolean;
}

interface JobHistoryProps {
  jobs?: JobBooking[];
  onJobPress?: (job: JobBooking) => void;
  onRebookPress?: (job: JobBooking) => void;
  onRatePress?: (job: JobBooking) => void;
  onRefresh?: () => Promise<void>;
  showHeader?: boolean;
  maxItems?: number;
}

type FilterType = 'all' | 'completed' | 'cancelled' | 'pending';
type SortType = 'date_desc' | 'date_asc' | 'rating_desc' | 'price_desc';

// =============================================================================
// JOB HISTORY LIST COMPONENT
// =============================================================================

export const JobHistoryList: React.FC<JobHistoryProps> = ({
  jobs = [],
  onJobPress,
  onRebookPress,
  onRatePress,
  onRefresh,
  showHeader = true,
  maxItems,
}) => {
  const { user } = useEnterpriseAuth();
  const { profile } = useProfileData();

  // State
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedSort, setSelectedSort] = useState<SortType>('date_desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // =============================================================================
  // COMPUTED DATA
  // =============================================================================

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs;

    // Apply filter
    switch (selectedFilter) {
      case 'completed':
        filtered = jobs.filter(job => job.status === 'completed');
        break;
      case 'cancelled':
        filtered = jobs.filter(job => job.status === 'cancelled' || job.status === 'no_show');
        break;
      case 'pending':
        filtered = jobs.filter(job => ['pending', 'confirmed', 'in_progress'].includes(job.status));
        break;
      default:
        filtered = jobs;
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date_asc':
          return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
        case 'date_desc':
          return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
        case 'rating_desc':
          return (b.customerRating || 0) - (a.customerRating || 0);
        case 'price_desc':
          return b.price - a.price;
        default:
          return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
      }
    });

    // Apply limit if specified
    if (maxItems && maxItems > 0) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [jobs, selectedFilter, selectedSort, maxItems]);

  const stats = useMemo(() => {
    const completed = jobs.filter(job => job.status === 'completed').length;
    const cancelled = jobs.filter(job => job.status === 'cancelled' || job.status === 'no_show').length;
    const pending = jobs.filter(job => ['pending', 'confirmed', 'in_progress'].includes(job.status)).length;
    const totalSpent = jobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + job.price, 0);
    const averageRating = jobs
      .filter(job => job.customerRating)
      .reduce((sum, job, _, arr) => sum + (job.customerRating! / arr.length), 0);

    return {
      total: jobs.length,
      completed,
      cancelled,
      pending,
      totalSpent,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }, [jobs]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
        Alert.alert('Error', 'No se pudo actualizar el historial');
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onRefresh]);

  const handleJobPress = useCallback((job: JobBooking) => {
    if (onJobPress) {
      onJobPress(job);
    } else {
      // Default action: show job details
      Alert.alert(
        job.title,
        `Estado: ${getStatusLabel(job.status)}\nFecha: ${formatJobDate(job.scheduledDate)}\nPrecio: ${formatPrice(job.price)}`,
        [{ text: 'OK' }]
      );
    }
  }, [onJobPress]);

  const handleRebookPress = useCallback((job: JobBooking) => {
    if (onRebookPress) {
      onRebookPress(job);
    } else {
      Alert.alert(
        'Reservar Nuevamente',
        `¿Quieres solicitar nuevamente el servicio "${job.title}" con ${job.providerName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reservar', onPress: () => console.log('Rebooking job:', job.id) },
        ]
      );
    }
  }, [onRebookPress]);

  const handleRatePress = useCallback((job: JobBooking) => {
    if (onRatePress) {
      onRatePress(job);
    } else {
      Alert.alert(
        'Calificar Servicio',
        `Califica el servicio "${job.title}" realizado por ${job.providerName}`,
        [{ text: 'OK' }]
      );
    }
  }, [onRatePress]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getStatusLabel = (status: JobBooking['status']): string => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'No se presentó';
      default: return status;
    }
  };

  const getStatusColor = (status: JobBooking['status']): string => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'in_progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'cancelled':
      case 'no_show': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatJobDate = (dateString: string): string => {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return 'Hoy';
    } else if (isYesterday(date)) {
      return 'Ayer';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE', { locale: es });
    } else if (isThisMonth(date)) {
      return format(date, 'd \'de\' MMMM', { locale: es });
    } else {
      return format(date, 'd \'de\' MMMM, yyyy', { locale: es });
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatRating = (rating: number): string => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 !== 0 ? '½' : '');
  };

  // =============================================================================
  // RENDER METHODS
  // =============================================================================

  const renderFilterButton = () => (
    <TouchableOpacity
      style={styles.filterButton}
      onPress={() => setShowFilterModal(true)}
      accessibilityLabel="Filtrar historial"
    >
      <Text style={styles.filterButtonText}>Filtrar</Text>
      <Text style={styles.filterButtonIcon}>▼</Text>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.completed}</Text>
        <Text style={styles.statLabel}>Completados</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{formatPrice(stats.totalSpent)}</Text>
        <Text style={styles.statLabel}>Gastado</Text>
      </View>
      {stats.averageRating > 0 && (
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.averageRating}</Text>
          <Text style={styles.statLabel}>Rating Promedio</Text>
        </View>
      )}
    </View>
  );

  const renderJobCard = ({ item: job }: { item: JobBooking }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => handleJobPress(job)}
      activeOpacity={0.7}
    >
      {/* Job Header */}
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobCategory}>{job.serviceCategory}</Text>
        </View>

        <View style={styles.jobStatusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(job.status) + '20' }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(job.status) }
            ]} />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(job.status) }
            ]}>
              {getStatusLabel(job.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Provider Info */}
      <View style={styles.providerSection}>
        <AvatarProgressiveImage
          src={job.providerAvatar}
          size={40}
          userName={job.providerName}
        />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{job.providerName}</Text>
          <Text style={styles.providerStats}>
            {formatRating(job.providerRating)} • {job.providerCompletedJobs} trabajos
          </Text>
        </View>
      </View>

      {/* Job Details */}
      <View style={styles.jobDetails}>
        <View style={styles.jobDetailRow}>
          <Text style={styles.jobDetailIcon}>📅</Text>
          <Text style={styles.jobDetailText}>
            {formatJobDate(job.scheduledDate)} • {job.scheduledTime}
          </Text>
        </View>

        <View style={styles.jobDetailRow}>
          <Text style={styles.jobDetailIcon}>📍</Text>
          <Text style={styles.jobDetailText} numberOfLines={1}>
            {job.address.label} • {job.address.comuna}
          </Text>
        </View>

        <View style={styles.jobDetailRow}>
          <Text style={styles.jobDetailIcon}>💰</Text>
          <Text style={styles.jobDetailText}>{formatPrice(job.price)}</Text>
        </View>

        {job.customerRating && (
          <View style={styles.jobDetailRow}>
            <Text style={styles.jobDetailIcon}>⭐</Text>
            <Text style={styles.jobDetailText}>
              Tu calificación: {formatRating(job.customerRating)}
            </Text>
          </View>
        )}
      </View>

      {/* Customer Review */}
      {job.customerReview && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewText} numberOfLines={2}>
            "{job.customerReview}"
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.jobActions}>
        {job.canRebook && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRebookPress(job)}
          >
            <Text style={styles.actionButtonText}>Reservar Nuevamente</Text>
          </TouchableOpacity>
        )}

        {job.canRate && !job.customerRating && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rateButton]}
            onPress={() => handleRatePress(job)}
          >
            <Text style={styles.rateButtonText}>Calificar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filtrar Historial</Text>
            <TouchableOpacity
              style={styles.filterModalClose}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.filterModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Estado</Text>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'completed', label: 'Completados' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'cancelled', label: 'Cancelados' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterOption,
                  selectedFilter === filter.key && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setSelectedFilter(filter.key as FilterType);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedFilter === filter.key && styles.filterOptionTextSelected
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Ordenar por</Text>
            {[
              { key: 'date_desc', label: 'Fecha (más reciente)' },
              { key: 'date_asc', label: 'Fecha (más antiguo)' },
              { key: 'rating_desc', label: 'Calificación (mayor)' },
              { key: 'price_desc', label: 'Precio (mayor)' },
            ].map((sort) => (
              <TouchableOpacity
                key={sort.key}
                style={[
                  styles.filterOption,
                  selectedSort === sort.key && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setSelectedSort(sort.key as SortType);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedSort === sort.key && styles.filterOptionTextSelected
                ]}>
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>
        {selectedFilter === 'all' ? 'No tienes servicios registrados' : 'No hay servicios para este filtro'}
      </Text>
      <Text style={styles.emptyStateText}>
        {selectedFilter === 'all'
          ? 'Cuando solicites servicios, aparecerán aquí'
          : 'Prueba cambiando el filtro para ver más resultados'
        }
      </Text>
    </View>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Mi Historial de Servicios</Text>
            {renderFilterButton()}
          </View>
          {renderStats()}
        </View>
      )}

      <FlatList
        data={filteredAndSortedJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {renderFilterModal()}
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  filterButtonIcon: {
    fontSize: 12,
    color: '#007AFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#f8fbff',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  jobCategory: {
    fontSize: 14,
    color: '#666666',
  },
  jobStatusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  providerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  providerStats: {
    fontSize: 14,
    color: '#666666',
  },
  jobDetails: {
    marginBottom: 12,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  jobDetailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  jobDetailText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  reviewSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#333333',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  rateButton: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ea580c',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  filterModalClose: {
    padding: 4,
  },
  filterModalCloseText: {
    fontSize: 18,
    color: '#666666',
  },
  filterSection: {
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#ffffff',
  },
  filterOptionSelected: {
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  filterOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default JobHistoryList;