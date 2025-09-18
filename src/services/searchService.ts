import { supabase } from './supabase';
import { SearchFilters, SearchResult, EnhancedServiceProvider, ServiceCategory, ProjectType } from '../types/search';

export class SearchService {
  // Service-based search using intelligent matching
  static async searchProvidersByService(
    query: string,
    filters: SearchFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResult> {
    try {
      console.log('🔍 Starting intelligent service search with:', { query, filters, limit, offset });

      // Get matching service categories using intelligent search
      const matchingServices = SearchService.intelligentServiceMatch(query, filters.serviceType);
      console.log('🎯 Matched services:', matchingServices);

      // Generate relevant mock providers based on matched services
      const mockProviders = SearchService.generateRelevantProviders(matchingServices, filters);

      console.log('✅ Service search successful, returning intelligent matches');

      return {
        providers: mockProviders,
        totalCount: mockProviders.length,
        filters,
        searchType: 'service'
      };
    } catch (error) {
      console.error('Service search error:', error?.message || error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Intelligent service matching with Chilean synonyms
  private static intelligentServiceMatch(query: string, serviceType?: string): string[] {
    if (serviceType) {
      return [serviceType]; // Direct category selection
    }

    if (!query || query.trim().length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();

    // Comprehensive Chilean service synonym mapping
    const serviceSynonyms: Record<string, string[]> = {
      'electricista': [
        'electricista', 'eléctrico', 'electricidad', 'luz', 'corriente', 'cable', 'enchufes',
        'instalación eléctrica', 'tablero eléctrico', 'cortocircuito', 'electric'
      ],
      'gasfiter': [
        'gasfiter', 'plomero', 'plomería', 'cañerías', 'agua', 'desagüe', 'baño', 'ducha',
        'inodoro', 'lavamanos', 'tina', 'llave de agua', 'filtración', 'destape', 'plumber'
      ],
      'limpieza_hogar': [
        'limpieza', 'limpiar', 'aseo', 'limpieza del hogar', 'limpieza doméstica', 'cleaning',
        'clean', 'doméstica', 'asesora del hogar', 'nana', 'empleada doméstica'
      ],
      'jardineria': [
        'jardinería', 'jardín', 'pasto', 'plantas', 'césped', 'paisajismo', 'poda',
        'mantención jardín', 'riego', 'garden', 'jardinero'
      ],
      'pintor': [
        'pintor', 'pintura', 'pintar', 'paint', 'paredes', 'muros', 'fachada',
        'empapelado', 'barniz', 'esmalte', 'latex'
      ],
      'carpintero': [
        'carpintero', 'carpintería', 'madera', 'muebles', 'wood', 'closet',
        'puertas', 'ventanas', 'deck', 'pergola', 'carpenter'
      ],
      'cerrajero': [
        'cerrajero', 'cerradura', 'llave', 'seguridad', 'lock', 'candado',
        'chapas', 'llaves de auto', 'duplicado llave', 'locksmith'
      ],
      'tecnico_refrigeracion': [
        'técnico refrigeración', 'refrigerador', 'nevera', 'aire acondicionado', 'frío',
        'reparación electrodomésticos', 'lavadora', 'secadora', 'microondas'
      ],
      'construccion': [
        'construcción', 'albañil', 'maestro', 'obra', 'cemento', 'ladrillos',
        'remodelación', 'ampliación', 'constructor', 'building'
      ],
      'mecanico_auto': [
        'mecánico auto', 'mecánico', 'auto', 'carro', 'vehículo', 'motor',
        'frenos', 'revisión técnica', 'mantención auto', 'mechanic'
      ]
    };

    const matchedServices: string[] = [];

    // Check each service for query matches
    Object.entries(serviceSynonyms).forEach(([serviceId, synonyms]) => {
      const hasMatch = synonyms.some(synonym => {
        const lowerSynonym = synonym.toLowerCase();
        return lowerSynonym.includes(lowerQuery) || lowerQuery.includes(lowerSynonym);
      });

      if (hasMatch) {
        matchedServices.push(serviceId);
      }
    });

    return matchedServices;
  }

  // Generate providers based on matched services
  private static generateRelevantProviders(matchingServices: string[], filters: SearchFilters): any[] {
    const providers: any[] = [];

    // Service-specific provider templates
    const serviceProviders: Record<string, any> = {
      'electricista': {
        id: '1',
        name: 'Juan Pérez',
        businessName: 'Electricidad JP',
        rating: 4.9,
        reviewCount: 127,
        services: ['electricista'],
        serviceAreas: ['santiago'],
        location: {
          commune: 'santiago',
          region: 'Metropolitana'
        },
        isVerified: true,
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
          completedProjects: 127
        },
        certifications: [],
        languages: ['español'],
        specialties: ['instalación eléctrica', 'reparaciones'],
        distance: '0.8 km'
      },
      'limpieza_hogar': {
        id: '2',
        name: 'María González',
        businessName: 'Limpieza Profesional MG',
        rating: 4.8,
        reviewCount: 89,
        services: ['limpieza_hogar'],
        serviceAreas: ['santiago'],
        location: {
          commune: 'santiago',
          region: 'Metropolitana'
        },
        isVerified: true,
        verificationStatus: 'approved' as const,
        responseTime: '1 hour',
        responseTimeHours: 1,
        isAvailableToday: true,
        pricing: {
          hourlyRate: 15000
        },
        availability: {
          nextAvailable: new Date(),
          isAvailableToday: true,
          workingHours: {
            start: '08:00',
            end: '17:00'
          }
        },
        portfolio: {
          photos: [],
          completedProjects: 89
        },
        certifications: [],
        languages: ['español'],
        specialties: ['limpieza profunda', 'limpieza regular'],
        distance: '1.2 km'
      },
      'gasfiter': {
        id: '3',
        name: 'Carlos Rodríguez',
        businessName: 'Gasfitería CR',
        rating: 4.7,
        reviewCount: 156,
        services: ['gasfiter'],
        serviceAreas: ['santiago'],
        location: {
          commune: 'santiago',
          region: 'Metropolitana'
        },
        isVerified: true,
        verificationStatus: 'approved' as const,
        responseTime: '3 hours',
        responseTimeHours: 3,
        isAvailableToday: true,
        pricing: {
          hourlyRate: 30000
        },
        availability: {
          nextAvailable: new Date(),
          isAvailableToday: true,
          workingHours: {
            start: '07:00',
            end: '19:00'
          }
        },
        portfolio: {
          photos: [],
          completedProjects: 156
        },
        certifications: [],
        languages: ['español'],
        specialties: ['reparación cañerías', 'instalación sanitarios'],
        distance: '0.5 km'
      },
      'jardineria': {
        id: '4',
        name: 'Luis Fernández',
        businessName: 'Jardines LF',
        rating: 4.6,
        reviewCount: 73,
        services: ['jardineria'],
        serviceAreas: ['santiago'],
        location: {
          commune: 'santiago',
          region: 'Metropolitana'
        },
        isVerified: true,
        verificationStatus: 'approved' as const,
        responseTime: '4 hours',
        responseTimeHours: 4,
        isAvailableToday: false,
        pricing: {
          hourlyRate: 18000
        },
        availability: {
          nextAvailable: new Date(Date.now() + 86400000),
          isAvailableToday: false,
          workingHours: {
            start: '08:00',
            end: '16:00'
          }
        },
        portfolio: {
          photos: [],
          completedProjects: 73
        },
        certifications: [],
        languages: ['español'],
        specialties: ['poda', 'paisajismo'],
        distance: '2.1 km'
      },
      'pintor': {
        id: '5',
        name: 'Ana Morales',
        businessName: 'Pinturas AM',
        rating: 4.9,
        reviewCount: 112,
        services: ['pintor'],
        serviceAreas: ['santiago'],
        location: {
          commune: 'santiago',
          region: 'Metropolitana'
        },
        isVerified: true,
        verificationStatus: 'approved' as const,
        responseTime: '2 hours',
        responseTimeHours: 2,
        isAvailableToday: true,
        pricing: {
          hourlyRate: 22000
        },
        availability: {
          nextAvailable: new Date(),
          isAvailableToday: true,
          workingHours: {
            start: '09:00',
            end: '18:00'
          }
        },
        portfolio: {
          photos: [],
          completedProjects: 112
        },
        certifications: [],
        languages: ['español'],
        specialties: ['pintura interior', 'pintura exterior'],
        distance: '1.8 km'
      }
    };

    // Add providers for each matched service
    matchingServices.forEach(serviceId => {
      if (serviceProviders[serviceId]) {
        // Filter by location if specified
        const provider = serviceProviders[serviceId];
        if (filters.location) {
          if (provider.location.commune.toLowerCase() === filters.location.commune?.toLowerCase() ||
              provider.location.region.toLowerCase() === filters.location.region?.toLowerCase()) {
            providers.push(provider);
          }
        } else {
          providers.push(provider);
        }
      }
    });

    // If no specific matches but query exists, return most relevant services
    if (providers.length === 0 && matchingServices.length === 0) {
      // Return popular services as fallback
      providers.push(serviceProviders['electricista'], serviceProviders['limpieza_hogar']);
    }

    return providers;
  }

  // Project-based search using intelligent matching
  static async searchProvidersByProject(
    query: string,
    filters: SearchFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResult> {
    try {
      console.log('🔍 Starting intelligent project search with:', { query, filters, limit, offset });

      // Get matching project types using intelligent search
      const matchingProjects = SearchService.intelligentProjectMatch(query, filters.projectType);
      console.log('🎯 Matched projects:', matchingProjects);

      // Generate relevant mock providers based on matched projects
      const mockProviders = SearchService.generateRelevantProjectProviders(matchingProjects, filters);

      console.log('✅ Project search successful, returning intelligent matches');

      return {
        providers: mockProviders,
        totalCount: mockProviders.length,
        filters,
        searchType: 'project'
      };
    } catch (error) {
      console.error('Project search error:', error?.message || error);
      throw error;
    }
  }

  // Intelligent project matching with Chilean synonyms
  private static intelligentProjectMatch(query: string, projectType?: string): string[] {
    if (projectType) {
      return [projectType]; // Direct category selection
    }

    if (!query || query.trim().length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();

    // Comprehensive Chilean project synonym mapping
    const projectSynonyms: Record<string, string[]> = {
      'reparar_bano': [
        'reparar baño', 'baño', 'bathroom', 'ducha', 'tina', 'inodoro', 'lavamanos',
        'reparación baño', 'arreglar baño', 'fix bathroom', 'filtración baño'
      ],
      'renovar_cocina': [
        'renovar cocina', 'cocina', 'kitchen', 'muebles cocina', 'mesón', 'remodelación cocina',
        'cambiar cocina', 'nueva cocina', 'kitchen renovation', 'remodel kitchen'
      ],
      'pintar_interior': [
        'pintar', 'pintura', 'paint', 'paredes', 'color', 'pintar casa', 'pintar interior',
        'painting', 'cambiar color', 'repintar'
      ],
      'pintar_exterior': [
        'pintar exterior', 'fachada', 'pintar casa exterior', 'muros exteriores',
        'exterior paint', 'pintar afuera'
      ],
      'limpieza_profunda': [
        'limpieza profunda', 'limpiar', 'limpieza', 'aseo', 'cleaning', 'deep clean',
        'limpieza general', 'limpieza completa'
      ],
      'instalacion_electrica': [
        'instalación eléctrica', 'electricidad', 'luz', 'cable', 'enchufes', 'tablero eléctrico',
        'electrical installation', 'wiring', 'instalar luz'
      ],
      'reparar_techo': [
        'reparar techo', 'techo', 'roof', 'goteras', 'filtraciones', 'arreglar techo',
        'roof repair', 'leak roof', 'tejado'
      ],
      'reparar_piso': [
        'reparar piso', 'piso', 'suelo', 'floor', 'parquet', 'baldosas', 'cerámica',
        'floor repair', 'cambiar piso'
      ],
      'instalar_ventanas': [
        'instalar ventanas', 'ventanas', 'windows', 'cambiar ventanas', 'ventanas nuevas',
        'window installation', 'reemplazar ventanas'
      ],
      'reparar_puertas': [
        'reparar puertas', 'puertas', 'doors', 'cambiar puertas', 'arreglar puertas',
        'door repair', 'instalar puertas'
      ]
    };

    const matchedProjects: string[] = [];

    // Check each project for query matches
    Object.entries(projectSynonyms).forEach(([projectId, synonyms]) => {
      const hasMatch = synonyms.some(synonym => {
        const lowerSynonym = synonym.toLowerCase();
        return lowerSynonym.includes(lowerQuery) || lowerQuery.includes(lowerSynonym);
      });

      if (hasMatch) {
        matchedProjects.push(projectId);
      }
    });

    return matchedProjects;
  }

  // Generate providers based on matched projects
  private static generateRelevantProjectProviders(matchingProjects: string[], filters: SearchFilters): any[] {
    const providers: any[] = [];

    // Project-specific provider templates
    const projectProviders: Record<string, any> = {
      'reparar_bano': {
        id: '10',
        name: 'Carlos Rodríguez',
        businessName: 'Gasfitería y Baños CR',
        rating: 4.7,
        reviewCount: 156,
        services: ['gasfiter', 'remodelacion'],
        serviceAreas: ['santiago'],
        location: {
          commune: 'santiago',
          region: 'Metropolitana'
        },
        isVerified: true,
        verificationStatus: 'approved' as const,
        responseTime: '3 hours',
        responseTimeHours: 3,
        isAvailableToday: true,
        pricing: {
          hourlyRate: 30000,
          fixedRate: 150000
        },
        availability: {
          nextAvailable: new Date(),
          isAvailableToday: true,
          workingHours: {
            start: '07:00',
            end: '19:00'
          }
        },
        portfolio: {
          photos: [],
          completedProjects: 156
        },
        certifications: [],
        languages: ['español'],
        specialties: ['reparación baños', 'instalación sanitarios'],
        distance: '0.5 km'
      },
      'renovar_cocina': {
        id: '11',
        name: 'María González',
        businessName: 'Construcción y Remodelaciones MG',
        rating: 4.8,
        reviewCount: 89,
        services: ['construccion', 'remodelacion'],
        serviceAreas: ['santiago'],
        location: {
          commune: 'santiago',
          region: 'Metropolitana'
        },
        isVerified: true,
        verificationStatus: 'approved' as const,
        responseTime: '4 hours',
        responseTimeHours: 4,
        isAvailableToday: false,
        pricing: {
          hourlyRate: 35000,
          fixedRate: 800000
        },
        availability: {
          nextAvailable: new Date(Date.now() + 86400000),
          isAvailableToday: false,
          workingHours: {
            start: '08:00',
            end: '17:00'
          }
        },
        portfolio: {
          photos: [],
          completedProjects: 89
        },
        certifications: [],
        languages: ['español'],
        specialties: ['remodelación cocinas', 'diseño interior'],
        distance: '1.2 km'
      },
      'pintar_interior': {
        id: '12',
        name: 'Ana Morales',
        businessName: 'Pinturas Profesionales AM',
        rating: 4.9,
        reviewCount: 112,
        services: ['pintor'],
        serviceAreas: ['santiago'],
        location: {
          commune: 'santiago',
          region: 'Metropolitana'
        },
        isVerified: true,
        verificationStatus: 'approved' as const,
        responseTime: '2 hours',
        responseTimeHours: 2,
        isAvailableToday: true,
        pricing: {
          hourlyRate: 22000,
          fixedRate: 120000
        },
        availability: {
          nextAvailable: new Date(),
          isAvailableToday: true,
          workingHours: {
            start: '09:00',
            end: '18:00'
          }
        },
        portfolio: {
          photos: [],
          completedProjects: 112
        },
        certifications: [],
        languages: ['español'],
        specialties: ['pintura interior', 'decoración'],
        distance: '1.8 km'
      },
      'limpieza_profunda': {
        id: '13',
        name: 'Patricia Silva',
        businessName: 'Limpieza Profunda PS',
        rating: 4.8,
        reviewCount: 94,
        services: ['limpieza_hogar'],
        serviceAreas: ['santiago'],
        location: {
          commune: 'santiago',
          region: 'Metropolitana'
        },
        isVerified: true,
        verificationStatus: 'approved' as const,
        responseTime: '1 hour',
        responseTimeHours: 1,
        isAvailableToday: true,
        pricing: {
          hourlyRate: 18000,
          fixedRate: 80000
        },
        availability: {
          nextAvailable: new Date(),
          isAvailableToday: true,
          workingHours: {
            start: '08:00',
            end: '17:00'
          }
        },
        portfolio: {
          photos: [],
          completedProjects: 94
        },
        certifications: [],
        languages: ['español'],
        specialties: ['limpieza profunda', 'sanitización'],
        distance: '0.9 km'
      }
    };

    // Add providers for each matched project
    matchingProjects.forEach(projectId => {
      if (projectProviders[projectId]) {
        // Filter by location if specified
        const provider = projectProviders[projectId];
        if (filters.location) {
          if (provider.location.commune.toLowerCase() === filters.location.commune?.toLowerCase() ||
              provider.location.region.toLowerCase() === filters.location.region?.toLowerCase()) {
            providers.push(provider);
          }
        } else {
          providers.push(provider);
        }
      }
    });

    // If no specific matches but query exists, return most relevant projects
    if (providers.length === 0 && matchingProjects.length === 0) {
      // Return popular projects as fallback
      providers.push(projectProviders['reparar_bano'], projectProviders['limpieza_profunda']);
    }

    return providers;
  }

  // Quick search for autocomplete
  static async quickSearch(query: string, type: 'service' | 'project' = 'service') {
    try {
      console.log('🔍 Quick search:', { query, type });

      // Return mock suggestions based on type
      const mockSuggestions = type === 'service'
        ? ['Electricista', 'Plomero', 'Limpieza', 'Jardinería']
        : ['Reparar Baño', 'Renovar Cocina', 'Pintar Paredes', 'Limpieza Profunda'];

      const filtered = mockSuggestions.filter(item =>
        item.toLowerCase().includes(query.toLowerCase())
      );

      console.log('✅ Quick search results:', filtered);
      return filtered.map((item, index) => ({ id: index + 1, name: item }));
    } catch (error) {
      console.error('Quick search error:', error?.message || error);
      return [];
    }
  }

  // Get service categories from database
  static async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      console.log('🔍 Fetching service categories from database...');

      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} service categories`);

      // Transform database data to our ServiceCategory format
      const categories: ServiceCategory[] = (data || []).map(service => ({
        id: service.id,
        name: service.name,
        icon: service.icon || '🔧',
        description: service.description || '',
        avgPriceMin: service.avg_price_min || 20000,
        avgPriceMax: service.avg_price_max || 70000,
        urgencyLevels: service.urgency_levels || ['normal'],
        color: service.color || '#6b7280',
        isActive: service.is_active,
        sortOrder: service.sort_order || 0,
        createdAt: new Date(service.created_at),
        updatedAt: new Date(service.updated_at)
      }));

      return categories;
    } catch (error) {
      console.error('Error fetching service categories:', error?.message || error);

      // Return fallback Chilean services if database fails
      return [
        {
          id: 'electricista',
          name: 'Electricista',
          icon: '⚡',
          description: 'Instalación y reparación eléctrica',
          avgPriceMin: 25000,
          avgPriceMax: 80000,
          urgencyLevels: ['normal', 'urgente', 'emergencia'],
          color: '#f59e0b',
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'gasfiter',
          name: 'Gasfiter',
          icon: '🚿',
          description: 'Instalación y reparación de cañerías',
          avgPriceMin: 30000,
          avgPriceMax: 90000,
          urgencyLevels: ['normal', 'urgente', 'emergencia'],
          color: '#3b82f6',
          isActive: true,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'limpieza_hogar',
          name: 'Limpieza del Hogar',
          icon: '🧽',
          description: 'Limpieza residencial regular y profunda',
          avgPriceMin: 15000,
          avgPriceMax: 50000,
          urgencyLevels: ['normal', 'urgente'],
          color: '#10b981',
          isActive: true,
          sortOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  }

  // Helper functions to map existing data to our format
  private static getServiceIcon(serviceName: string): string {
    const iconMap: Record<string, string> = {
      'Electricista': '⚡',
      'Gasfitero': '🚿',
      'Técnico en Refrigeración': '📱',
      'Cerrajero': '🔐',
      'Jardinero': '🌱',
      'Limpieza del Hogar': '🧽',
      'Pintor': '🎨',
      'Carpintero': '🔨'
    };
    return iconMap[serviceName] || '🔧';
  }

  private static getServiceColor(category: string): string {
    const colorMap: Record<string, string> = {
      'Electricidad': '#f59e0b',
      'Plomería': '#3b82f6',
      'Electrodomésticos': '#2563eb',
      'Seguridad': '#4b5563',
      'Jardín': '#059669',
      'Limpieza': '#10b981',
      'Pintura': '#8b5cf6',
      'Carpintería': '#6b7280'
    };
    return colorMap[category] || '#6b7280';
  }

  private static getDefaultPriceMin(serviceName: string): number {
    const priceMap: Record<string, number> = {
      'Electricista': 25000,
      'Gasfitero': 30000,
      'Técnico en Refrigeración': 20000,
      'Cerrajero': 15000,
      'Jardinero': 18000,
      'Limpieza del Hogar': 15000,
      'Pintor': 200,
      'Carpintero': 25000
    };
    return priceMap[serviceName] || 20000;
  }

  private static getDefaultPriceMax(serviceName: string): number {
    const priceMap: Record<string, number> = {
      'Electricista': 80000,
      'Gasfitero': 90000,
      'Técnico en Refrigeración': 75000,
      'Cerrajero': 60000,
      'Jardinero': 60000,
      'Limpieza del Hogar': 50000,
      'Pintor': 800,
      'Carpintero': 100000
    };
    return priceMap[serviceName] || 70000;
  }

  private static getDefaultUrgencyLevels(serviceName: string): Array<'normal' | 'urgente' | 'emergencia'> {
    const emergencyServices = ['Electricista', 'Gasfitero', 'Cerrajero'];
    const urgentServices = ['Técnico en Refrigeración', 'Limpieza del Hogar'];

    if (emergencyServices.includes(serviceName)) {
      return ['normal', 'urgente', 'emergencia'];
    } else if (urgentServices.includes(serviceName)) {
      return ['normal', 'urgente'];
    } else {
      return ['normal'];
    }
  }

  // Get project types from database
  static async getProjectTypes(): Promise<ProjectType[]> {
    try {
      console.log('🔍 Fetching project types from database...');

      const { data, error } = await supabase
        .from('project_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} project types`);

      // Transform database data to our ProjectType format
      const projectTypes: ProjectType[] = (data || []).map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        estimated_duration: project.estimated_duration || '1 día',
        avg_price_min: project.avg_price_min || 20000,
        avg_price_max: project.avg_price_max || 70000,
        complexity: project.complexity || 'medium',
        icon: project.icon || '🏠',
        category: project.category || 'interior',
        is_active: project.is_active,
        sort_order: project.sort_order || 0,
        created_at: project.created_at,
        updated_at: project.updated_at
      }));

      return projectTypes;
    } catch (error) {
      console.error('Error fetching project types:', error?.message || error);

      // Return fallback Chilean projects if database fails
      return [
        {
          id: 'reparar_bano',
          name: 'Reparar Baño',
          description: 'Reparación de problemas en el baño',
          estimated_duration: '1-3 días',
          avg_price_min: 40000,
          avg_price_max: 150000,
          complexity: 'medium' as const,
          icon: '🚿',
          category: 'interior' as const,
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'renovar_cocina',
          name: 'Renovar Cocina',
          description: 'Renovación completa de cocina',
          estimated_duration: '1-3 semanas',
          avg_price_min: 1200000,
          avg_price_max: 5000000,
          complexity: 'complex' as const,
          icon: '🍳',
          category: 'interior' as const,
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'pintar_interior',
          name: 'Pintar Interior',
          description: 'Pintura de paredes interiores',
          estimated_duration: '2-5 días',
          avg_price_min: 150000,
          avg_price_max: 600000,
          complexity: 'simple' as const,
          icon: '🎨',
          category: 'interior' as const,
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  }

  // Get popular services in a location
  static async getPopularServices(commune?: string, region?: string) {
    try {
      console.log('🔍 Getting popular services for:', { commune, region });

      // Return mock popular services
      const mockPopularServices = [
        { id: 'electricista', name: 'Electricista', count: 45 },
        { id: 'plomero', name: 'Plomero', count: 38 },
        { id: 'limpieza', name: 'Limpieza', count: 32 },
        { id: 'jardineria', name: 'Jardinería', count: 28 },
        { id: 'pintura', name: 'Pintura', count: 25 },
        { id: 'carpintero', name: 'Carpintero', count: 22 },
        { id: 'tecnico', name: 'Técnico', count: 18 },
        { id: 'construccion', name: 'Construcción', count: 15 }
      ];

      console.log('✅ Popular services fetched successfully');
      return mockPopularServices;
    } catch (error) {
      console.error('Error fetching popular services:', error?.message || error);
      return [];
    }
  }

  // Helper function to map enhanced provider to standard format
  private static mapEnhancedProviderToServiceProvider(provider: EnhancedServiceProvider) {
    return {
      id: provider.providerId,
      name: provider.userName,
      businessName: provider.businessName,
      avatar: provider.avatarUrl,
      rating: provider.rating,
      reviewCount: provider.totalReviews,
      services: [], // Would need to fetch separately if needed
      serviceAreas: provider.serviceAreas,
      location: {
        commune: '', // Would need to be derived from service areas
        region: ''
      },
      isVerified: provider.verificationStatus === 'approved',
      verificationStatus: provider.verificationStatus,
      responseTime: provider.responseTimeHours ? `${provider.responseTimeHours}h` : 'N/A',
      responseTimeHours: provider.responseTimeHours,
      isAvailableToday: provider.isAvailableToday,
      pricing: {
        hourlyRate: provider.hourlyRateClp,
        fixedRate: provider.fixedRateClp
      },
      availability: {
        nextAvailable: new Date(), // Would need actual data
        isAvailableToday: provider.isAvailableToday,
        workingHours: {
          start: '08:00',
          end: '18:00'
        }
      },
      portfolio: {
        photos: provider.portfolioPhotos,
        completedProjects: provider.completedProjects
      },
      certifications: [],
      languages: provider.languages,
      specialties: provider.specialties,
      coordinates: provider.coordinates,
      distance: provider.distance
    };
  }
}