/**
 * Chilean-specific utility functions for Manito marketplace
 * Following frontend-ui-expert principles for Chilean market adaptation
 */

// Chilean phone number validation and formatting
export const formatChileanPhone = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle different input formats
  let cleanDigits = digits;
  
  // If starts with 56, remove country code for formatting
  if (digits.startsWith('56') && digits.length >= 10) {
    cleanDigits = digits.substring(2);
  }
  
  // If starts with 9 and has 9 digits, format as Chilean mobile
  if (cleanDigits.startsWith('9') && cleanDigits.length === 9) {
    return `+56 ${cleanDigits.substring(0, 1)} ${cleanDigits.substring(1, 5)} ${cleanDigits.substring(5)}`;
  }
  
  // If has 8 digits, assume landline
  if (cleanDigits.length === 8) {
    return `+56 ${cleanDigits.substring(0, 1)} ${cleanDigits.substring(1, 4)} ${cleanDigits.substring(4)}`;
  }
  
  return phone; // Return original if can't format
};

export const validateChileanPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  
  // Mobile: +56 9 XXXX XXXX (9 digits starting with 9)
  // Landline: +56 X XXXX XXXX (8 digits)
  
  if (digits.startsWith('56')) {
    const localNumber = digits.substring(2);
    return (localNumber.startsWith('9') && localNumber.length === 9) || 
           (localNumber.length === 8);
  }
  
  // Direct Chilean number
  return (digits.startsWith('9') && digits.length === 9) || 
         (digits.length === 8);
};

export const getChileanPhoneForAuth = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('56')) {
    return `+${digits}`;
  }
  
  return `+56${digits}`;
};

// RUT validation and formatting
export const formatRUT = (rut: string): string => {
  // Remove all non-alphanumeric characters
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (clean.length <= 1) return clean;
  
  // Separate number and check digit
  const number = clean.slice(0, -1);
  const checkDigit = clean.slice(-1);
  
  // Format with dots and dash
  let formatted = '';
  for (let i = number.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      formatted = '.' + formatted;
    }
    formatted = number[i] + formatted;
  }
  
  return `${formatted}-${checkDigit}`;
};

export const validateRUT = (rut: string): boolean => {
  // Remove formatting
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (clean.length < 8 || clean.length > 9) return false;
  
  const number = clean.slice(0, -1);
  const checkDigit = clean.slice(-1);
  
  // Calculate check digit
  let sum = 0;
  let multiplier = 2;
  
  for (let i = number.length - 1; i >= 0; i--) {
    sum += parseInt(number[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const calculatedCheck = 11 - (sum % 11);
  let expectedCheck: string;
  
  if (calculatedCheck === 11) {
    expectedCheck = '0';
  } else if (calculatedCheck === 10) {
    expectedCheck = 'K';
  } else {
    expectedCheck = calculatedCheck.toString();
  }
  
  return checkDigit === expectedCheck;
};

// Chilean regions for service areas
export const CHILEAN_REGIONS = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana de Santiago',
  'Libertador General Bernardo O\'Higgins',
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén del General Carlos Ibáñez del Campo',
  'Magallanes y de la Antártica Chilena'
];

// Chilean service categories
export const CHILEAN_SERVICES = [
  'Electricista',
  'Gasfitero',
  'Técnico en Refrigeración',
  'Cerrajero',
  'Jardinero',
  'Limpieza del Hogar',
  'Pintor',
  'Carpintero',
  'Técnico en Lavadoras',
  'Instalador de TV y Audio',
  'Fumigador',
  'Técnico en Calefont',
  'Soldador',
  'Albañil',
  'Tapicero',
  'Técnico en Portones Automáticos',
  'Instalador de Pisos',
  'Técnico en Alarmas'
];

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};