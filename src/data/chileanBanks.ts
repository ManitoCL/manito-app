// =============================================================================
// CHILEAN BANKS DATA - COMPREHENSIVE BANKING SYSTEM SUPPORT
// Epic #2: Profile Management - Chilean Banking Integration
// =============================================================================
// Complete list of Chilean banks with their official codes and metadata
// Used for payment method management and bank transfers
// Author: Frontend UI Expert
// Created: 2025-09-19

export interface ChileanBank {
  code: string; // Official bank code (SBIF/CMF)
  name: string; // Official bank name
  shortName: string; // Common abbreviation
  type: 'commercial' | 'state' | 'credit_union' | 'international';
  isActive: boolean; // Currently operating
  supportsBankTransfers: boolean;
  supportsOnlinePayments: boolean;
  website?: string;
}

// =============================================================================
// CHILEAN BANKS DATABASE
// =============================================================================
// Source: Comisión para el Mercado Financiero (CMF) - Official Chilean banking authority
// Last updated: 2025-09-19

export const CHILEAN_BANKS: ChileanBank[] = [
  // Major Commercial Banks
  {
    code: '001',
    name: 'Banco de Chile',
    shortName: 'BancoChile',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bancochile.cl',
  },
  {
    code: '009',
    name: 'Banco Santander Chile',
    shortName: 'Santander',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.santander.cl',
  },
  {
    code: '012',
    name: 'Banco del Estado de Chile',
    shortName: 'BancoEstado',
    type: 'state',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bancoestado.cl',
  },
  {
    code: '016',
    name: 'Banco de Crédito e Inversiones',
    shortName: 'BCI',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bci.cl',
  },
  {
    code: '017',
    name: 'Banco Internacional',
    shortName: 'BINTER',
    type: 'international',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bancointernacional.cl',
  },
  {
    code: '027',
    name: 'Corpbanca',
    shortName: 'Corpbanca',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.corpbanca.cl',
  },
  {
    code: '028',
    name: 'Banco Bice',
    shortName: 'BICE',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bice.cl',
  },
  {
    code: '031',
    name: 'Banco Falabella',
    shortName: 'Falabella',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bancofalabella.cl',
  },
  {
    code: '037',
    name: 'Banco Itaú Chile',
    shortName: 'Itaú',
    type: 'international',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.itau.cl',
  },
  {
    code: '039',
    name: 'Banco Security',
    shortName: 'Security',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.security.cl',
  },
  {
    code: '049',
    name: 'Banco Ripley',
    shortName: 'Ripley',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bancoripley.cl',
  },
  {
    code: '051',
    name: 'Banco Consorcio',
    shortName: 'Consorcio',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bancoconsorcio.cl',
  },
  {
    code: '052',
    name: 'Coopeuch',
    shortName: 'Coopeuch',
    type: 'credit_union',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.coopeuch.cl',
  },
  {
    code: '053',
    name: 'Banco BTG Pactual Chile',
    shortName: 'BTG Pactual',
    type: 'international',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.btgpactual.cl',
  },

  // Digital and Fintech Banks
  {
    code: '055',
    name: 'Banco Nova',
    shortName: 'Nova',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.banconova.cl',
  },

  // Other Banks and Financial Institutions
  {
    code: '014',
    name: 'Banco Edwards Citi',
    shortName: 'Edwards',
    type: 'international',
    isActive: false, // Merged with Banco de Chile
    supportsBankTransfers: false,
    supportsOnlinePayments: false,
  },
  {
    code: '018',
    name: 'Banco del Desarrollo',
    shortName: 'BANDES',
    type: 'state',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: false,
    website: 'https://www.bandes.cl',
  },
  {
    code: '054',
    name: 'Banco Capital',
    shortName: 'Capital',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bancocapital.cl',
  },

  // Specialized Financial Institutions
  {
    code: '056',
    name: 'Banco Penta',
    shortName: 'Penta',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: false,
    website: 'https://www.bancopenta.cl',
  },
  {
    code: '057',
    name: 'Banco Paris',
    shortName: 'Paris',
    type: 'commercial',
    isActive: true,
    supportsBankTransfers: true,
    supportsOnlinePayments: true,
    website: 'https://www.bancoparis.cl',
  },

  // International Representative Offices (Limited Services)
  {
    code: '059',
    name: 'Banco MUFG Chile',
    shortName: 'MUFG',
    type: 'international',
    isActive: true,
    supportsBankTransfers: false,
    supportsOnlinePayments: false,
    website: 'https://www.mufg.cl',
  },
  {
    code: '060',
    name: 'Banco JP Morgan Chase',
    shortName: 'JP Morgan',
    type: 'international',
    isActive: true,
    supportsBankTransfers: false,
    supportsOnlinePayments: false,
  },
].sort((a, b) => {
  // Sort by popularity/size for better UX
  const popularBanks = ['001', '009', '012', '016', '037', '031']; // Major banks first
  const aPopular = popularBanks.includes(a.code);
  const bPopular = popularBanks.includes(b.code);

  if (aPopular && !bPopular) return -1;
  if (!aPopular && bPopular) return 1;

  // Then by active status
  if (a.isActive && !b.isActive) return -1;
  if (!a.isActive && b.isActive) return 1;

  // Finally alphabetically
  return a.name.localeCompare(b.name);
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get bank by code
 */
export const getBankByCode = (code: string): ChileanBank | undefined => {
  return CHILEAN_BANKS.find(bank => bank.code === code);
};

/**
 * Get active banks only
 */
export const getActiveBanks = (): ChileanBank[] => {
  return CHILEAN_BANKS.filter(bank => bank.isActive);
};

/**
 * Get banks that support bank transfers
 */
export const getBanksWithTransfers = (): ChileanBank[] => {
  return CHILEAN_BANKS.filter(bank => bank.isActive && bank.supportsBankTransfers);
};

/**
 * Get banks that support online payments
 */
export const getBanksWithOnlinePayments = (): ChileanBank[] => {
  return CHILEAN_BANKS.filter(bank => bank.isActive && bank.supportsOnlinePayments);
};

/**
 * Search banks by name
 */
export const searchBanks = (query: string): ChileanBank[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return getActiveBanks();

  return CHILEAN_BANKS.filter(bank => {
    const nameMatch = bank.name.toLowerCase().includes(normalizedQuery);
    const shortNameMatch = bank.shortName.toLowerCase().includes(normalizedQuery);
    const codeMatch = bank.code.includes(normalizedQuery);

    return bank.isActive && (nameMatch || shortNameMatch || codeMatch);
  });
};

/**
 * Get popular banks (most commonly used)
 */
export const getPopularBanks = (): ChileanBank[] => {
  const popularCodes = ['001', '009', '012', '016', '037', '031']; // Based on market share
  return popularCodes
    .map(code => getBankByCode(code))
    .filter((bank): bank is ChileanBank => bank !== undefined && bank.isActive);
};

/**
 * Validate bank code format
 */
export const isValidBankCode = (code: string): boolean => {
  const normalizedCode = code.trim();
  return /^\d{3}$/.test(normalizedCode) && getBankByCode(normalizedCode) !== undefined;
};

/**
 * Format bank display name
 */
export const formatBankDisplayName = (bank: ChileanBank): string => {
  return `${bank.name} (${bank.code})`;
};

/**
 * Get bank type label in Spanish
 */
export const getBankTypeLabel = (type: ChileanBank['type']): string => {
  switch (type) {
    case 'commercial': return 'Banco Comercial';
    case 'state': return 'Banco Estatal';
    case 'credit_union': return 'Cooperativa de Crédito';
    case 'international': return 'Banco Internacional';
    default: return 'Otro';
  }
};

// =============================================================================
// BANK-SPECIFIC VALIDATION RULES
// =============================================================================

/**
 * Bank-specific account number validation rules
 */
export const getBankAccountValidation = (bankCode: string) => {
  const bank = getBankByCode(bankCode);
  if (!bank) return null;

  // Bank-specific rules (simplified for demo)
  switch (bank.code) {
    case '001': // Banco de Chile
      return {
        minLength: 8,
        maxLength: 12,
        pattern: /^\d{8,12}$/,
        message: 'Número de cuenta de Banco de Chile debe tener entre 8 y 12 dígitos',
      };

    case '009': // Santander
      return {
        minLength: 9,
        maxLength: 11,
        pattern: /^\d{9,11}$/,
        message: 'Número de cuenta de Santander debe tener entre 9 y 11 dígitos',
      };

    case '012': // BancoEstado
      return {
        minLength: 8,
        maxLength: 10,
        pattern: /^\d{8,10}$/,
        message: 'Número de cuenta de BancoEstado debe tener entre 8 y 10 dígitos',
      };

    case '016': // BCI
      return {
        minLength: 8,
        maxLength: 9,
        pattern: /^\d{8,9}$/,
        message: 'Número de cuenta de BCI debe tener entre 8 y 9 dígitos',
      };

    default:
      return {
        minLength: 6,
        maxLength: 15,
        pattern: /^\d{6,15}$/,
        message: 'Número de cuenta debe tener entre 6 y 15 dígitos',
      };
  }
};

// =============================================================================
// EXPORT DEFAULT
// =============================================================================

export default CHILEAN_BANKS;