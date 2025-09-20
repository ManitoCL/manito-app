/**
 * Profile completion calculation utilities
 * Matches the backend calculate_epic_profile_completion function
 */

interface ProfileData {
  full_name?: string;
  email_verified_at?: string;
  phone_verified_at?: string;
  avatar_url?: string;
  rut_verified?: boolean;
  date_of_birth?: string;
  whatsapp_number?: string;
  user_type?: 'customer' | 'provider' | 'admin';
  profile_completion_percentage?: number;
}

interface AddressData {
  comuna?: string;
  street?: string;
  emergency_contact_name?: string;
}

interface ProviderData {
  business_name?: string;
  description?: string;
  services?: string[];
  hourly_rate_clp?: number;
  professional_title?: string;
  business_registration_number?: string;
}

/**
 * Calculate profile completion percentage using Epic #1 & #2 logic
 * Matches the database function calculate_epic_profile_completion
 */
export const calculateProfileCompletion = (
  profile: ProfileData,
  address: AddressData | null = null,
  providerProfile: ProviderData | null = null
): number => {
  let completionScore = 0;
  const isProvider = profile.user_type === 'provider';
  const totalFields = isProvider ? 70 : 50;

  // Core user fields (25 points for customers, 25 for providers)
  if (profile.full_name) completionScore += 5;
  if (profile.email_verified_at) completionScore += 5;
  if (profile.phone_verified_at) completionScore += 5;
  if (profile.avatar_url) completionScore += 5;
  if (profile.rut_verified) completionScore += 5;

  // Enhanced profile fields (25 points for customers, 25 for providers)
  if (address?.comuna) completionScore += 5;
  if (address?.street) completionScore += 5;
  if (profile.date_of_birth) completionScore += 3;
  if (profile.whatsapp_number) completionScore += 5;
  if (address?.emergency_contact_name) completionScore += 4;
  // communication_preferences is handled in database, assume 3 points if profile exists
  if (profile.full_name) completionScore += 3;

  // Provider-specific fields (20 additional points)
  if (isProvider && providerProfile) {
    if (providerProfile.business_name) completionScore += 5;
    if (providerProfile.description && providerProfile.description.length > 20) completionScore += 3;
    if (providerProfile.services && providerProfile.services.length > 0) completionScore += 4;
    if (providerProfile.hourly_rate_clp) completionScore += 2;
    if (providerProfile.professional_title) completionScore += 3;
    if (providerProfile.business_registration_number) completionScore += 3;
  }

  return Math.min(100, Math.round((completionScore / totalFields) * 100));
};

/**
 * Get profile completion status with user-friendly messages
 */
export const getProfileCompletionStatus = (percentage: number) => {
  if (percentage >= 90) {
    return {
      status: 'excellent' as const,
      message: 'Perfil completo',
      color: '#10B981', // green-500
      description: 'Tu perfil está completamente configurado'
    };
  } else if (percentage >= 70) {
    return {
      status: 'good' as const,
      message: 'Casi completo',
      color: '#3B82F6', // blue-500
      description: 'Completa algunos campos más para mejorar tu visibilidad'
    };
  } else if (percentage >= 50) {
    return {
      status: 'moderate' as const,
      message: 'En progreso',
      color: '#F59E0B', // amber-500
      description: 'Completa más información para atraer más clientes'
    };
  } else {
    return {
      status: 'incomplete' as const,
      message: 'Incompleto',
      color: '#EF4444', // red-500
      description: 'Completa tu perfil para empezar a recibir solicitudes'
    };
  }
};

/**
 * Get missing profile fields for Epic #2 completion
 */
export const getMissingProfileFields = (
  profile: ProfileData,
  address: AddressData | null = null,
  providerProfile: ProviderData | null = null
): string[] => {
  const missing: string[] = [];
  const isProvider = profile.user_type === 'provider';

  // Core fields
  if (!profile.full_name) missing.push('Nombre completo');
  if (!profile.email_verified_at) missing.push('Verificación de email');
  if (!profile.phone_verified_at) missing.push('Verificación de teléfono');
  if (!profile.avatar_url) missing.push('Foto de perfil');
  if (!profile.rut_verified) missing.push('Verificación de RUT');

  // Address fields
  if (!address?.comuna) missing.push('Comuna');
  if (!address?.street) missing.push('Dirección');
  if (!profile.whatsapp_number) missing.push('WhatsApp');
  if (!address?.emergency_contact_name) missing.push('Contacto de emergencia');

  // Optional but recommended
  if (!profile.date_of_birth) missing.push('Fecha de nacimiento');

  // Provider-specific fields
  if (isProvider && providerProfile) {
    if (!providerProfile.business_name) missing.push('Nombre del negocio');
    if (!providerProfile.description || providerProfile.description.length <= 20) {
      missing.push('Descripción del negocio');
    }
    if (!providerProfile.services || providerProfile.services.length === 0) {
      missing.push('Servicios ofrecidos');
    }
    if (!providerProfile.hourly_rate_clp) missing.push('Tarifa por hora');
    if (!providerProfile.professional_title) missing.push('Título profesional');
    if (!providerProfile.business_registration_number) missing.push('Registro de negocio');
  }

  return missing;
};

/**
 * Check if profile meets minimum completion for Epic #2 features
 */
export const meetsMinimumCompletion = (percentage: number): boolean => {
  return percentage >= 60; // Minimum 60% for accessing marketplace features
};

/**
 * Get next recommended action for profile completion
 */
export const getNextRecommendedAction = (
  profile: ProfileData,
  address: AddressData | null = null,
  providerProfile: ProviderData | null = null
): { action: string; description: string; priority: 'high' | 'medium' | 'low' } => {
  const isProvider = profile.user_type === 'provider';

  // High priority actions
  if (!profile.email_verified_at) {
    return {
      action: 'Verificar email',
      description: 'Confirma tu dirección de email para acceder a todas las funciones',
      priority: 'high'
    };
  }

  if (!profile.phone_verified_at) {
    return {
      action: 'Verificar teléfono',
      description: 'Verifica tu número para recibir notificaciones importantes',
      priority: 'high'
    };
  }

  if (!profile.rut_verified) {
    return {
      action: 'Verificar RUT',
      description: 'Verifica tu RUT para cumplir con regulaciones chilenas',
      priority: 'high'
    };
  }

  // Medium priority actions
  if (!address?.comuna) {
    return {
      action: 'Agregar comuna',
      description: 'Indica tu ubicación para conectar con clientes cercanos',
      priority: 'medium'
    };
  }

  if (isProvider && providerProfile && !providerProfile.business_name) {
    return {
      action: 'Nombre del negocio',
      description: 'Agrega el nombre de tu negocio para destacar',
      priority: 'medium'
    };
  }

  if (!profile.avatar_url) {
    return {
      action: 'Foto de perfil',
      description: 'Agrega una foto para generar más confianza',
      priority: 'medium'
    };
  }

  // Low priority actions
  if (!profile.whatsapp_number) {
    return {
      action: 'WhatsApp',
      description: 'Facilita la comunicación con clientes',
      priority: 'low'
    };
  }

  return {
    action: 'Completar información adicional',
    description: 'Agrega más detalles para mejorar tu visibilidad',
    priority: 'low'
  };
};