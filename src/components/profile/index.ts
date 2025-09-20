// =============================================================================
// PROFILE COMPONENTS - COMPREHENSIVE EXPORT INDEX
// Epic #2: Profile Management - Component Integration
// =============================================================================
// Central export point for all customer profile management components
// Provides consistent access to all profile-related functionality
// Author: Frontend UI Expert
// Created: 2025-09-19

// =============================================================================
// PROFILE MANAGEMENT COMPONENTS
// =============================================================================

export { default as AddressManager } from './AddressManager';
export type { ManitoAddress } from './AddressManager';

export { default as PaymentMethodManager } from './PaymentMethodManager';
export type { PaymentMethod } from './PaymentMethodManager';

export { default as JobHistoryList } from './JobHistoryList';
export type { JobBooking } from './JobHistoryList';

export { default as ReviewForm } from './ReviewForm';
export type { ReviewData } from './ReviewForm';

// =============================================================================
// PROFILE SCREENS
// =============================================================================

export { CustomerProfileScreen } from '../../screens/profile/CustomerProfileScreen';

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

// Chilean validation utilities
export {
  validateChileanRUT,
  validateChileanName,
  validateEmail,
  validateChileanPhone,
  validateChileanBankAccount,
  validateChileanAddress,
  formatRUT,
  formatChileanPhone,
  ChileanValidation,
} from '../../utils/chileanValidation';

// Storage helpers
export {
  uploadProfileImage,
  uploadReviewImage,
  uploadPortfolioImage,
  uploadVerificationDocument,
} from '../../services/profileStorageHelpers';

// Chilean banking data
export {
  CHILEAN_BANKS,
  getBankByCode,
  getActiveBanks,
  getBanksWithTransfers,
  getBanksWithOnlinePayments,
  searchBanks,
  getPopularBanks,
  isValidBankCode,
  formatBankDisplayName,
  getBankTypeLabel,
  getBankAccountValidation,
} from '../../data/chileanBanks';
export type { ChileanBank } from '../../data/chileanBanks';

// =============================================================================
// COMPONENT COLLECTIONS
// =============================================================================

/**
 * All customer profile management components
 */
export const ProfileComponents = {
  AddressManager,
  PaymentMethodManager,
  JobHistoryList,
  ReviewForm,
  CustomerProfileScreen,
};

/**
 * All validation utilities for Chilean market
 */
export const ChileanValidationUtils = {
  validateRUT: validateChileanRUT,
  validateName: validateChileanName,
  validateEmail,
  validatePhone: validateChileanPhone,
  validateBankAccount: validateChileanBankAccount,
  validateAddress: validateChileanAddress,
  formatRUT,
  formatPhone: formatChileanPhone,
};

/**
 * All storage and upload utilities
 */
export const StorageUtils = {
  uploadProfileImage,
  uploadReviewImage,
  uploadPortfolioImage,
  uploadVerificationDocument,
};

/**
 * All Chilean banking utilities
 */
export const BankingUtils = {
  banks: CHILEAN_BANKS,
  getBankByCode,
  getActiveBanks,
  getBanksWithTransfers,
  getBanksWithOnlinePayments,
  searchBanks,
  getPopularBanks,
  isValidBankCode,
  formatBankDisplayName,
  getBankTypeLabel,
  getBankAccountValidation,
};

// =============================================================================
// ENTERPRISE PATTERNS DOCUMENTATION
// =============================================================================

/**
 * Usage Example for Customer Profile Management:
 *
 * ```typescript
 * import {
 *   CustomerProfileScreen,
 *   AddressManager,
 *   PaymentMethodManager,
 *   JobHistoryList,
 *   ReviewForm,
 *   ChileanValidationUtils,
 *   StorageUtils
 * } from './components/profile';
 *
 * // Use components with enterprise auth hooks
 * const MyProfileScreen = () => {
 *   const { user, isAuthenticated } = useEnterpriseAuth();
 *   const { profile } = useProfileData();
 *
 *   return (
 *     <CustomerProfileScreen />
 *   );
 * };
 *
 * // Validate Chilean data
 * const isValidRUT = ChileanValidationUtils.validateRUT(rutValue).isValid;
 *
 * // Upload profile images
 * const uploadResult = await StorageUtils.uploadProfileImage({
 *   imageUri: 'file://...',
 *   userId: user.id
 * });
 * ```
 */

export default {
  ProfileComponents,
  ChileanValidationUtils,
  StorageUtils,
  BankingUtils,
};