import { ServiceCategory, ProjectType } from '../types/search';
import { colors } from '../design/tokens';

// Chilean Home Service Categories
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'electricista',
    name: 'Electricista',
    icon: '⚡',
    description: 'Instalación y reparación eléctrica',
    avgPriceMin: 25000,
    avgPriceMax: 80000,
    urgencyLevels: ['normal', 'urgente', 'emergencia'],
    color: colors.warning[500],
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'plomero',
    name: 'Plomero',
    icon: '🔧',
    description: 'Reparación de cañerías y grifos',
    commonProjects: ['leak-repair', 'toilet-repair', 'bathroom-repair'],
    avgPriceRange: 'CLP $20,000 - $70,000',
    urgencyLevels: ['normal', 'urgente', 'emergencia'],
    color: colors.primary[500],
  },
  {
    id: 'gasfiter',
    name: 'Gasfiter',
    icon: '🚿',
    description: 'Instalación y reparación de gas y agua',
    commonProjects: ['gas-installation', 'water-heater-repair', 'bathroom-repair'],
    avgPriceRange: 'CLP $30,000 - $90,000',
    urgencyLevels: ['normal', 'urgente', 'emergencia'],
    color: colors.primary[600],
  },
  {
    id: 'limpieza',
    name: 'Limpieza',
    icon: '🧽',
    description: 'Limpieza de hogar y oficinas',
    commonProjects: ['deep-cleaning', 'post-construction-cleaning', 'move-cleaning'],
    avgPriceRange: 'CLP $15,000 - $50,000',
    urgencyLevels: ['normal', 'urgente'],
    color: colors.success[500],
  },
  {
    id: 'jardineria',
    name: 'Jardinería',
    icon: '🌱',
    description: 'Cuidado de jardines y plantas',
    commonProjects: ['garden-maintenance', 'lawn-care', 'tree-pruning'],
    avgPriceRange: 'CLP $18,000 - $60,000',
    urgencyLevels: ['normal'],
    color: colors.success[600],
  },
  {
    id: 'pintura',
    name: 'Pintura',
    icon: '🎨',
    description: 'Pintura interior y exterior',
    commonProjects: ['wall-painting', 'exterior-painting', 'room-renovation'],
    avgPriceRange: 'CLP $200 - $800/m²',
    urgencyLevels: ['normal'],
    color: colors.secondary[500],
  },
  {
    id: 'carpintero',
    name: 'Carpintero',
    icon: '🔨',
    description: 'Muebles y reparaciones de madera',
    commonProjects: ['custom-furniture', 'door-repair', 'kitchen-renovation'],
    avgPriceRange: 'CLP $25,000 - $100,000',
    urgencyLevels: ['normal'],
    color: colors.neutral[700],
  },
  {
    id: 'tecnico',
    name: 'Técnico',
    icon: '📱',
    description: 'Reparación de electrodomésticos',
    commonProjects: ['appliance-repair', 'washing-machine-repair', 'refrigerator-repair'],
    avgPriceRange: 'CLP $20,000 - $75,000',
    urgencyLevels: ['normal', 'urgente'],
    color: colors.primary[600],
  },
  {
    id: 'construccion',
    name: 'Construcción',
    icon: '🏗️',
    description: 'Obras menores y remodelación',
    commonProjects: ['bathroom-renovation', 'kitchen-renovation', 'room-addition'],
    avgPriceRange: 'CLP $50,000 - $200,000',
    urgencyLevels: ['normal'],
    color: colors.neutral[800],
  },
  {
    id: 'cerrajero',
    name: 'Cerrajero',
    icon: '🔐',
    description: 'Cerraduras y seguridad del hogar',
    commonProjects: ['lock-installation', 'lockout-service', 'security-upgrade'],
    avgPriceRange: 'CLP $15,000 - $60,000',
    urgencyLevels: ['normal', 'urgente', 'emergencia'],
    color: colors.neutral[600],
  },
];

