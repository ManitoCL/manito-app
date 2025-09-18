/**
 * Manito Design System Tokens
 * Enterprise-level design foundation with Chilean market adaptation
 */

// Manito Enterprise Brand Colors - Chilean Heritage meets Global Trust
export const colors = {
  // Primary - Manito Deep Blue (inspired by Chilean Pacific + trust)
  primary: {
    50: '#f0f8ff',
    100: '#e0f0fe',
    200: '#bae0fd',
    300: '#7cc7fb',
    400: '#36a9f7',
    500: '#0c7bb3', // Main Manito blue - distinctive and trustworthy
    600: '#0a6896',
    700: '#0b5477',
    800: '#0f4763',
    900: '#133d53',
  },

  // Secondary - Manito Copper (Chilean heritage + premium)
  secondary: {
    50: '#fef9f3',
    100: '#fef0e6',
    200: '#fcdcc7',
    300: '#f9c2a3',
    400: '#f59f7d',
    500: '#d97545', // Refined copper - sophisticated yet warm
    600: '#c4622c',
    700: '#a44e23',
    800: '#863f20',
    900: '#6e3520',
  },

  // Success - Manito Green (trust + verification + Chilean nature)
  success: {
    50: '#f0fdf8',
    100: '#dcfcec',
    200: '#bbf7d8',
    300: '#86efb6',
    400: '#4ade88',
    500: '#059669', // Strong verification green
    600: '#047857',
    700: '#065f46',
    800: '#064e3b',
    900: '#064e3b',
  },

  // Warning - Manito Amber (attention + Chilean sun)
  warning: {
    50: '#fffcf0',
    100: '#fef6e0',
    200: '#fdecc2',
    300: '#fbdd97',
    400: '#f8c765',
    500: '#e6a834', // Professional amber for warnings
    600: '#d1892a',
    700: '#ae6b24',
    800: '#8f5724',
    900: '#764921',
  },

  // Error - Manito Red (urgency + Chilean flag heritage)
  error: {
    50: '#fef3f2',
    100: '#fee5e2',
    200: '#fecdc7',
    300: '#fcaaa4',
    400: '#f87b73',
    500: '#dc3626', // Sophisticated error red
    600: '#c42f20',
    700: '#a3261c',
    800: '#86241c',
    900: '#70241c',
  },

  // Neutrals - Professional grayscale
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Semantic colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  },

  surface: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    elevated: '#ffffff',
  },

  text: {
    primary: '#111827',
    secondary: '#374151',
    tertiary: '#6b7280',
    inverse: '#ffffff',
  },

  border: {
    primary: '#e5e7eb',
    secondary: '#d1d5db',
    focus: '#1d4ed8',
  },
};

// Manito Typography System - Enterprise & Distinctive
export const typography = {
  // Font families - Professional but distinctive
  fontFamily: {
    display: ['SF Pro Display', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'], // For headlines and branding
    sans: ['SF Pro Text', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'], // For body text
    mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
  },

  // Font weights - Expanded range for brand hierarchy
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900', // For brand emphasis
  },

  // Font sizes with line heights
  fontSize: {
    xs: { size: 12, lineHeight: 16 },
    sm: { size: 14, lineHeight: 20 },
    base: { size: 16, lineHeight: 24 },
    lg: { size: 18, lineHeight: 28 },
    xl: { size: 20, lineHeight: 28 },
    '2xl': { size: 24, lineHeight: 32 },
    '3xl': { size: 30, lineHeight: 36 },
    '4xl': { size: 36, lineHeight: 40 },
    '5xl': { size: 48, lineHeight: 52 },
    '6xl': { size: 60, lineHeight: 64 },
    '7xl': { size: 72, lineHeight: 76 },
  },

  // Letter spacing (React Native uses numeric values, not CSS units)
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
};

// Spacing system (8pt grid)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

// Shadows (elevation system)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 16,
  },
};

