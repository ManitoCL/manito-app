// Search and Service Type Definitions - Updated to match Supabase schema
export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  avgPriceMin?: number; // CLP
  avgPriceMax?: number; // CLP
  urgencyLevels: UrgencyLevel[];
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectType {
  id: string;
  name: string;
  description?: string;
  estimatedDuration?: string;
  avgPriceMin?: number; // CLP
  avgPriceMax?: number; // CLP
  complexity: ComplexityLevel;
  icon?: string;
  category: ProjectCategory;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectService {
  projectId: string;
  serviceId: string;
  isRequired: boolean;
}

export type ComplexityLevel = 'simple' | 'medium' | 'complex';

export type ProjectCategory =
  | 'interior'
  | 'exterior'
  | 'electrical'
  | 'plumbing'
  | 'maintenance'
  | 'cleaning'
  | 'construction';

export type UrgencyLevel = 'normal' | 'urgente' | 'emergencia';

export interface SearchFilters {
  serviceType?: string;
  projectType?: string;
  location?: Location;
  priceRange?: PriceRange;
  urgency?: UrgencyLevel;
  availability?: 'today' | 'this-week' | 'flexible';
  rating?: number;
  verified?: boolean;
}

export interface Location {
  commune: string;
  region: string;
  coordinates?: [number, number]; // [longitude, latitude] format for consistency
}

export interface PriceRange {
  min: number;
  max: number;
  currency: 'CLP';
}

export interface SearchResult {
  providers: ServiceProvider[];
  totalCount: number;
  filters: SearchFilters;
  searchType: 'project' | 'service';
}

export interface ServiceProvider {
  id: string;
  name: string;
  businessName?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  services: string[];
  serviceAreas: string[];
  location: Location;
  isVerified: boolean;
  verificationStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
  responseTime: string;
  responseTimeHours?: number;
  isAvailableToday: boolean;
  pricing: {
    hourlyRate?: number;
    fixedRate?: number;
    projectRates?: Record<string, number>;
    calloutFee?: number;
  };
  availability: {
    nextAvailable: Date;
    isAvailableToday: boolean;
    workingHours: {
      start: string;
      end: string;
    };
  };
  portfolio: {
    photos: string[];
    completedProjects: number;
  };
  certifications: string[];
  languages: string[];
  specialties: string[];
  businessInfo?: {
    companyName: string;
    rut: string;
    businessType: 'individual' | 'company';
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // km from search location
}

// Enhanced search result from database functions
export interface EnhancedServiceProvider {
  providerId: string;
  userName: string;
  businessName?: string;
  avatarUrl?: string;
  rating: number;
  totalReviews: number;
  verificationStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
  hourlyRateClp?: number;
  fixedRateClp?: number;
  responseTimeHours?: number;
  isAvailableToday: boolean;
  serviceAreas: string[];
  coordinates?: { latitude: number; longitude: number };
  distance?: number;
  portfolioPhotos: string[];
  specialties: string[];
  languages: string[];
  completedProjects: number;
}