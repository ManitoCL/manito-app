/**
 * Provider Services Data Service
 * Handles fetching real data from database tables for provider service management
 */

import { supabase } from './supabase';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  avg_price_min: number | null;
  avg_price_max: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface ProjectType {
  id: string;
  name: string;
  description: string | null;
  estimated_duration: string | null;
  avg_price_min: number | null;
  avg_price_max: number | null;
  complexity: 'easy' | 'medium' | 'hard';
  icon: string | null;
  category: 'electricidad' | 'gasfiteria_gas' | 'gasfiteria_agua' | 'pintura_terminaciones' | 'carpinteria_muebles' | 'ceramica_pisos' | 'construccion_obras' | 'remodelacion' | 'calefaccion_clima' | 'seguridad_portones' | 'jardin_exterior' | 'limpieza_mantenimiento' | 'mudanzas_transporte' | 'linea_blanca' | 'piscinas' | 'otros_servicios';
  is_active: boolean;
  sort_order: number;
}

export interface ProviderService {
  provider_id: string;
  service_id: string;
  hourly_rate_clp: number | null;
  fixed_rate_clp: number | null;
  experience_years: number;
  is_primary_service: boolean;
}

export interface ProviderProject {
  id?: string;
  provider_id: string;
  project_type_id: string;
  base_price_clp: number | null;
  estimated_hours: number | null;
  pricing_notes: string | null;
  is_active: boolean;
  allows_instant_quote: boolean;
  requires_site_visit_for: 'all' | 'complex_only' | 'none';
  service_id: string | null;
}

/**
 * Fetch all active service categories
 */
export const fetchServiceCategories = async (): Promise<ServiceCategory[]> => {
  console.log('📋 Fetching service categories...');

  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('❌ Failed to fetch service categories:', error);
    throw new Error(`Failed to fetch service categories: ${error.message}`);
  }

  console.log('✅ Service categories fetched:', data?.length);
  return data || [];
};

/**
 * Fetch all active project types, optionally filtered by category
 */
export const fetchProjectTypes = async (category?: string): Promise<ProjectType[]> => {
  console.log('📋 Fetching project types...', { category });

  let query = supabase
    .from('project_types')
    .select('*')
    .eq('is_active', true);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('sort_order', { ascending: true });

  if (error) {
    console.error('❌ Failed to fetch project types:', error);
    throw new Error(`Failed to fetch project types: ${error.message}`);
  }

  console.log('✅ Project types fetched:', data?.length);
  return data || [];
};

/**
 * Fetch provider's current service rates
 */
export const fetchProviderServices = async (providerId: string): Promise<ProviderService[]> => {
  console.log('📋 Fetching provider services:', providerId);

  const { data, error } = await supabase
    .from('provider_services')
    .select('*')
    .eq('provider_id', providerId);

  if (error) {
    console.error('❌ Failed to fetch provider services:', error);
    throw new Error(`Failed to fetch provider services: ${error.message}`);
  }

  console.log('✅ Provider services fetched:', data?.length);
  return data || [];
};

/**
 * Fetch provider's current project rates
 */
export const fetchProviderProjects = async (providerId: string): Promise<ProviderProject[]> => {
  console.log('📋 Fetching provider base pricing:', providerId);

  const { data, error } = await supabase
    .from('provider_base_pricing')
    .select('*')
    .eq('provider_id', providerId);

  if (error) {
    console.error('❌ Failed to fetch provider base pricing:', error);
    throw new Error(`Failed to fetch provider base pricing: ${error.message}`);
  }

  console.log('✅ Provider base pricing fetched:', data?.length);
  return data || [];
};

/**
 * Fetch projects grouped by service category names for provider
 */
export const fetchProviderProjectsGroupedByService = async (providerId: string): Promise<Record<string, Array<{ project: ProjectType; price: number | null }>>> => {
  console.log('📋 Fetching provider projects grouped by service:', providerId);

  // Get configured project type IDs
  const { data: providerProjects, error: projectsError } = await supabase
    .from('provider_base_pricing')
    .select('project_type_id, base_price_clp')
    .eq('provider_id', providerId);

  if (projectsError) {
    console.error('❌ Failed to fetch provider base pricing:', projectsError);
    throw new Error(`Failed to fetch provider base pricing: ${projectsError.message}`);
  }

  if (!providerProjects || providerProjects.length === 0) {
    console.log('✅ No configured projects found');
    return {};
  }

  const projectIds = providerProjects.map(pp => pp.project_type_id);

  // Get project details
  const { data: projectTypes, error: projectTypesError } = await supabase
    .from('project_types')
    .select('*')
    .in('id', projectIds)
    .eq('is_active', true);

  if (projectTypesError) {
    console.error('❌ Failed to fetch project types:', projectTypesError);
    throw new Error(`Failed to fetch project types: ${projectTypesError.message}`);
  }

  // Get service IDs for these projects
  const { data: projectServices, error: servicesError } = await supabase
    .from('project_services')
    .select('project_id, service_id')
    .in('project_id', projectIds);

  if (servicesError) {
    console.error('❌ Failed to fetch project services:', servicesError);
    throw new Error(`Failed to fetch project services: ${servicesError.message}`);
  }

  // Get unique service IDs
  const uniqueServiceIds = [...new Set(projectServices?.map(ps => ps.service_id) || [])];

  // Get service names
  const { data: serviceCategories, error: categoriesError } = await supabase
    .from('service_categories')
    .select('id, name')
    .in('id', uniqueServiceIds)
    .eq('is_active', true);

  if (categoriesError) {
    console.error('❌ Failed to fetch service categories:', categoriesError);
    throw new Error(`Failed to fetch service categories: ${categoriesError.message}`);
  }

  // Group projects by service name
  const grouped: Record<string, Array<{ project: ProjectType; price: number | null }>> = {};

  projectTypes?.forEach(project => {
    const providerProject = providerProjects.find(pp => pp.project_type_id === project.id);
    const projectService = projectServices?.find(ps => ps.project_id === project.id);

    if (projectService) {
      const serviceCategory = serviceCategories?.find(sc => sc.id === projectService.service_id);

      if (serviceCategory) {
        const serviceName = serviceCategory.name;

        if (!grouped[serviceName]) {
          grouped[serviceName] = [];
        }

        grouped[serviceName].push({
          project,
          price: providerProject?.base_price_clp || null,
        });
      }
    }
  });

  console.log('✅ Provider projects grouped by service fetched:', Object.keys(grouped));
  return grouped;
};

