/**
 * Chilean RUT (Rol Único Tributario) Validation Utilities
 *
 * RUT Format: XX.XXX.XXX-Y where Y is the verification digit
 * Examples: 12.345.678-5, 9.876.543-2
 */

export interface RutValidationResult {
  isValid: boolean;
  error?: string;
  formattedRut?: string;
}

/**
 * Calculates the verification digit for a RUT number
 */
export function calculateRutVerificationDigit(rutNumber: string): string {
  const cleanRut = rutNumber.replace(/[^0-9]/g, '');
  let sum = 0;
  let multiplier = 2;

  // Calculate sum from right to left
  for (let i = cleanRut.length - 1; i >= 0; i--) {
    sum += parseInt(cleanRut[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const digit = 11 - remainder;

  if (digit === 11) return '0';
  if (digit === 10) return 'K';
  return digit.toString();
}

/**
 * Formats RUT with dots and hyphen
 * Example: 12345678 -> 12.345.678
 */
export function formatRutNumber(rutNumber: string): string {
  const cleanRut = rutNumber.replace(/[^0-9]/g, '');

  if (cleanRut.length <= 1) return cleanRut;

  // Add dots every 3 digits from right to left
  const reversed = cleanRut.split('').reverse();
  const chunks: string[] = [];

  for (let i = 0; i < reversed.length; i += 3) {
    chunks.push(reversed.slice(i, i + 3).reverse().join(''));
  }

  return chunks.reverse().join('.');
}

/**
 * Formats complete RUT with verification digit
 * Example: 123456785 -> 12.345.678-5
 */
export function formatCompleteRut(rut: string): string {
  const cleanRut = rut.replace(/[^0-9K]/gi, '').toUpperCase();

  if (cleanRut.length < 2) return cleanRut;

  const rutNumber = cleanRut.slice(0, -1);
  const verificationDigit = cleanRut.slice(-1);

  const formattedNumber = formatRutNumber(rutNumber);

  return `${formattedNumber}-${verificationDigit}`;
}

/**
 * Cleans RUT input removing all non-alphanumeric characters
 */
export function cleanRutInput(rut: string): string {
  return rut.replace(/[^0-9K]/gi, '').toUpperCase();
}

/**
 * Validates Chilean RUT format and verification digit
 */
export function validateRut(rut: string): RutValidationResult {
  if (!rut || typeof rut !== 'string') {
    return {
      isValid: false,
      error: 'RUT es requerido'
    };
  }

  const cleanRut = cleanRutInput(rut);

  // Check minimum length (at least 2 characters: number + verification digit)
  if (cleanRut.length < 2) {
    return {
      isValid: false,
      error: 'RUT debe tener al menos 2 caracteres'
    };
  }

  // Check maximum length (Chilean RUTs don't exceed 9 characters)
  if (cleanRut.length > 9) {
    return {
      isValid: false,
      error: 'RUT no puede tener más de 9 caracteres'
    };
  }

  // Extract number and verification digit
  const rutNumber = cleanRut.slice(0, -1);
  const providedDigit = cleanRut.slice(-1);

  // Check that RUT number contains only digits
  if (!/^\d+$/.test(rutNumber)) {
    return {
      isValid: false,
      error: 'RUT debe contener solo números y dígito verificador'
    };
  }

  // Check that verification digit is valid (0-9 or K)
  if (!/^[0-9K]$/.test(providedDigit)) {
    return {
      isValid: false,
      error: 'Dígito verificador debe ser un número (0-9) o K'
    };
  }

  // Calculate expected verification digit
  const expectedDigit = calculateRutVerificationDigit(rutNumber);

  // Validate verification digit
  if (providedDigit !== expectedDigit) {
    return {
      isValid: false,
      error: 'RUT inválido - dígito verificador incorrecto'
    };
  }

  // RUT is valid
  return {
    isValid: true,
    formattedRut: formatCompleteRut(cleanRut)
  };
}

/**
 * Validates and formats RUT input for real-time validation
 * Returns formatted RUT if valid, or original input if invalid
 */
export function validateAndFormatRut(rut: string): {
  formatted: string;
  isValid: boolean;
  error?: string;
} {
  const validation = validateRut(rut);

  if (validation.isValid && validation.formattedRut) {
    return {
      formatted: validation.formattedRut,
      isValid: true
    };
  }

  // For invalid RUTs, return partially formatted input for better UX
  const cleanRut = cleanRutInput(rut);
  if (cleanRut.length >= 2) {
    const rutNumber = cleanRut.slice(0, -1);
    const verificationDigit = cleanRut.slice(-1);
    const formattedNumber = formatRutNumber(rutNumber);

    return {
      formatted: `${formattedNumber}-${verificationDigit}`,
      isValid: false,
      error: validation.error
    };
  }

  return {
    formatted: cleanRut,
    isValid: false,
    error: validation.error
  };
}

/**
 * Common Chilean RUT validation rules for different contexts
 */
export const RUT_VALIDATION_RULES = {
  // Personal RUTs (individuals)
  PERSONAL: {
    minLength: 7, // Minimum 1.000.000
    maxLength: 8, // Maximum 99.999.999
    description: 'RUT de persona natural'
  },

  // Company RUTs (empresas)
  COMPANY: {
    minLength: 7,
    maxLength: 8,
    description: 'RUT de empresa'
  },

  // Foreign RUTs start with specific ranges
  FOREIGN: {
    pattern: /^(100000000|[0-9]{8})[0-9K]$/,
    description: 'RUT de extranjero'
  }
} as const;

/**
 * Validates RUT according to specific Chilean context
 */
export function validateRutByContext(
  rut: string,
  context: keyof typeof RUT_VALIDATION_RULES = 'PERSONAL'
): RutValidationResult {
  const basicValidation = validateRut(rut);

  if (!basicValidation.isValid) {
    return basicValidation;
  }

  const cleanRut = cleanRutInput(rut);
  const rutNumber = cleanRut.slice(0, -1);
  const rules = RUT_VALIDATION_RULES[context];

  // Check length constraints for personal/company RUTs
  if ('minLength' in rules && 'maxLength' in rules) {
    if (rutNumber.length < rules.minLength) {
      return {
        isValid: false,
        error: `RUT debe tener al menos ${rules.minLength} dígitos para ${rules.description}`
      };
    }

    if (rutNumber.length > rules.maxLength) {
      return {
        isValid: false,
        error: `RUT no puede tener más de ${rules.maxLength} dígitos para ${rules.description}`
      };
    }
  }

  return basicValidation;
}