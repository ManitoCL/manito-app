import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { EnterpriseCard } from '../ui';
import { colors, spacing, typography, borderRadius } from '../../design/tokens';
import { SearchFilters, ServiceCategory, ProjectType } from '../../types/search';
import { SearchService } from '../../services/searchService';
import { LocationService } from '../../services/locationService';

const { width, height } = Dimensions.get('window');

interface LocationSearchInterfaceProps {
  onSearch: (query: string, filters: SearchFilters, searchType: 'project' | 'service') => void;
  initialSearchType?: 'project' | 'service';
}

interface LocationSuggestion {
  id: string;
  address: string;
  commune: string;
  region: string;
  coordinates?: [number, number];
}

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'service' | 'project';
  category: string;
  synonyms: string[];
}

export const LocationSearchInterface: React.FC<LocationSearchInterfaceProps> = ({
  onSearch,
  initialSearchType = 'project',
}) => {
  // Core state
  const [searchType, setSearchType] = useState<'project' | 'service'>(initialSearchType);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Data state
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search suggestions state
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // UI state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [locationInputFocused, setLocationInputFocused] = useState(false);
  const [searchInputFocused, setSearchInputFocused] = useState(false);

  // Refs for input management
  const locationInputRef = useRef<TextInput>(null);
  const searchInputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const locationTimeoutRef = useRef<NodeJS.Timeout>();

  // Load initial data
  useEffect(() => {
    loadSearchData();
  }, []);

  // Handle search query changes with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        loadSearchSuggestions(searchQuery);
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchType]);

  // Handle location query changes with debouncing
  useEffect(() => {
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    if (locationQuery.length >= 3) {
      locationTimeoutRef.current = setTimeout(() => {
        loadLocationSuggestions(locationQuery);
      }, 300);
    } else {
      setLocationSuggestions([]);
    }

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, [locationQuery]);

  const loadSearchData = async () => {
    try {
      setIsLoading(true);
      const [services, projects] = await Promise.all([
        SearchService.getServiceCategories(),
        SearchService.getProjectTypes()
      ]);
      setServiceCategories(services);
      setProjectTypes(projects);
    } catch (error) {
      console.error('Error loading search data:', error);
      // Fallback to static data if database fails
      const { SERVICE_CATEGORIES, PROJECT_TYPES } = await import('../../data/searchData');
      setServiceCategories(SERVICE_CATEGORIES as any);
      setProjectTypes(PROJECT_TYPES as any);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationSuggestions = async (query: string) => {
    try {
      setIsLoadingLocation(true);
      const suggestions = await LocationService.searchLocations(query);
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading location suggestions:', error);
      // Fallback to mock Chilean communes
      const mockSuggestions: LocationSuggestion[] = [
        { id: '1', address: `${query}, Santiago`, commune: 'Santiago', region: 'Metropolitana' },
        { id: '2', address: `${query}, Las Condes`, commune: 'Las Condes', region: 'Metropolitana' },
        { id: '3', address: `${query}, Providencia`, commune: 'Providencia', region: 'Metropolitana' },
        { id: '4', address: `${query}, Ñuñoa`, commune: 'Ñuñoa', region: 'Metropolitana' },
      ].filter(item =>
        item.commune.toLowerCase().includes(query.toLowerCase()) ||
        item.address.toLowerCase().includes(query.toLowerCase())
      );
      setLocationSuggestions(mockSuggestions);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadSearchSuggestions = async (query: string) => {
    try {
      setIsLoadingSearch(true);

      // Build comprehensive search suggestions with synonyms
      const suggestions: SearchSuggestion[] = [];

      if (searchType === 'service') {
        serviceCategories.forEach(service => {
          // Chilean service synonyms for better matching
          const synonyms = getServiceSynonyms(service.name, service.id);
          if (matchesQuery(query, service.name, synonyms)) {
            suggestions.push({
              id: service.id,
              name: service.name,
              type: 'service',
              category: service.id,
              synonyms
            });
          }
        });
      } else {
        projectTypes.forEach(project => {
          // Chilean project synonyms for better matching
          const synonyms = getProjectSynonyms(project.name, project.id);
          if (matchesQuery(query, project.name, synonyms)) {
            suggestions.push({
              id: project.id,
              name: project.name,
              type: 'project',
              category: project.id,
              synonyms
            });
          }
        });
      }

      setSearchSuggestions(suggestions.slice(0, 8)); // Limit to 8 suggestions
      setShowSearchSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error loading search suggestions:', error);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Chilean-specific synonym matching
  const getServiceSynonyms = (serviceName: string, serviceId: string): string[] => {
    const synonymMap: Record<string, string[]> = {
      'electricista': ['electricidad', 'eléctrico', 'luz', 'corriente', 'instalación eléctrica'],
      'gasfiter': ['plomero', 'plomería', 'cañerías', 'agua', 'desagüe', 'baño'],
      'limpieza_hogar': ['limpiar', 'limpieza', 'aseo', 'clean', 'cleaning', 'doméstica'],
      'jardineria': ['jardín', 'pasto', 'plantas', 'césped', 'paisajismo'],
      'pintor': ['pintura', 'pintar', 'paint', 'paredes'],
      'carpintero': ['carpintería', 'madera', 'muebles', 'wood'],
      'cerrajero': ['cerradura', 'llave', 'seguridad', 'lock'],
      'tecnico_refrigeracion': ['refrigerador', 'nevera', 'aire acondicionado', 'frío']
    };

    return synonymMap[serviceId] || [serviceName.toLowerCase()];
  };

  const getProjectSynonyms = (projectName: string, projectId: string): string[] => {
    const synonymMap: Record<string, string[]> = {
      'reparar_bano': ['baño', 'bathroom', 'ducha', 'tina', 'inodoro', 'lavamanos'],
      'renovar_cocina': ['cocina', 'kitchen', 'muebles cocina', 'mesón'],
      'pintar_interior': ['pintar', 'pintura', 'paint', 'paredes', 'color'],
      'limpieza_profunda': ['limpiar', 'limpieza', 'aseo', 'cleaning'],
      'instalacion_electrica': ['electricidad', 'luz', 'cable', 'enchufes'],
      'reparar_techo': ['techo', 'roof', 'goteras', 'filtraciones']
    };

    return synonymMap[projectId] || [projectName.toLowerCase()];
  };

  const matchesQuery = (query: string, name: string, synonyms: string[]): boolean => {
    const lowerQuery = query.toLowerCase().trim();
    const lowerName = name.toLowerCase();

    // Direct name match
    if (lowerName.includes(lowerQuery)) return true;

    // Synonym match
    return synonyms.some(synonym =>
      synonym.toLowerCase().includes(lowerQuery) ||
      lowerQuery.includes(synonym.toLowerCase())
    );
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setLocationQuery(location.address);
    setLocationSuggestions([]);
    setShowLocationModal(false);
    locationInputRef.current?.blur();
  };

  const handleSearchSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.name);
    setSelectedCategory(suggestion.category);
    setSearchSuggestions([]);
    setShowSearchSuggestions(false);
    searchInputRef.current?.blur();

    // Auto-trigger search
    handleSearch(suggestion.name, suggestion.category);
  };

  const handleSearch = (query?: string, categoryId?: string) => {
    const finalQuery = query || searchQuery;
    const finalCategory = categoryId || selectedCategory;

    if (!selectedLocation) {
      setShowLocationModal(true);
      return;
    }

    const filters: SearchFilters = {
      location: {
        commune: selectedLocation.commune,
        region: selectedLocation.region,
        coordinates: selectedLocation.coordinates,
      },
      ...(searchType === 'service' && finalCategory && { serviceType: finalCategory }),
      ...(searchType === 'project' && finalCategory && { projectType: finalCategory }),
    };

    onSearch(finalQuery, filters, searchType);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    handleSearch('', categoryId);
  };

  const renderLocationSelector = () => (
    <View style={styles.locationContainer}>
      <Text style={styles.locationLabel}>📍 ¿Dónde necesitas el servicio?</Text>
      <TouchableOpacity
        style={[
          styles.locationButton,
          !selectedLocation && styles.locationButtonEmpty,
          locationInputFocused && styles.locationButtonFocused
        ]}
        onPress={() => setShowLocationModal(true)}
      >
        <Text style={[
          styles.locationButtonText,
          !selectedLocation && styles.locationButtonTextEmpty
        ]}>
          {selectedLocation ? selectedLocation.address : 'Ingresa tu dirección o código postal'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLocationModal = () => (
    <Modal
      visible={showLocationModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowLocationModal(false)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Selecciona tu ubicación</Text>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.locationSearchContainer}>
            <TextInput
              ref={locationInputRef}
              style={styles.locationSearchInput}
              placeholder="Busca por dirección, comuna o código postal..."
              value={locationQuery}
              onChangeText={setLocationQuery}
              onFocus={() => setLocationInputFocused(true)}
              onBlur={() => setLocationInputFocused(false)}
              autoFocus
            />
            {isLoadingLocation && (
              <ActivityIndicator size="small" color={colors.primary[500]} style={styles.searchLoader} />
            )}
          </View>

          <FlatList
            data={locationSuggestions}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationSuggestion}
                onPress={() => handleLocationSelect(item)}
              >
                <Text style={styles.locationSuggestionAddress}>{item.address}</Text>
                <Text style={styles.locationSuggestionDetails}>
                  {item.commune}, {item.region}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                {locationQuery.length >= 3 ? (
                  <Text style={styles.emptyText}>
                    No se encontraron resultados para "{locationQuery}"
                  </Text>
                ) : (
                  <Text style={styles.emptyText}>
                    Escribe al menos 3 caracteres para buscar ubicaciones
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderSearchTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, searchType === 'project' && styles.activeTab]}
        onPress={() => {
          setSearchType('project');
          setSelectedCategory(null);
          setSearchQuery('');
        }}
      >
        <Text style={[styles.tabText, searchType === 'project' && styles.activeTabText]}>
          🏠 Por Proyecto
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, searchType === 'service' && styles.activeTab]}
        onPress={() => {
          setSearchType('service');
          setSelectedCategory(null);
          setSearchQuery('');
        }}
      >
        <Text style={[styles.tabText, searchType === 'service' && styles.activeTabText]}>
          👨‍🔧 Por Servicio
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderIntelligentSearchBar = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchBarContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder={
            searchType === 'project'
              ? '¿Qué necesitas hacer? (ej. reparar baño, pintar)'
              : '¿Qué profesional buscas? (ej. plomero, limpiar)'
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchInputFocused(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow selection
            setTimeout(() => setShowSearchSuggestions(false), 200);
            setSearchInputFocused(false);
          }}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch()}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
        {isLoadingSearch && (
          <ActivityIndicator size="small" color={colors.primary[500]} style={styles.searchLoader} />
        )}
      </View>

      {/* Intelligent Search Suggestions */}
      {showSearchSuggestions && searchSuggestions.length > 0 && (
        <View style={styles.searchSuggestionsContainer}>
          <FlatList
            data={searchSuggestions}
            keyExtractor={(item) => item.id}
            style={styles.searchSuggestionsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchSuggestion}
                onPress={() => handleSearchSuggestionSelect(item)}
              >
                <Text style={styles.searchSuggestionIcon}>
                  {item.type === 'service' ? '👨‍🔧' : '🏠'}
                </Text>
                <View style={styles.searchSuggestionContent}>
                  <Text style={styles.searchSuggestionName}>{item.name}</Text>
                  <Text style={styles.searchSuggestionType}>
                    {item.type === 'service' ? 'Servicio' : 'Proyecto'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );

  const renderCategories = () => {
    const items = searchType === 'project' ? projectTypes : serviceCategories;

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>
          {searchType === 'project' ? 'Proyectos Populares' : 'Servicios Disponibles'}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {items.slice(0, 8).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryCard,
                selectedCategory === item.id && styles.selectedCategoryCard,
              ]}
              onPress={() => handleCategorySelect(item.id)}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === item.id && styles.selectedCategoryName,
              ]}>
                {item.name}
              </Text>
              <Text style={styles.categoryPrice}>
                {searchType === 'project'
                  ? `CLP $${Number((item as ProjectType).avg_price_min ?? 0).toLocaleString()} - $${Number((item as ProjectType).avg_price_max ?? 0).toLocaleString()}`
                  : `CLP $${Number((item as ServiceCategory).avgPriceMin ?? 0).toLocaleString()} - $${Number((item as ServiceCategory).avgPriceMax ?? 0).toLocaleString()}`
                }
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.allCategoriesGrid}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.gridItem,
                selectedCategory === item.id && styles.selectedGridItem,
              ]}
              onPress={() => handleCategorySelect(item.id)}
            >
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={[
                styles.gridText,
                selectedCategory === item.id && styles.selectedGridText,
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <EnterpriseCard style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Cargando servicios...</Text>
        </View>
      </EnterpriseCard>
    );
  }

  return (
    <EnterpriseCard style={styles.container}>
      {renderLocationSelector()}
      {renderSearchTabs()}
      {renderIntelligentSearchBar()}

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderCategories()}
      </ScrollView>

      {renderLocationModal()}
    </EnterpriseCard>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing[4],
    padding: spacing[4],
    maxHeight: height * 0.8,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: spacing[3],
    fontSize: 16,
    color: colors.neutral[600],
  },

  // Location selector
  locationContainer: {
    marginBottom: spacing[4],
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  locationButton: {
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary[50],
  },
  locationButtonEmpty: {
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  locationButtonFocused: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[100],
  },
  locationButtonText: {
    fontSize: 16,
    color: colors.primary[700],
    textAlign: 'center',
    fontWeight: '500',
  },
  locationButtonTextEmpty: {
    color: colors.neutral[600],
    fontWeight: '400',
  },

  // Location modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    left: spacing[4],
    padding: spacing[2],
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.neutral[600],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  modalContent: {
    flex: 1,
    padding: spacing[4],
  },
  locationSearchContainer: {
    position: 'relative',
    marginBottom: spacing[4],
  },
  locationSearchInput: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: 16,
    backgroundColor: colors.neutral[0],
  },
  suggestionsList: {
    flex: 1,
  },
  locationSuggestion: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  locationSuggestionAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  locationSuggestionDetails: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  emptyContainer: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral[600],
    textAlign: 'center',
  },

  // Search tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing[1],
    marginBottom: spacing[4],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  activeTabText: {
    color: colors.neutral[0],
  },

  // Intelligent search section
  searchSection: {
    marginBottom: spacing[5],
  },
  searchBarContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    marginRight: spacing[2],
    backgroundColor: colors.neutral[0],
  },
  searchButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  searchLoader: {
    position: 'absolute',
    right: spacing[16],
    top: spacing[3] + 2,
  },

  // Search suggestions
  searchSuggestionsContainer: {
    position: 'absolute',
    top: spacing[12],
    left: 0,
    right: spacing[16], // Account for search button
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxHeight: 200,
  },
  searchSuggestionsList: {
    flex: 1,
  },
  searchSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  searchSuggestionIcon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  searchSuggestionContent: {
    flex: 1,
  },
  searchSuggestionName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  searchSuggestionType: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: spacing[1],
  },

  // Categories (reusing existing styles with some modifications)
  scrollContainer: {
    flex: 1,
  },
  categoriesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[4],
  },
  horizontalScroll: {
    marginBottom: spacing[4],
  },
  categoryCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginRight: spacing[3],
    width: 160,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategoryCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  selectedCategoryName: {
    color: colors.primary[700],
  },
  categoryPrice: {
    fontSize: 12,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  allCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing[4],
  },
  gridItem: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    width: (width - spacing[4] * 2 - spacing[4] * 2 - spacing[3]) / 2,
    marginBottom: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  selectedGridItem: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  gridIcon: {
    fontSize: 24,
    marginBottom: spacing[2],
  },
  gridText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[800],
    textAlign: 'center',
  },
  selectedGridText: {
    color: colors.primary[700],
    fontWeight: '600',
  },
});