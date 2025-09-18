/**
 * Chilean Phone Number Validation Utilities
 *
 * Chilean phone number formats:
 * - Mobile: +569 XXXX XXXX (most common for marketplace users)
 * - Fixed: +562 XXXX XXXX (Santiago), +56XX XXXX XXXX (regions)
 * - International format: +56 9 XXXX XXXX
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formattedPhone?: string;
  phoneType?: 'mobile' | 'fixed' | 'unknown';
  carrier?: string;
}

/**
 * Chilean mobile carriers and their number ranges
 */
export const CHILEAN_CARRIERS = {
  MOVISTAR: {
    name: 'Movistar',
    ranges: ['9', '8'],
    displayName: 'Movistar'
  },
  ENTEL: {
    name: 'Entel',
    ranges: ['9', '8'],
    displayName: 'Entel'
  },
  CLARO: {
    name: 'Claro',
    ranges: ['9', '8'],
    displayName: 'Claro'
  },
  WOM: {
    name: 'WOM',
    ranges: ['9'],
    displayName: 'WOM'
  },
  VTR: {
    name: 'VTR',
    ranges: ['9'],
    displayName: 'VTR'
  }
} as const;

/**
 * Chilean area codes for fixed lines
 */
export const CHILEAN_AREA_CODES = {
  '2': 'Santiago',
  '32': 'Valparaíso',
  '33': 'Viña del Mar',
  '34': 'Los Andes',
  '35': 'Rancagua',
  '41': 'Puerto Montt',
  '42': 'Osorno',
  '43': 'Valdivia',
  '45': 'Temuco',
  '51': 'Iquique',
  '52': 'Antofagasta',
  '53': 'Copiapó',
  '55': 'Calama',
  '57': 'Arica',
  '58': 'Punta Arenas',
  '61': 'Coyhaique',
  '63': 'Castro',
  '64': 'Puerto Aysén',
  '65': 'Puerto Natales',
  '67': 'Puerto Williams',
  '71': 'Talca',
  '72': 'Rancagua',
  '73': 'Chillán',
  '75': 'Curicó'
} as const;

/**
 * Cleans phone input removing all non-numeric characters except +
 */