// Animation durations
export const animations = {
  duration: {
    fastest: 150,
    fast: 200,
    normal: 300,
    slow: 500,
    slowest: 800,
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Mobile-first responsive breakpoints
export const breakpoints = {
  xs: 375,  // iPhone SE
  sm: 640,  // Large phones
  md: 768,  // Tablets
  lg: 1024, // Small laptops
  xl: 1280, // Desktop
  '2xl': 1536, // Large desktop
};

// Responsive utilities for mobile-first design
export const responsive = {
  // Mobile spacing (tighter for small screens)
  mobile: {
    padding: {
      xs: spacing[3],
      sm: spacing[4],
      md: spacing[5],
      lg: spacing[6],
    },
    fontSize: {
      hero: typography.fontSize['3xl'].size,
      title: typography.fontSize['2xl'].size,
      subtitle: typography.fontSize.lg.size,
      body: typography.fontSize.base.size,
    },
  },

  // Tablet spacing (medium)
  tablet: {
    padding: {
      xs: spacing[4],
      sm: spacing[5],
      md: spacing[6],
      lg: spacing[8],
    },
    fontSize: {
      hero: typography.fontSize['4xl'].size,
      title: typography.fontSize['3xl'].size,
      subtitle: typography.fontSize.xl.size,
      body: typography.fontSize.lg.size,
    },
  },

  // Desktop spacing (spacious)
  desktop: {
    padding: {
      xs: spacing[5],
      sm: spacing[6],
      md: spacing[8],
      lg: spacing[12],
    },
    fontSize: {
      hero: typography.fontSize['5xl'].size,
      title: typography.fontSize['4xl'].size,
      subtitle: typography.fontSize['2xl'].size,
      body: typography.fontSize.xl.size,
    },
  },
};

// Manito Brand Identity System
export const manitoBrand = {
  // Brand mark and visual identity
  identity: {
    logoMark: '𝐌', // Distinctive 'M' for Manito
    brandMark: '◆', // Diamond shape representing trust and quality
    checkMark: '✓', // Custom verification symbol
    trustBadge: '🛡️', // Shield for security/trust
  },

  // Brand gradients
  gradients: {
    primary: ['#0c7bb3', '#0a6896'],
    secondary: ['#d97545', '#c4622c'],
    trust: ['#059669', '#047857'],
    premium: ['#0c7bb3', '#d97545'],
    heroBackground: ['#0c7bb3', '#0b5477', '#133d53'],
  },

  // Distinctive visual patterns
  patterns: {
    trustDots: '••••', // Four dots representing verification steps
    securityPattern: '⬢⬡⬢', // Hexagonal pattern for security
    chileanFlag: '🇨🇱', // Chilean flag when appropriate
  },

  // Enterprise messaging
  messaging: {
    tagline: 'Confianza. Calidad. Chile.',
    shortTagline: 'Tu hogar, nuestros expertos',
    trustStatement: 'Verificados por ley chilena',
    securityPromise: 'Pagos seguros garantizados',
  },
};

// Chilean-specific constants
export const chileanConstants = {
  // RUT validation pattern
  rutPattern: /^[0-9]+-[0-9kK]{1}$/,

  // Phone number format
  phonePattern: /^(\+56)?[2-9][0-9]{8}$/,

  // Common Chilean regions for service coverage
  regions: [
    'Región Metropolitana',
    'Región de Valparaíso',
    'Región del Biobío',
    'Región de La Araucanía',
    'Región de Los Lagos',
  ],

  // Payment methods popular in Chile
  paymentMethods: [
    'Transbank Webpay',
    'MercadoPago',
    'Khipu',
    'Flow',
    'Banco Estado',
  ],

  // Trust certifications
  certifications: [
    'SERNAC Certified',
    'Transbank Partner',
    'SII Compliant',
    'Data Protection Act',
  ],
};

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56,
    },
    padding: {
      sm: { horizontal: 12, vertical: 6 },
      md: { horizontal: 16, vertical: 8 },
      lg: { horizontal: 20, vertical: 12 },
      xl: { horizontal: 24, vertical: 16 },
    },
  },

  input: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    padding: {
      horizontal: 12,
      vertical: 8,
    },
  },

  card: {
    padding: {
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
    },
  },
};