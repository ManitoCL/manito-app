// =============================================================================
// CHILEAN VALIDATION UTILITIES - COMPREHENSIVE VALIDATION SYSTEM
// Epic #2: Profile Management - Chilean Market Validation
// =============================================================================
// Complete validation utilities for Chilean market including RUT, names, banking
// Integrates with existing components and provides consistent error messages
// Author: Frontend UI Expert
// Created: 2025-09-19

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

// =============================================================================
// CHILEAN RUT VALIDATION
// =============================================================================

/**
 * Calculate RUT verification digit
 */
const calculateRUTVerifier = (rut: string): string => {
  let sum = 0;
  let multiplier = 2;

  // Calculate from right to left
  for (let i = rut.length - 1; i >= 0; i--) {
    sum += parseInt(rut[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const digit = 11 - remainder;

  if (digit === 11) return '0';
  if (digit === 10) return 'K';
  return digit.toString();
};

/**
 * Format RUT with dots and dash
 */
export const formatRUT = (rut: string): string => {
  // Remove all non-alphanumeric characters
  const clean = rut.replace(/[^0-9Kk]/g, '').toUpperCase();
  if (clean.length === 0) return '';

  // Separate number and verifier
  const number = clean.slice(0, -1);
  const verifier = clean.slice(-1);

  // Add dots every 3 digits from right to left
  const formatted = number.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

  return `${formatted}-${verifier}`;
};

/**
 * Validate Chilean RUT
 */
export const validateChileanRUT = (rut: string): ValidationResult => {
  const cleanRUT = rut.replace(/[.-]/g, '').toUpperCase().trim();

  // Check format
  if (!/^\d{7,8}[0-9Kk]$/.test(cleanRUT)) {
    return {
      isValid: false,
      error: 'Formato de RUT inválido. Debe tener entre 7 y 8 dígitos más el dígito verificador. Ejemplo: 12.345.678-9'
    };
  }

  const rutNumber = cleanRUT.slice(0, -1);
  const providedVerifier = cleanRUT.slice(-1);
  const calculatedVerifier = calculateRUTVerifier(rutNumber);

  if (providedVerifier !== calculatedVerifier) {
    return {
      isValid: false,
      error: 'RUT inválido. El dígito verificador no coincide.'
    };
  }

  return {
    isValid: true,
    sanitized: formatRUT(cleanRUT)
  };
};

// =============================================================================
// CHILEAN NAME VALIDATION
// =============================================================================

/**
 * Validate Chilean names (supports accents and common characters)
 */
export const validateChileanName = (name: string): ValidationResult => {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'El nombre es requerido'
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: 'El nombre debe tener al menos 2 caracteres'
    };
  }

  if (trimmed.length > 50) {
    return {
      isValid: false,
      error: 'El nombre no puede tener más de 50 caracteres'
    };
  }

  // Chilean name pattern: letters, accents, spaces, hyphens, apostrophes
  const chileanNamePattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ\s'-]+$/;
  if (!chileanNamePattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'El nombre solo puede contener letras, espacios, guiones y apostrofes'
    };
  }

  // Check for consecutive spaces or special characters
  if (/\s{2,}/.test(trimmed) || /[-']{2,}/.test(trimmed)) {
    return {
      isValid: false,
      error: 'El nombre no puede tener espacios o caracteres especiales consecutivos'
    };
  }

  // Must start and end with a letter
  if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ]/.test(trimmed) || !/[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ]$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'El nombre debe comenzar y terminar con una letra'
    };
  }

  return {
    isValid: true,
    sanitized: trimmed
  };
};

// =============================================================================
// EMAIL VALIDATION
// =============================================================================

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim().toLowerCase();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'El email es requerido'
    };
  }

  // Basic email regex
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Formato de email inválido. Ejemplo: usuario@ejemplo.com'
    };
  }

  // Check length limits
  if (trimmed.length > 254) {
    return {
      isValid: false,
      error: 'El email es demasiado largo'
    };
  }

  const [localPart, domain] = trimmed.split('@');
  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'La parte local del email es demasiado larga'
    };
  }

  return {
    isValid: true,
    sanitized: trimmed
  };
};

// =============================================================================
// CHILEAN PHONE VALIDATION
// =============================================================================

/**
 * Format Chilean phone number
 */
export const formatChileanPhone = (phone: string): string => {
  // Remove all non-numeric characters except +
  const clean = phone.replace(/[^\d+]/g, '');

  // If it starts with +56, keep it
  if (clean.startsWith('+56')) {
    return clean;
  }

  // If it starts with 56, add +
  if (clean.startsWith('56') && clean.length >= 11) {
    return '+' + clean;
  }

  // If it starts with 9 (mobile), add +56
  if (clean.startsWith('9') && clean.length === 9) {
    return '+56' + clean;
  }

  // If it's just 8 digits and looks like a mobile number, add +569
  if (clean.length === 8 && /^[1-9]/.test(clean)) {
    return '+569' + clean;
  }

  return clean;
};

