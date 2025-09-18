import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { EnterpriseCard } from '../ui';
import { colors, spacing, typography, borderRadius } from '../../design/tokens';
import { SearchFilters, ServiceCategory, ProjectType } from '../../types/search';
import { SearchService } from '../../services/searchService';

const { width } = Dimensions.get('window');

interface SearchInterfaceProps {
  onSearch: (query: string, filters: SearchFilters, searchType: 'project' | 'service') => void;
  initialSearchType?: 'project' | 'service';
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  initialSearchType = 'project',
}) => {
  const [searchType, setSearchType] = useState<'project' | 'service'>(initialSearchType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    loadSearchData();
  }, []);

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

  const handleSearch = () => {
    const filters: SearchFilters = {
      ...(searchType === 'service' && selectedCategory && { serviceType: selectedCategory }),
      ...(searchType === 'project' && selectedCategory && { projectType: selectedCategory }),
    };

    onSearch(searchQuery, filters, searchType);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');

    // Auto-search when category is selected
    const filters: SearchFilters = {
      ...(searchType === 'service' && { serviceType: categoryId }),
      ...(searchType === 'project' && { projectType: categoryId }),
    };

    onSearch('', filters, searchType);
  };

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

  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={
          searchType === 'project'
            ? '¿Qué necesitas hacer? (ej. reparar baño)'
            : '¿Qué profesional buscas? (ej. plomero)'
        }
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>🔍</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProjectCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Proyectos Populares</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {projectTypes.slice(0, 8).map((project) => (
          <TouchableOpacity
            key={project.id}
            style={[
              styles.categoryCard,
              selectedCategory === project.id && styles.selectedCategoryCard,
            ]}
            onPress={() => handleCategorySelect(project.id)}
          >
            <Text style={styles.categoryIcon}>{project.icon || '🏠'}</Text>
            <Text style={[
              styles.categoryName,
              selectedCategory === project.id && styles.selectedCategoryName,
            ]}>
              {project.name}
            </Text>
            <Text style={styles.categoryPrice}>
              {project.avgPriceMin && project.avgPriceMax
                ? `CLP $${Number(project.avgPriceMin ?? 0).toLocaleString()} - $${Number(project.avgPriceMax ?? 0).toLocaleString()}`
                : ((project as any).avgPriceRange || 'Consultar precio')
              }
            </Text>
            <Text style={styles.categoryComplexity}>
              {project.complexity === 'simple' ? '⭐ Simple' :
               project.complexity === 'medium' ? '⭐⭐ Medio' :
               project.complexity === 'complex' ? '⭐⭐⭐ Complejo' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, { marginTop: spacing[6] }]}>Todas las Categorías</Text>
      <View style={styles.allCategoriesGrid}>
        {projectTypes.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={[
              styles.gridItem,
              selectedCategory === project.id && styles.selectedGridItem,
            ]}
            onPress={() => handleCategorySelect(project.id)}
          >
            <Text style={styles.gridIcon}>{project.icon || '🏠'}</Text>
            <Text style={[
              styles.gridText,
              selectedCategory === project.id && styles.selectedGridText,
            ]}>
              {project.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderServiceCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {serviceCategories.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.categoryCard,
              selectedCategory === service.id && styles.selectedCategoryCard,
            ]}
            onPress={() => handleCategorySelect(service.id)}
          >
            <Text style={styles.categoryIcon}>{service.icon || '🔧'}</Text>
            <Text style={[
              styles.categoryName,
              selectedCategory === service.id && styles.selectedCategoryName,
            ]}>
              {service.name}
            </Text>
            <Text style={styles.categoryPrice}>
              {service.avgPriceMin && service.avgPriceMax
                ? `CLP $${Number(service.avgPriceMin ?? 0).toLocaleString()} - $${Number(service.avgPriceMax ?? 0).toLocaleString()}`
                : ((service as any).avgPriceRange || 'Consultar precio')
              }
            </Text>
            <View style={styles.urgencyContainer}>
              {service.urgencyLevels?.includes('emergencia') && (
                <Text style={styles.emergencyBadge}>🚨 24h</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, { marginTop: spacing[6] }]}>Todos los Servicios</Text>
      <View style={styles.allCategoriesGrid}>
        {serviceCategories.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.gridItem,
              selectedCategory === service.id && styles.selectedGridItem,
            ]}
            onPress={() => handleCategorySelect(service.id)}
          >
            <Text style={styles.gridIcon}>{service.icon || '🔧'}</Text>
            <Text style={[
              styles.gridText,
              selectedCategory === service.id && styles.selectedGridText,
            ]}>
              {service.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
      {renderSearchTabs()}
      {renderSearchBar()}

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {searchType === 'project' ? renderProjectCategories() : renderServiceCategories()}
      </ScrollView>
    </EnterpriseCard>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing[4],
    padding: spacing[4],
    maxHeight: 600,
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

  // Tabs
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

  // Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    marginBottom: spacing[5],
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

  // Categories
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

  // Horizontal Scroll
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
    marginBottom: spacing[1],
  },
  categoryComplexity: {
    fontSize: 11,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  urgencyContainer: {
    marginTop: spacing[1],
  },
  emergencyBadge: {
    fontSize: 10,
    backgroundColor: colors.error[100],
    color: colors.error[700],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    textAlign: 'center',
  },

  // Grid Layout
  allCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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