/**
 * Fetch service names for provider's configured projects
 */
export const fetchProviderConfiguredServices = async (providerId: string): Promise<string[]> => {
  const groupedData = await fetchProviderProjectsGroupedByService(providerId);
  return Object.keys(groupedData);
};

/**
 * Update or insert provider service rate
 */
export const upsertProviderService = async (
  providerId: string,
  serviceId: string,
  data: Partial<Omit<ProviderService, 'provider_id' | 'service_id'>>
): Promise<ProviderService> => {
  console.log('🔄 Upserting provider service:', { providerId, serviceId, data });

  const { data: result, error } = await supabase
    .from('provider_services')
    .upsert({
      provider_id: providerId,
      service_id: serviceId,
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to upsert provider service:', error);
    throw new Error(`Failed to update service: ${error.message}`);
  }

  console.log('✅ Provider service updated');
  return result;
};

/**
 * Update or insert provider base pricing for a project type
 */
export const upsertProviderProject = async (
  providerId: string,
  projectTypeId: string,
  data: Partial<Omit<ProviderProject, 'provider_id' | 'project_type_id'>>
): Promise<ProviderProject> => {
  console.log('🔄 Upserting provider base pricing:', { providerId, projectTypeId, data });

  const { data: result, error } = await supabase
    .from('provider_base_pricing')
    .upsert(
      {
        provider_id: providerId,
        project_type_id: projectTypeId,
        ...data,
      },
      {
        onConflict: 'provider_id,project_type_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to upsert provider base pricing:', error);
    throw new Error(`Failed to update project pricing: ${error.message}`);
  }

  console.log('✅ Provider base pricing updated');
  return result;
};

/**
 * Remove provider service
 */
export const removeProviderService = async (
  providerId: string,
  serviceId: string
): Promise<void> => {
  console.log('🗑️ Removing provider service:', { providerId, serviceId });

  const { error } = await supabase
    .from('provider_services')
    .delete()
    .eq('provider_id', providerId)
    .eq('service_id', serviceId);

  if (error) {
    console.error('❌ Failed to remove provider service:', error);
    throw new Error(`Failed to remove service: ${error.message}`);
  }

  console.log('✅ Provider service removed');
};

/**
 * Remove provider base pricing for a project type
 */
export const removeProviderProject = async (
  providerId: string,
  projectTypeId: string
): Promise<void> => {
  console.log('🗑️ Removing provider base pricing:', { providerId, projectTypeId });

  const { error } = await supabase
    .from('provider_base_pricing')
    .delete()
    .eq('provider_id', providerId)
    .eq('project_type_id', projectTypeId);

  if (error) {
    console.error('❌ Failed to remove provider base pricing:', error);
    throw new Error(`Failed to remove project pricing: ${error.message}`);
  }

  console.log('✅ Provider base pricing removed');
};

/**
 * Fetch project types for a specific service category
 */
export const fetchProjectTypesByService = async (serviceId: string): Promise<ProjectType[]> => {
  console.log('📋 Fetching project types for service:', serviceId);

  const { data, error } = await supabase
    .from('project_services')
    .select(`
      project_types!inner (
        id,
        name,
        description,
        estimated_duration,
        avg_price_min,
        avg_price_max,
        complexity,
        icon,
        category,
        is_active,
        sort_order
      )
    `)
    .eq('service_id', serviceId)
    .eq('project_types.is_active', true);

  if (error) {
    console.error('❌ Failed to fetch project types by service:', error);
    throw new Error(`Failed to fetch project types: ${error.message}`);
  }

  // Extract project types from the join result
  const projectTypes = data?.map(item => (item as any).project_types).filter(Boolean) || [];

  console.log('✅ Project types by service fetched:', projectTypes.length);
  return projectTypes;
};

/**
 * Update provider's selected services array in provider_profiles table
 */
export const updateProviderServices = async (
  providerId: string,
  serviceIds: string[]
): Promise<void> => {
  console.log('🔄 Updating provider services array:', { providerId, serviceIds });

  const { error } = await supabase
    .from('provider_profiles')
    .update({
      services: serviceIds,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', providerId);

  if (error) {
    console.error('❌ Failed to update provider services:', error);
    throw new Error(`Failed to update provider services: ${error.message}`);
  }

  console.log('✅ Provider services array updated successfully');
};