/**
 * Chilean Market Components Index
 *
 * Centralized exports for all Chilean-specific components and utilities
 */

// RUT Components and Utilities
export { RutInput, ContextualRutInput } from './RutInput';
export {
  validateRut,
  validateAndFormatRut,
  calculateRutVerificationDigit,
  formatCompleteRut,
  validateRutByContext,
  RUT_VALIDATION_RULES,
  type RutValidationResult
} from '../utils/chilean/rutValidation';

// Phone Components and Utilities
export { PhoneInput, SMSPhoneInput, WhatsAppPhoneInput } from './PhoneInput';
export {
  validateChileanPhone,
  validateAndFormatChileanPhone,
  validatePhoneByContext,
  formatChileanPhone,
  getPhoneInfo,
  PHONE_VALIDATION_RULES,
  CHILEAN_CARRIERS,
  type PhoneValidationResult
} from '../utils/chilean/phoneValidation';

// Address Components and Utilities
export { AddressInput, ComunaSelector } from './AddressInput';
export {
  formatAddress,
  getFullAddress,
  isPremiumComuna,
  isPopularServiceArea,
  searchComunas,
  getComunasByRegion,
  getComunasByProvince,
  getRegionByCode,
  CHILEAN_REGIONS,
  PREMIUM_COMUNAS,
  POPULAR_SERVICE_AREAS,
  type ChileanAddress,
  type Comuna,
  type Province,
  type Region
} from '../utils/chilean/addressData';