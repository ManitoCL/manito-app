/**
 * Spanish language strings for the Manito Chilean home services marketplace
 */

export const strings = {
  // Common
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    accept: 'Aceptar',
    continue: 'Continuar',
    back: 'Atrás',
    next: 'Siguiente',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    retry: 'Reintentar',
    close: 'Cerrar',
    ok: 'OK',
    yes: 'Sí',
    no: 'No',
    optional: 'opcional',
    required: 'obligatorio'
  },

  // Authentication
  auth: {
    login: 'Iniciar Sesión',
    register: 'Crear Cuenta',
    logout: 'Cerrar Sesión',
    forgotPassword: 'Olvidé mi contraseña',
    email: 'Email',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    rememberMe: 'Recordarme',
    loginButton: 'Ingresar',
    registerButton: 'Registrarme',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    dontHaveAccount: '¿No tienes cuenta?',
    signInHere: 'Inicia sesión aquí',
    signUpHere: 'Regístrate aquí'
  },

  // User Registration
  registration: {
    title: 'Crear Cuenta',
    welcome: 'Bienvenido a Manito',
    subtitle: 'La plataforma de servicios para el hogar más confiable de Chile',
    
    // User Type Selection
    userTypeQuestion: '¿Cómo quieres usar Manito?',
    userTypeSubtitle: 'Selecciona el tipo de cuenta que mejor se adapte a ti',
    
    // Consumer
    consumerTitle: 'Busco Servicios',
    consumerDescription: 'Encuentra profesionales confiables para tu hogar',
    consumerBenefits: {
      professionals: 'Acceso a miles de profesionales verificados',
      bookings: 'Reservas rápidas y seguras',
      payments: 'Pagos protegidos',
      reviews: 'Reseñas y calificaciones reales'
    },
    
    // Provider
    providerTitle: 'Ofrezco Servicios',
    providerDescription: 'Conecta con clientes y haz crecer tu negocio',
    providerBenefits: {
      jobs: 'Recibe trabajos en tu área',
      calendar: 'Gestiona tu calendario',
      payments: 'Pagos seguros y rápidos',
      reputation: 'Construye tu reputación'
    },
    
    // Method Selection
    methodQuestion: '¿Cómo prefieres registrarte?',
    methodSubtitle: 'Elige el método que prefieras para crear tu cuenta',
    
    // Email Method
    emailMethod: 'Con Email',
    emailMethodDescription: 'Usa tu dirección de email para registrarte',
    emailBenefits: {
      recovery: 'Fácil recuperación de cuenta',
      notifications: 'Notificaciones por email',
      access: 'Acceso desde cualquier dispositivo'
    },
    
    // Phone Method
    phoneMethod: 'Con Teléfono',
    phoneMethodDescription: 'Usa tu número de teléfono chileno',
    phoneBenefits: {
      verification: 'Verificación instantánea',
      sms: 'Notificaciones por SMS',
      fast: 'Registro más rápido'
    },
    
    // Form Steps
    createConsumerAccount: 'Crear cuenta como Cliente',
    createProviderAccount: 'Crear cuenta como Profesional',
    verifyPhoneTitle: 'Verifica tu número',
    verifyPhoneDescription: 'Te enviaremos un código de verificación por SMS',
    enterCodeTitle: 'Ingresa el código',
    enterCodeDescription: 'Enviamos un código de 6 dígitos a',
    completeProfileTitle: 'Completa tu perfil',
    consumerProfileDescription: 'Información básica para tu cuenta',
    providerProfileDescription: 'Información para tu perfil profesional',
    
    // Form Fields
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'Tu nombre y apellidos',
    phoneNumber: 'Número de teléfono',
    phoneNumberPlaceholder: '9 1234 5678',
    rut: 'RUT',
    rutOptional: 'RUT (opcional)',
    rutPlaceholder: '12.345.678-9',
    businessName: 'Nombre del negocio',
    businessNamePlaceholder: 'Nombre de tu empresa o negocio',
    description: 'Descripción',
    descriptionOptional: 'Descripción (opcional)',
    descriptionPlaceholder: 'Describe tu experiencia y servicios',
    servicesOffered: 'Servicios que ofreces',
    serviceRegion: 'Región donde ofreces servicios',
    verificationCode: 'Código de verificación',
    verificationCodePlaceholder: '123456',
    
    // Actions
    sendCode: 'Enviar código',
    verifyCode: 'Verificar código',
    resendCode: 'Reenviar código',
    resendCodeTimer: 'Reenviar en {seconds}s',
    changeNumber: 'Cambiar número',
    changeAccountType: 'Cambiar tipo de cuenta',
    createAccount: 'Crear cuenta',
    createProfessionalAccount: 'Crear cuenta profesional',
    
    // Success Messages
    accountCreated: 'Cuenta creada',
    emailVerificationSent: 'Te hemos enviado un email de verificación. Por favor revisa tu bandeja de entrada.',
    phoneAccountCreated: 'Tu cuenta ha sido creada exitosamente.',
    
    // Error Messages
    registrationError: 'Error de registro',
    registrationErrorMessage: 'No se pudo crear la cuenta. Intenta nuevamente.',
    genericError: 'Ocurrió un error durante el registro. Intenta nuevamente.',
    incompleteForm: 'Formulario incompleto',
    incompleteFormMessage: 'Por favor corrige los errores antes de continuar',
    otpSendError: 'No se pudo enviar el código de verificación. Intenta nuevamente.',
    otpVerifyError: 'No se pudo verificar el código. Intenta nuevamente.',
    invalidOtp: 'Código de verificación incorrecto',
    selectAtLeastOneService: 'Selecciona al menos un servicio',
    selectRegion: 'Selecciona tu región'
  },

  // Validation Messages
  validation: {
    required: 'Este campo es obligatorio',
    
    email: {
      invalid: 'Ingresa un email válido',
      required: 'El email es obligatorio'
    },
    
    phone: {
      invalid: 'Ingresa un número de teléfono chileno válido',
      required: 'El teléfono es obligatorio',
      format: 'Formato: +56 9 XXXX XXXX',
      validNumber: 'Número válido',
      helpText: 'Ingresa tu número de teléfono móvil chileno'
    },
    
    rut: {
      invalid: 'RUT inválido',
      invalidFormat: 'RUT inválido. Formato: XX.XXX.XXX-X',
      required: 'El RUT es obligatorio',
      format: 'Formato: XX.XXX.XXX-X',
      validRut: 'RUT válido',
      validating: 'Validando RUT...',
      helpText: 'Ingresa tu RUT chileno (con o sin puntos y guión)'
    },
    
    password: {
      required: 'La contraseña es obligatoria',
      minLength: 'La contraseña debe tener al menos 6 caracteres',
      weak: 'La contraseña es muy débil',
      confirmRequired: 'Confirma tu contraseña',
      mismatch: 'Las contraseñas no coinciden',
      minLengthPlaceholder: 'Mínimo 6 caracteres',
      repeatPlaceholder: 'Repite tu contraseña'
    },
    
    name: {
      required: 'El nombre completo es obligatorio',
      minLength: 'El nombre debe tener al menos 2 caracteres'
    },
    
    businessName: {
      required: 'El nombre del negocio es obligatorio',
      minLength: 'El nombre del negocio debe tener al menos 2 caracteres'
    },
    
    otp: {
      required: 'Ingresa el código de verificación',
      length: 'El código debe tener 6 dígitos'
    }
  },

  // Chilean Regions
  regions: {
    'arica-parinacota': 'Arica y Parinacota',
    'tarapaca': 'Tarapacá',
    'antofagasta': 'Antofagasta',
    'atacama': 'Atacama',
    'coquimbo': 'Coquimbo',
    'valparaiso': 'Valparaíso',
    'metropolitana': 'Región Metropolitana',
    'ohiggins': "O'Higgins",
    'maule': 'Maule',
    'nuble': 'Ñuble',
    'biobio': 'Biobío',
    'araucania': 'La Araucanía',
    'los-rios': 'Los Ríos',
    'los-lagos': 'Los Lagos',
    'aysen': 'Aysén',
    'magallanes': 'Magallanes y Antártica Chilena'
  },

  // Service Categories
  services: {
    'limpieza': 'Limpieza y Aseo',
    'mantención': 'Mantención y Reparaciones',
    'jardín': 'Jardín y Paisajismo',
    'construcción': 'Construcción y Remodelación',
    'electricidad': 'Electricidad',
    'gasfitería': 'Gasfitería',
    'pintura': 'Pintura',
    'carpintería': 'Carpintería',
    'cerrajería': 'Cerrajería',
    'mudanzas': 'Mudanzas y Transporte',
    'tecnología': 'Tecnología y Computación',
    'educación': 'Educación y Clases',
    'cuidado': 'Cuidado Personal y Salud',
    'eventos': 'Eventos y Catering',
    'seguridad': 'Seguridad',
    'otros': 'Otros Servicios'
  },

  // Navigation
  navigation: {
    home: 'Inicio',
    search: 'Buscar',
    bookings: 'Reservas',
    messages: 'Mensajes',
    profile: 'Perfil'
  },

  // Booking Status
  bookingStatus: {
    requested: 'Solicitada',
    accepted: 'Aceptada',
    in_progress: 'En Progreso',
    completed: 'Completada',
    cancelled: 'Cancelada'
  },

  // Provider Status
  providerStatus: {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    verified: 'Verificado',
    unverified: 'No verificado'
  },

  // Time and Date
  time: {
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    thisWeek: 'Esta semana',
    thisMonth: 'Este mes',
    now: 'Ahora',
    minute: 'minuto',
    minutes: 'minutos',
    hour: 'hora',
    hours: 'horas',
    day: 'día',
    days: 'días',
    week: 'semana',
    weeks: 'semanas',
    month: 'mes',
    months: 'meses',
    year: 'año',
    years: 'años'
  },

  // Currency
  currency: {
    clp: 'CLP',
    peso: 'peso',
    pesos: 'pesos',
    perHour: 'por hora',
    perService: 'por servicio',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'IVA',
    discount: 'Descuento'
  }
};

// Helper function to replace placeholders in strings
export const formatString = (template: string, replacements: Record<string, string | number>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return replacements[key]?.toString() || match;
  });
};

// Helper function to get pluralized strings
export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

export default strings;