import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useEnterpriseAuth';
import { EnterpriseCard, Button } from '../../components/ui';
import { LocationSearchInterface } from '../../components/search/LocationSearchInterface';
import { colors, spacing } from '../../design/tokens';
import { SearchFilters, SearchResult } from '../../types/search';
import { SearchService } from '../../services/searchService';

const { width } = Dimensions.get('window');

// Service categories for Chilean market
const SERVICE_CATEGORIES = [
  { id: '1', name: 'Electricista', icon: '⚡', description: 'Instalación y reparación eléctrica', color: colors.warning[500] },
  { id: '2', name: 'Plomero', icon: '🔧', description: 'Reparación de cañerías y grifos', color: colors.primary[500] },
  { id: '3', name: 'Limpieza', icon: '🧽', description: 'Limpieza de hogar y oficinas', color: colors.success[500] },
  { id: '4', name: 'Jardinería', icon: '🌱', description: 'Cuidado de jardines y plantas', color: colors.success[600] },
  { id: '5', name: 'Pintura', icon: '🎨', description: 'Pintura interior y exterior', color: colors.secondary[500] },
  { id: '6', name: 'Carpintería', icon: '🔨', description: 'Muebles y reparaciones de madera', color: colors.neutral[700] },
  { id: '7', name: 'Técnico', icon: '📱', description: 'Reparación de electrodomésticos', color: colors.primary[600] },
  { id: '8', name: 'Construcción', icon: '🏗️', description: 'Obras menores y remodelación', color: colors.neutral[800] },
];