/**
 * Validate Chilean phone number
 */
export const validateChileanPhone = (phone: string): ValidationResult => {
  const trimmed = phone.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'El número de teléfono es requerido'
    };
  }

  const formatted = formatChileanPhone(trimmed);

  // Chilean mobile pattern: +56 9 XXXX XXXX
  const mobilePattern = /^\+569[0-9]{8}$/;
  // Chilean landline pattern: +56 X XXXX XXXX (where X is area code 2-8)
  const landlinePattern = /^\+56[2-8][0-9]{8}$/;

  if (!mobilePattern.test(formatted) && !landlinePattern.test(formatted)) {
    return {
      isValid: false,
      error: 'Número debe incluir +56 seguido del código de área y número. Ejemplo: +56912345678'
    };
  }

  return {
    isValid: true,
    sanitized: formatted
  };
};

// =============================================================================
// CHILEAN BANK ACCOUNT VALIDATION
// =============================================================================

/**
 * Validate Chilean bank account number
 */
export const validateChileanBankAccount = (
  accountNumber: string,
  accountType: 'cuenta_corriente' | 'cuenta_vista' | 'cuenta_ahorro'
): ValidationResult => {
  const trimmed = accountNumber.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'El número de cuenta es requerido'
    };
  }

  // Remove any spaces or dashes
  const clean = trimmed.replace(/[\s-]/g, '');

  // Must be only numbers
  if (!/^\d+$/.test(clean)) {
    return {
      isValid: false,
      error: 'El número de cuenta debe contener solo dígitos'
    };
  }

  // Length validation based on account type
  let minLength = 6;
  let maxLength = 15;

  switch (accountType) {
    case 'cuenta_corriente':
      minLength = 8;
      maxLength = 12;
      break;
    case 'cuenta_vista':
      minLength = 6;
      maxLength = 10;
      break;
    case 'cuenta_ahorro':
      minLength = 8;
      maxLength = 12;
      break;
  }

  if (clean.length < minLength || clean.length > maxLength) {
    return {
      isValid: false,
      error: `El número de cuenta debe tener entre ${minLength} y ${maxLength} dígitos`
    };
  }

  return {
    isValid: true,
    sanitized: clean
  };
};

// =============================================================================
// ADDRESS VALIDATION
// =============================================================================

/**
 * Validate Chilean address
 */
export const validateChileanAddress = (address: string): ValidationResult => {
  const trimmed = address.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'La dirección es requerida'
    };
  }

  if (trimmed.length < 5) {
    return {
      isValid: false,
      error: 'La dirección debe tener al menos 5 caracteres'
    };
  }

  if (trimmed.length > 200) {
    return {
      isValid: false,
      error: 'La dirección no puede tener más de 200 caracteres'
    };
  }

  // Basic pattern for Chilean addresses
  const addressPattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ0-9\s\.,#°º'-]+$/;
  if (!addressPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'La dirección contiene caracteres no válidos'
    };
  }

  return {
    isValid: true,
    sanitized: trimmed
  };
};

// =============================================================================
// GENERAL PURPOSE VALIDATION
// =============================================================================

/**
 * Sanitize general input (prevent XSS)
 */
export const sanitizeInput = (input: string, type: 'text' | 'email' | 'phone' = 'text'): string => {
  let sanitized = input.trim();

  // Basic XSS prevention
  sanitized = sanitized
    .replace(/[<>\"']/g, '') // Remove potential HTML chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, ''); // Remove data: protocol

  switch (type) {
    case 'email':
      return sanitized.toLowerCase();
    case 'phone':
      return sanitized.replace(/[^+\d]/g, ''); // Only + and digits
    case 'text':
    default:
      return sanitized.replace(/[\x00-\x1F\x7F]/g, ''); // Remove control chars
  }
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: `${fieldName} es requerido`
    };
  }

  return {
    isValid: true,
    sanitized: trimmed
  };
};

/**
 * Validate string length
 */
export const validateLength = (
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): ValidationResult => {
  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} debe tener al menos ${minLength} caracteres`
    };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} no puede tener más de ${maxLength} caracteres`
    };
  }

  return {
    isValid: true,
    sanitized: trimmed
  };
};

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export const ChileanValidation = {
  rut: validateChileanRUT,
  name: validateChileanName,
  email: validateEmail,
  phone: validateChileanPhone,
  bankAccount: validateChileanBankAccount,
  address: validateChileanAddress,
  required: validateRequired,
  length: validateLength,
  sanitize: sanitizeInput,
  formatRUT,
  formatChileanPhone,
};