export function cleanPhoneInput(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Normalizes Chilean phone number to standard format
 * Converts various input formats to +56XXXXXXXXX
 */
export function normalizeChileanPhone(phone: string): string {
  const cleaned = cleanPhoneInput(phone);

  // Remove country code variations and normalize
  let normalized = cleaned;

  // Handle various country code formats
  if (normalized.startsWith('+56')) {
    normalized = normalized.substring(3);
  } else if (normalized.startsWith('56')) {
    normalized = normalized.substring(2);
  } else if (normalized.startsWith('0')) {
    // Remove leading zero (old format)
    normalized = normalized.substring(1);
  }

  // Add country code
  return `+56${normalized}`;
}

/**
 * Formats Chilean phone number for display
 * Examples:
 * - +56 9 1234 5678 (mobile)
 * - +56 2 1234 5678 (Santiago fixed)
 * - +56 32 123 4567 (regional fixed)
 */
export function formatChileanPhone(phone: string): string {
  const normalized = normalizeChileanPhone(phone);
  const number = normalized.substring(3); // Remove +56

  if (number.length === 0) return '+56 ';

  // Mobile numbers (9XXXXXXXX)
  if (number.startsWith('9') && number.length === 9) {
    const mobile = number.substring(1); // Remove 9
    if (mobile.length <= 4) {
      return `+56 9 ${mobile}`;
    } else {
      return `+56 9 ${mobile.substring(0, 4)} ${mobile.substring(4)}`;
    }
  }

  // Santiago fixed lines (2XXXXXXXX)
  if (number.startsWith('2') && number.length === 9) {
    const fixed = number.substring(1); // Remove 2
    if (fixed.length <= 4) {
      return `+56 2 ${fixed}`;
    } else {
      return `+56 2 ${fixed.substring(0, 4)} ${fixed.substring(4)}`;
    }
  }

  // Regional fixed lines (XXXXXXXX or XXXXXXXXX)
  if (number.length >= 8 && number.length <= 9) {
    // Try to identify area code
    for (const [code, city] of Object.entries(CHILEAN_AREA_CODES)) {
      if (number.startsWith(code)) {
        const localNumber = number.substring(code.length);
        if (localNumber.length === 7 || localNumber.length === 6) {
          const formatted = localNumber.length > 3
            ? `${localNumber.substring(0, 3)} ${localNumber.substring(3)}`
            : localNumber;
          return `+56 ${code} ${formatted}`;
        }
      }
    }
  }

  // Fallback formatting for partial numbers
  if (number.length <= 4) {
    return `+56 ${number}`;
  } else if (number.length <= 8) {
    return `+56 ${number.substring(0, 1)} ${number.substring(1)}`;
  } else {
    return `+56 ${number.substring(0, 1)} ${number.substring(1, 5)} ${number.substring(5)}`;
  }
}

/**
 * Determines phone type and carrier information
 */
export function getPhoneInfo(phone: string): {
  type: 'mobile' | 'fixed' | 'unknown';
  carrier?: string;
  region?: string;
} {
  const normalized = normalizeChileanPhone(phone);
  const number = normalized.substring(3);

  // Mobile numbers start with 9
  if (number.startsWith('9') && number.length === 9) {
    return {
      type: 'mobile',
      carrier: 'Unknown' // Carrier detection would require more detailed database
    };
  }

  // Fixed lines
  for (const [code, city] of Object.entries(CHILEAN_AREA_CODES)) {
    if (number.startsWith(code)) {
      const localNumber = number.substring(code.length);
      if (localNumber.length === 7 || localNumber.length === 6) {
        return {
          type: 'fixed',
          region: city
        };
      }
    }
  }

  return { type: 'unknown' };
}

/**
 * Validates Chilean phone number
 */
export function validateChileanPhone(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      error: 'Número de teléfono es requerido'
    };
  }

  const cleaned = cleanPhoneInput(phone);

  if (cleaned.length === 0) {
    return {
      isValid: false,
      error: 'Número de teléfono es requerido'
    };
  }

  // Basic format validation
  if (!cleaned.match(/^(\+56|56|0)?[0-9]+$/)) {
    return {
      isValid: false,
      error: 'Formato de teléfono inválido'
    };
  }

  const normalized = normalizeChileanPhone(phone);
  const number = normalized.substring(3);

  // Validate mobile numbers (most common for marketplace)
  if (number.startsWith('9')) {
    if (number.length !== 9) {
      return {
        isValid: false,
        error: 'Número móvil debe tener 8 dígitos después del 9'
      };
    }

    const phoneInfo = getPhoneInfo(normalized);
    return {
      isValid: true,
      formattedPhone: formatChileanPhone(phone),
      phoneType: phoneInfo.type,
      carrier: phoneInfo.carrier
    };
  }

  // Validate Santiago fixed lines
  if (number.startsWith('2')) {
    if (number.length !== 9) {
      return {
        isValid: false,
        error: 'Número fijo de Santiago debe tener 8 dígitos después del 2'
      };
    }

    const phoneInfo = getPhoneInfo(normalized);
    return {
      isValid: true,
      formattedPhone: formatChileanPhone(phone),
      phoneType: phoneInfo.type,
      carrier: phoneInfo.region
    };
  }

  // Validate regional fixed lines
  for (const [code, city] of Object.entries(CHILEAN_AREA_CODES)) {
    if (number.startsWith(code)) {
      const localNumber = number.substring(code.length);
      const expectedLength = code.length === 1 ? 7 : 6; // Single digit codes expect 7 digits, double digit codes expect 6

      if (localNumber.length !== expectedLength) {
        return {
          isValid: false,
          error: `Número fijo de ${city} debe tener ${expectedLength} dígitos después del código ${code}`
        };
      }

      const phoneInfo = getPhoneInfo(normalized);
      return {
        isValid: true,
        formattedPhone: formatChileanPhone(phone),
        phoneType: phoneInfo.type,
        carrier: phoneInfo.region
      };
    }
  }

  return {
    isValid: false,
    error: 'Número de teléfono no corresponde a un formato chileno válido'
  };
}

/**
 * Validates and formats phone input for real-time validation
 */
export function validateAndFormatChileanPhone(phone: string): {
  formatted: string;
  isValid: boolean;
  error?: string;
} {
  if (!phone || phone.length === 0) {
    return {
      formatted: '',
      isValid: false
    };
  }

  // For partial input, provide progressive formatting
  const formatted = formatChileanPhone(phone);
  const validation = validateChileanPhone(phone);

  return {
    formatted,
    isValid: validation.isValid,
    error: validation.error
  };
}

/**
 * Phone validation rules for different contexts
 */
export const PHONE_VALIDATION_RULES = {
  // Mobile only (preferred for SMS verification)
  MOBILE_ONLY: {
    allowedTypes: ['mobile'],
    description: 'Solo números móviles',
    preferredFormat: '+56 9 XXXX XXXX'
  },

  // Fixed only
  FIXED_ONLY: {
    allowedTypes: ['fixed'],
    description: 'Solo números fijos',
    preferredFormat: '+56 X XXXX XXXX'
  },

  // Any Chilean phone
  ANY: {
    allowedTypes: ['mobile', 'fixed'],
    description: 'Cualquier teléfono chileno',
    preferredFormat: '+56 X XXXX XXXX'
  }
} as const;

/**
 * Validates phone according to specific context
 */
export function validatePhoneByContext(
  phone: string,
  context: keyof typeof PHONE_VALIDATION_RULES = 'ANY'
): PhoneValidationResult {
  const basicValidation = validateChileanPhone(phone);

  if (!basicValidation.isValid) {
    return basicValidation;
  }

  const rules = PHONE_VALIDATION_RULES[context];
  const phoneInfo = getPhoneInfo(phone);

  if (!rules.allowedTypes.includes(phoneInfo.type)) {
    return {
      isValid: false,
      error: `${rules.description} - formato: ${rules.preferredFormat}`
    };
  }

  return basicValidation;
}