// Chilean Home Project Types
export const PROJECT_TYPES: ProjectType[] = [
  // Interior Projects
  {
    id: 'bathroom-repair',
    name: 'Reparar Baño',
    description: 'Reparación de problemas en el baño (filtraciones, grifería, etc.)',
    requiredServices: ['plomero'],
    optionalServices: ['gasfiter', 'electricista', 'pintura'],
    estimatedDuration: '1-3 días',
    avgPriceRange: 'CLP $40,000 - $150,000',
    complexity: 'medium',
    icon: '🚿',
    category: 'interior',
  },
  {
    id: 'kitchen-renovation',
    name: 'Renovar Cocina',
    description: 'Renovación completa o parcial de cocina',
    requiredServices: ['carpintero'],
    optionalServices: ['plomero', 'electricista', 'pintura', 'construccion'],
    estimatedDuration: '1-2 semanas',
    avgPriceRange: 'CLP $300,000 - $1,500,000',
    complexity: 'complex',
    icon: '🍳',
    category: 'interior',
  },
  {
    id: 'wall-painting',
    name: 'Pintar Paredes',
    description: 'Pintura de paredes interiores o exteriores',
    requiredServices: ['pintura'],
    optionalServices: [],
    estimatedDuration: '1-3 días',
    avgPriceRange: 'CLP $200 - $800/m²',
    complexity: 'simple',
    icon: '🎨',
    category: 'interior',
  },
  {
    id: 'floor-installation',
    name: 'Instalar Piso',
    description: 'Instalación de pisos laminados, flotantes o cerámicos',
    requiredServices: ['carpintero'],
    optionalServices: ['construccion'],
    estimatedDuration: '2-5 días',
    avgPriceRange: 'CLP $8,000 - $25,000/m²',
    complexity: 'medium',
    icon: '🏠',
    category: 'interior',
  },

  // Electrical Projects
  {
    id: 'light-fixture',
    name: 'Instalar Luminarias',
    description: 'Instalación de lámparas, focos y sistemas de iluminación',
    requiredServices: ['electricista'],
    optionalServices: [],
    estimatedDuration: '2-4 horas',
    avgPriceRange: 'CLP $15,000 - $50,000',
    complexity: 'simple',
    icon: '💡',
    category: 'electrical',
  },
  {
    id: 'electrical-repair',
    name: 'Reparar Instalación Eléctrica',
    description: 'Reparación de problemas eléctricos y cableado',
    requiredServices: ['electricista'],
    optionalServices: [],
    estimatedDuration: '4-8 horas',
    avgPriceRange: 'CLP $25,000 - $80,000',
    complexity: 'medium',
    icon: '⚡',
    category: 'electrical',
  },

  // Plumbing Projects
  {
    id: 'leak-repair',
    name: 'Reparar Filtración',
    description: 'Reparación de filtraciones de agua en cañerías',
    requiredServices: ['plomero'],
    optionalServices: ['gasfiter'],
    estimatedDuration: '2-6 horas',
    avgPriceRange: 'CLP $20,000 - $70,000',
    complexity: 'medium',
    icon: '💧',
    category: 'plumbing',
  },
  {
    id: 'toilet-repair',
    name: 'Reparar WC',
    description: 'Reparación o reemplazo de inodoro',
    requiredServices: ['plomero'],
    optionalServices: [],
    estimatedDuration: '2-4 horas',
    avgPriceRange: 'CLP $15,000 - $45,000',
    complexity: 'simple',
    icon: '🚽',
    category: 'plumbing',
  },

  // Outdoor Projects
  {
    id: 'garden-maintenance',
    name: 'Mantener Jardín',
    description: 'Mantenimiento regular de jardín y áreas verdes',
    requiredServices: ['jardineria'],
    optionalServices: [],
    estimatedDuration: '2-6 horas',
    avgPriceRange: 'CLP $15,000 - $40,000',
    complexity: 'simple',
    icon: '🌿',
    category: 'exterior',
  },
  {
    id: 'exterior-painting',
    name: 'Pintar Exterior',
    description: 'Pintura de fachadas y exteriores de la casa',
    requiredServices: ['pintura'],
    optionalServices: ['construccion'],
    estimatedDuration: '3-7 días',
    avgPriceRange: 'CLP $300 - $600/m²',
    complexity: 'medium',
    icon: '🏠',
    category: 'exterior',
  },

  // Cleaning Projects
  {
    id: 'deep-cleaning',
    name: 'Limpieza Profunda',
    description: 'Limpieza completa y profunda del hogar',
    requiredServices: ['limpieza'],
    optionalServices: [],
    estimatedDuration: '4-8 horas',
    avgPriceRange: 'CLP $25,000 - $60,000',
    complexity: 'simple',
    icon: '✨',
    category: 'cleaning',
  },

  // Appliance Projects
  {
    id: 'appliance-repair',
    name: 'Reparar Electrodoméstico',
    description: 'Reparación de lavadoras, refrigeradores y otros electrodomésticos',
    requiredServices: ['tecnico'],
    optionalServices: ['electricista'],
    estimatedDuration: '1-3 horas',
    avgPriceRange: 'CLP $20,000 - $75,000',
    complexity: 'medium',
    icon: '🔧',
    category: 'maintenance',
  },

  // Security Projects
  {
    id: 'lock-installation',
    name: 'Instalar Cerraduras',
    description: 'Instalación de cerraduras y sistemas de seguridad',
    requiredServices: ['cerrajero'],
    optionalServices: [],
    estimatedDuration: '1-2 horas',
    avgPriceRange: 'CLP $15,000 - $45,000',
    complexity: 'simple',
    icon: '🔐',
    category: 'maintenance',
  },
];