// Featured providers mock data (fixed for text rendering)
const FEATURED_PROVIDERS = [
  { id: '1', name: 'Juan Pérez', service: 'Electricista', rating: 4.9, reviews: 127, verified: true, distance: '0.8 km' },
  { id: '2', name: 'María González', service: 'Limpieza', rating: 4.8, reviews: 89, verified: true, distance: '1.2 km' },
  { id: '3', name: 'Carlos Mendoza', service: 'Plomero', rating: 4.9, reviews: 156, verified: true, distance: '0.5 km' },
];

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isProvider = user?.userType === 'provider';

  const handleSearch = async (query: string, filters: SearchFilters, searchType: 'project' | 'service') => {
    setIsSearching(true);
    console.log('Searching for:', { query, filters, searchType });

    try {
      let results: SearchResult;

      if (searchType === 'service') {
        results = await SearchService.searchProvidersByService(query, filters);
      } else {
        results = await SearchService.searchProvidersByProject(query, filters);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error?.message || error);
      console.error('Full search error details:', JSON.stringify(error, null, 2));

      // Fallback to mock data if search fails
      const mockResults: SearchResult = {
        providers: FEATURED_PROVIDERS.filter(provider =>
          query === '' ||
          provider.name.toLowerCase().includes(query.toLowerCase()) ||
          provider.service.toLowerCase().includes(query.toLowerCase())
        ).map(provider => ({
          id: provider.id,
          name: provider.name,
          businessName: provider.service,
          rating: provider.rating,
          reviewCount: provider.reviews,
          services: [provider.service.toLowerCase()],
          serviceAreas: ['santiago'],
          location: {
            commune: 'santiago',
            region: 'Metropolitana'
          },
          isVerified: provider.verified,
          verificationStatus: 'approved' as const,
          responseTime: '2 hours',
          responseTimeHours: 2,
          isAvailableToday: true,
          pricing: {
            hourlyRate: 25000
          },
          availability: {
            nextAvailable: new Date(),
            isAvailableToday: true,
            workingHours: {
              start: '08:00',
              end: '18:00'
            }
          },
          portfolio: {
            photos: [],
            completedProjects: provider.reviews
          },
          certifications: [],
          languages: ['español'],
          specialties: []
        })),
        totalCount: 3,
        filters,
        searchType
      };

      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleServiceCategoryPress = (categoryId: string) => {
    // Navigate to service category screen
    console.log('Navigate to category:', categoryId);
  };

  const handleProviderPress = (providerId: string) => {
    // Navigate to provider profile
    console.log('Navigate to provider:', providerId);
  };

  const handleSearchPress = () => {
    // Navigate to search screen
    console.log('Navigate to search');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            ¡Hola, {user?.fullName || 'Usuario'}!
          </Text>
          <Text style={styles.subtitle}>
            {isProvider
              ? 'Gestiona tus servicios y solicitudes'
              : 'Encuentra servicios confiables para tu hogar'}
          </Text>
        </View>

        {!isProvider && (
          <>
            {/* Search Interface */}
            <LocationSearchInterface
              onSearch={handleSearch}
              initialSearchType="service"
            />

            {/* Search Results */}
            {searchResults && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Resultados ({(searchResults.totalCount ?? 0).toString()})
                  </Text>
                  {isSearching && <ActivityIndicator size="small" color={colors.primary[500]} />}
                </View>

                {searchResults.providers.length > 0 ? (
                  searchResults.providers.map((provider) => (
                    <EnterpriseCard
                      key={provider.id}
                      style={styles.providerCard}
                      variant="interactive"
                      onPress={() => handleProviderPress(provider.id)}
                    >
                      <View style={styles.providerInfo}>
                        <View style={styles.providerHeader}>
                          <View style={styles.providerAvatar}>
                            <Text style={styles.providerInitial}>
                              {(provider.name || 'U').charAt(0)}
                            </Text>
                          </View>
                          <View style={styles.providerDetails}>
                            <View style={styles.providerNameRow}>
                              <Text style={styles.providerName}>{provider.name || 'Proveedor'}</Text>
                              {provider.isVerified && (
                                <View style={styles.verifiedBadge}>
                                  <Text style={styles.verifiedIcon}>✓</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.providerService}>
                              {provider.businessName || (provider.services && provider.services.length > 0 ? provider.services.join(', ') : 'Servicios generales')}
                            </Text>
                            <View style={styles.providerMeta}>
                              <View style={styles.ratingContainer}>
                                <Text style={styles.starIcon}>⭐</Text>
                                <Text style={styles.rating}>{(provider.rating ?? 0).toString()}</Text>
                                <Text style={styles.reviewCount}>({(provider.reviewCount ?? 0).toString()} reseñas)</Text>
                              </View>
                              {provider.distance && (
                                <Text style={styles.distance}>• {provider.distance}km</Text>
                              )}
                            </View>
                            {provider.pricing?.hourlyRate && (
                              <Text style={styles.priceText}>
                                CLP ${Number(provider.pricing?.hourlyRate ?? 0).toLocaleString()}/hora
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </EnterpriseCard>
                  ))
                ) : (
                  <EnterpriseCard style={styles.emptyStateCard}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyStateText}>
                      No encontramos resultados
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Intenta con otros términos de búsqueda o ajusta los filtros
                    </Text>
                  </EnterpriseCard>
                )}
              </View>
            )}

            {/* Service Categories - only show if no search results */}
            {!searchResults && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Servicios Populares</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
              >
                {SERVICE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() => handleServiceCategoryPress(category.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color ? `${category.color}20` : colors.neutral[200] }]}>
                      <Text style={styles.categoryEmoji}>{category.icon}</Text>
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            )}

            {/* Featured Providers - only show if no search results */}
            {!searchResults && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Proveedores Destacados</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>Ver todos</Text>
                </TouchableOpacity>
              </View>

              {FEATURED_PROVIDERS.map((provider) => (
                <EnterpriseCard
                  key={provider.id}
                  style={styles.providerCard}
                  variant="interactive"
                  onPress={() => handleProviderPress(provider.id)}
                >
                  <View style={styles.providerInfo}>
                    <View style={styles.providerHeader}>
                      <View style={styles.providerAvatar}>
                        <Text style={styles.providerInitial}>
                          {(provider.name || 'P').charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.providerDetails}>
                        <View style={styles.providerNameRow}>
                          <Text style={styles.providerName}>{provider.name}</Text>
                          {provider.verified && (
                            <View style={styles.verifiedBadge}>
                              <Text style={styles.verifiedIcon}>✓</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.providerService}>{provider.service || 'Servicio'}</Text>
                        <View style={styles.providerMeta}>
                          <View style={styles.ratingContainer}>
                            <Text style={styles.starIcon}>⭐</Text>
                            <Text style={styles.rating}>{(provider.rating ?? 0).toString()}</Text>
                            <Text style={styles.reviewCount}>({(provider.reviews ?? 0).toString()} reseñas)</Text>
                          </View>
                          <Text style={styles.distance}>• {provider.distance}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </EnterpriseCard>
              ))}
            </View>
            )}

            {/* Trust Indicators */}
            <EnterpriseCard style={styles.trustCard} variant="feature">
              <View style={styles.trustHeader}>
                <Text style={styles.trustIcon}>🛡️</Text>
                <Text style={styles.trustTitle}>Garantía Manito</Text>
              </View>
              <Text style={styles.trustSubtitle}>
                Todos nuestros proveedores están verificados con RUT válido, seguro de responsabilidad civil y garantía en el trabajo.
              </Text>
              <View style={styles.trustFeatures}>
                <View style={styles.trustFeature}>
                  <Text style={styles.trustFeatureIcon}>✅</Text>
                  <Text style={styles.trustFeatureText}>RUT Verificado</Text>
                </View>
                <View style={styles.trustFeature}>
                  <Text style={styles.trustFeatureIcon}>🏥</Text>
                  <Text style={styles.trustFeatureText}>Seguro Incluido</Text>
                </View>
                <View style={styles.trustFeature}>
                  <Text style={styles.trustFeatureIcon}>💯</Text>
                  <Text style={styles.trustFeatureText}>Garantía 30 días</Text>
                </View>
              </View>
            </EnterpriseCard>
          </>
        )}

        {isProvider && (
          <>
            {/* Provider Dashboard */}
            <View style={styles.providerStats}>
              <EnterpriseCard style={styles.statCard}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Trabajos Activos</Text>
              </EnterpriseCard>
              <EnterpriseCard style={styles.statCard}>
                <Text style={styles.statNumber}>4.9</Text>
                <Text style={styles.statLabel}>Calificación</Text>
              </EnterpriseCard>
              <EnterpriseCard style={styles.statCard}>
                <Text style={styles.statNumber}>$245.000</Text>
                <Text style={styles.statLabel}>Este Mes</Text>
              </EnterpriseCard>
            </View>

            {/* Provider Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionCard}>
                  <Text style={styles.actionIcon}>📋</Text>
                  <Text style={styles.actionTitle}>Mis Servicios</Text>
                  <Text style={styles.actionSubtitle}>Gestionar servicios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <Text style={styles.actionIcon}>📅</Text>
                  <Text style={styles.actionTitle}>Agenda</Text>
                  <Text style={styles.actionSubtitle}>Ver programación</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <Text style={styles.actionIcon}>💰</Text>
                  <Text style={styles.actionTitle}>Ingresos</Text>
                  <Text style={styles.actionSubtitle}>Revisar ganancias</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <Text style={styles.actionIcon}>⭐</Text>
                  <Text style={styles.actionTitle}>Reseñas</Text>
                  <Text style={styles.actionSubtitle}>Ver valoraciones</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <EnterpriseCard style={styles.emptyStateCard}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyStateText}>
              No hay actividad reciente
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {isProvider
                ? 'Cuando recibas solicitudes, aparecerán aquí'
                : 'Cuando realices reservas, aparecerán aquí'}
            </Text>
          </EnterpriseCard>
        </View>

        {/* Account Status */}
        <EnterpriseCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.userType}>
              {isProvider ? 'Proveedor de Servicios' : 'Cliente'}
            </Text>
            <View style={styles.verificationBadge}>
              <Text style={styles.verificationIcon}>
                {user?.isEmailVerified ? '✅' : '⏳'}
              </Text>
              <Text
                style={[
                  styles.verificationText,
                  user?.isEmailVerified ? styles.verified : styles.unverified,
                ]}
              >
                {user?.isEmailVerified
                  ? 'Email verificado'
                  : 'Email pendiente de verificación'}
              </Text>
            </View>
          </View>
          <Text style={styles.userEmail}>{user?.email || 'Email no disponible'}</Text>
        </EnterpriseCard>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <Button
            title="Cerrar Sesión"
            onPress={handleSignOut}
            variant="outline"
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing[4], // 16px
  },
  scrollContent: {
    paddingBottom: 84, // Extra padding for tab bar (64px tab bar + 20px spacing)
  },
  header: {
    marginBottom: spacing[8], // 32px
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: spacing[1], // 4px
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[600],
    lineHeight: 24,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: 12,
    paddingHorizontal: spacing[5], // 20px
    paddingVertical: spacing[4], // 16px
    marginBottom: spacing[8], // 32px
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing[3], // 12px
    color: colors.neutral[400],
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[500],
  },

  // Sections
  section: {
    marginBottom: spacing[8], // 32px
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6], // 24px
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '500',
  },

  // Service Categories
  categoriesContainer: {
    paddingRight: spacing[4], // 16px
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: spacing[6], // 24px
    width: 80,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3], // 12px
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[700],
    textAlign: 'center',
  },

  // Provider Cards
  providerCard: {
    marginBottom: spacing[4], // 16px
  },
  providerInfo: {
    padding: spacing[4], // 16px
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4], // 16px
  },
  providerInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[700],
  },
  providerDetails: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1], // 4px
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginRight: spacing[3], // 12px
  },
  verifiedBadge: {
    backgroundColor: colors.success[100],
    borderRadius: 10,
    paddingHorizontal: spacing[1], // 4px
    paddingVertical: 2,
  },
  verifiedIcon: {
    fontSize: 12,
    color: colors.success[700],
  },
  providerService: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: spacing[3], // 12px
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 14,
    marginRight: spacing[1], // 4px
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginRight: spacing[1], // 4px
  },
  reviewCount: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  distance: {
    fontSize: 14,
    color: colors.neutral[500],
    marginLeft: spacing[3], // 12px
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
    marginTop: spacing[2], // 8px
  },

  // Trust Card
  trustCard: {
    marginBottom: spacing[8], // 32px
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
    borderWidth: 1,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3], // 12px
  },
  trustIcon: {
    fontSize: 24,
    marginRight: spacing[3], // 12px
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.success[800],
  },
  trustSubtitle: {
    fontSize: 14,
    color: colors.success[700],
    lineHeight: 20,
    marginBottom: spacing[6], // 24px
  },
  trustFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trustFeature: {
    alignItems: 'center',
    flex: 1,
  },
  trustFeatureIcon: {
    fontSize: 20,
    marginBottom: spacing[1], // 4px
  },
  trustFeatureText: {
    fontSize: 12,
    color: colors.success[700],
    textAlign: 'center',
    fontWeight: '500',
  },

  // Provider Stats
  providerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[8], // 32px
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing[1], // 4px
    padding: spacing[6], // 24px
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[600],
    marginBottom: spacing[1], // 4px
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    textAlign: 'center',
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: 12,
    padding: spacing[6], // 24px
    width: (width - spacing[4] * 2 - spacing[3]) / 2, // Calculate proper width
    marginBottom: spacing[4], // 16px
    alignItems: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing[3], // 12px
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[1], // 4px
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.neutral[600],
    textAlign: 'center',
  },

  // Empty State
  emptyStateCard: {
    padding: spacing[8], // 32px
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[4], // 16px
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral[600],
    marginBottom: spacing[1], // 4px
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
  },

  // Status Card
  statusCard: {
    marginBottom: spacing[8], // 32px
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3], // 12px
  },
  userType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success[600],
  },
  userEmail: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[3], // 12px
    paddingVertical: spacing[1], // 4px
    borderRadius: 20,
  },
  verificationIcon: {
    fontSize: 14,
    marginRight: spacing[1], // 4px
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  verified: {
    color: colors.success[600],
  },
  unverified: {
    color: colors.warning[600],
  },

  // Sign Out
  signOutContainer: {
    marginBottom: spacing[8], // 32px
  },
  signOutButton: {
    marginTop: spacing[4], // 16px
  },
});