// Search Helper Functions
export const getServiceById = (id: string): ServiceCategory | undefined => {
  return SERVICE_CATEGORIES.find(service => service.id === id);
};

export const getProjectById = (id: string): ProjectType | undefined => {
  return PROJECT_TYPES.find(project => project.id === id);
};

export const getProjectsByService = (serviceId: string): ProjectType[] => {
  return PROJECT_TYPES.filter(project =>
    project.requiredServices.includes(serviceId) ||
    project.optionalServices.includes(serviceId)
  );
};

export const getServicesByProject = (projectId: string): ServiceCategory[] => {
  const project = getProjectById(projectId);
  if (!project) return [];

  const allServices = [...project.requiredServices, ...project.optionalServices];
  return SERVICE_CATEGORIES.filter(service => allServices.includes(service.id));
};

// Chilean Communes (Major ones for MVP)
export const CHILEAN_COMMUNES = [
  // Santiago Metropolitan Region
  { id: 'santiago', name: 'Santiago Centro', region: 'Metropolitana' },
  { id: 'providencia', name: 'Providencia', region: 'Metropolitana' },
  { id: 'las-condes', name: 'Las Condes', region: 'Metropolitana' },
  { id: 'vitacura', name: 'Vitacura', region: 'Metropolitana' },
  { id: 'nunoa', name: 'Ñuñoa', region: 'Metropolitana' },
  { id: 'la-florida', name: 'La Florida', region: 'Metropolitana' },
  { id: 'maipu', name: 'Maipú', region: 'Metropolitana' },
  { id: 'puente-alto', name: 'Puente Alto', region: 'Metropolitana' },
  { id: 'san-miguel', name: 'San Miguel', region: 'Metropolitana' },
  { id: 'la-reina', name: 'La Reina', region: 'Metropolitana' },

  // Valparaíso Region
  { id: 'valparaiso', name: 'Valparaíso', region: 'Valparaíso' },
  { id: 'vina-del-mar', name: 'Viña del Mar', region: 'Valparaíso' },

  // Biobío Region
  { id: 'concepcion', name: 'Concepción', region: 'Biobío' },
];