/**
 * Manito Design System
 * Professional, trustworthy design system for Chilean home services marketplace
 * 
 * Key Design Principles:
 * - Trust and credibility focused
 * - Chilean market appropriate
 * - Mobile-first responsive
 * - Accessibility compliant
 * - Professional service quality
 */

// Manito Brand Colors - Exact Brand Guidelines
export const colors = {
  // Primary Brand Colors - Deep Navy (trustworthy, solid)
  primary: {
    50: '#F0F4F8',
    100: '#D9E6F2',
    200: '#B3CCE6',
    300: '#8DB3D9',
    400: '#6699CC',
    500: '#052A4A', // Main brand navy
    600: '#041F37',
    700: '#031624',
    800: '#020D12',
    900: '#010407',
  },
  
  // Secondary Colors - Bright Yellow (energy, visibility, friendliness)
  secondary: {
    50: '#FFFEF0',
    100: '#FFFBD9',
    200: '#FFF8B3',
    300: '#FFF48D',
    400: '#FFF066',
    500: '#FFD400', // Main brand yellow
    600: '#E6BF00',
    700: '#CCAA00',
    800: '#B39500',
    900: '#998000',
  },
  
  // Accent Colors - Sky Blue (techy, supportive)
  accent: {
    skyBlue: '#2B8ED6',    // Sky blue accent
    success: '#16A34A',    // Success green
    error: '#E53935',      // Danger red
    warning: '#FFD400',    // Warning yellow (same as secondary)
    amber: '#FFD400',      // Ratings/highlights (same as secondary)
  },
  
  // Neutral Colors - Professional grays
  neutral: {
    50: '#F7FAFC',   // Light gray background
    100: '#F1F5F9',  // Light background
    200: '#E2E8F0',  // Border light
    300: '#CBD5E1',  // Border
    400: '#94A3B8',  // Border dark
    500: '#64748B',  // Text light
    600: '#475569',  // Text medium
    700: '#334155',  // Text dark
    800: '#1E293B',  // Text darker
    900: '#0F172A',  // Text darkest
    950: '#020617',  // Pure dark
  },
  
  // Semantic Colors - Manito Brand
  semantic: {
    background: '#FFFFFF',
    surface: '#F7FAFC',
    surfaceVariant: '#F1F5F9',
    onSurface: '#0F172A',
    onSurfaceVariant: '#475569',
    outline: '#E2E8F0',
    outlineVariant: '#F1F5F9',
  },
  
  // Chilean Market Specific
  chilean: {
    // Colors that resonate with Chilean culture
    copper: '#B87333',     // Chile's copper heritage
    andeanBlue: '#4A90A4', // Andes mountains
    pacificBlue: '#006994', // Pacific ocean
    wine: '#722F37',       // Chilean wine
  },
  
  // Status Colors for Marketplace
  status: {
    verified: '#16A34A',    // Green for verified providers
    pending: '#FFD400',     // Yellow for pending
    available: '#16A34A',   // Green for available
    busy: '#E53935',        // Red for busy/unavailable
    escrow: '#2B8ED6',      // Sky blue for escrow payments
  },

  // Success/Error Colors - Manito Brand
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#16A34A', // Manito success green
    600: '#15803D',
    700: '#166534',
    800: '#14532D',
    900: '#052E16',
  },

  warning: {
    50: '#FFFEF0',
    100: '#FFFBD9',
    200: '#FFF8B3',
    300: '#FFF48D',
    400: '#FFF066',
    500: '#FFD400', // Manito warning yellow
    600: '#E6BF00',
    700: '#CCAA00',
    800: '#B39500',
    900: '#998000',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#E53935', // Manito error red
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  }
};

// Typography System - Manito Brand
export const typography = {
  // Font Families - Manito Brand Guidelines (using system fonts for now)
  fontFamily: {
    heading: 'System', // System default font
    body: 'System',    // System default font
    mono: 'monospace', // System monospace
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Font Sizes - Responsive scale
  fontSize: {
    xs: 12,    // Captions, small labels
    sm: 14,    // Body text, form labels
    base: 16,  // Base body text
    lg: 18,    // Large body text
    xl: 20,    // Small headings
    '2xl': 24, // Medium headings
    '3xl': 28, // Large headings
    '4xl': 32, // Extra large headings
    '5xl': 36, // Display headings
    '6xl': 48, // Hero headings
  },
  
  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.3,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.6,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
};

// Spacing System - 8pt grid
export const spacing = {
  0: 0,
  1: 4,    // 0.25rem
  2: 8,    // 0.5rem
  3: 12,   // 0.75rem
  4: 16,   // 1rem
  5: 20,   // 1.25rem
  6: 24,   // 1.5rem
  7: 28,   // 1.75rem
  8: 32,   // 2rem
  10: 40,  // 2.5rem
  12: 48,  // 3rem
  16: 64,  // 4rem
  20: 80,  // 5rem
  24: 96,  // 6rem
  32: 128, // 8rem
  40: 160, // 10rem
  48: 192, // 12rem
  56: 224, // 14rem
  64: 256, // 16rem
};

// Border Radius System - Manito Brand (10-14px for cards, 50% pill for chips)
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 6,
  md: 8,
  lg: 10,    // Cards - 10px
  xl: 12,    // Cards - 12px
  '2xl': 14,  // Cards - 14px
  '3xl': 18,
  '4xl': 24,
  full: 9999, // Pills - 50%
};

// Shadow System - Manito Brand (soft shadows for depth, not harsh)
export const shadows = {
  // Soft shadows for Manito brand
  xs: {
    shadowColor: '#052A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#052A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  base: {
    shadowColor: '#052A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#052A4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#052A4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#052A4A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
};

// Component Variants - Manito Brand
export const components = {
  // Button variants - Following Manito brand guidelines
  button: {
    // Primary → navy background, white text, strong shadow
    primary: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.xl,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
      ...shadows.md, // Strong shadow
    },
    // Secondary/Accent → yellow background, navy text
    secondary: {
      backgroundColor: colors.secondary[500],
      borderRadius: borderRadius.xl,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
      ...shadows.sm,
    },
    // Success → green background
    success: {
      backgroundColor: colors.accent.success,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
      ...shadows.sm,
    },
    // Ghost → transparent with navy border
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary[500],
      borderRadius: borderRadius.xl,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
    },
  },
  
  // Card variants - Manito Brand (rounded corners 10-14px, soft shadows)
  card: {
    default: {
      backgroundColor: colors.semantic.background,
      borderRadius: borderRadius.xl,  // 12px
      padding: spacing[4],
      ...shadows.base, // Soft shadow
    },
    elevated: {
      backgroundColor: colors.semantic.background,
      borderRadius: borderRadius['2xl'], // 14px
      padding: spacing[6],
      ...shadows.lg, // Larger soft shadow
    },
    outlined: {
      backgroundColor: colors.semantic.background,
      borderRadius: borderRadius.xl, // 12px
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
  },
  
  // Input variants
  input: {
    default: {
      borderWidth: 1,
      borderColor: colors.neutral[300],
      borderRadius: borderRadius.md,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      fontSize: typography.fontSize.base,
      backgroundColor: colors.semantic.background,
    },
    focused: {
      borderColor: colors.primary[500],
      borderWidth: 2,
    },
    error: {
      borderColor: colors.accent.error,
      borderWidth: 2,
    },
  },
};

// Marketplace Specific Styles
export const marketplace = {
  // Provider verification indicators
  verification: {
    verified: {
      backgroundColor: colors.status.verified,
      color: colors.semantic.background,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    },
    pending: {
      backgroundColor: colors.status.pending,
      color: colors.semantic.background,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    },
  },
  
  // Rating styles
  rating: {
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing[1],
    },
    star: {
      color: colors.accent.amber,
      fontSize: typography.fontSize.sm,
    },
    text: {
      color: colors.neutral[600],
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
  },
  
  // Service category styles
  serviceCategory: {
    icon: {
      fontSize: typography.fontSize['2xl'],
      marginBottom: spacing[2],
    },
    name: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.neutral[800],
      textAlign: 'center' as const,
    },
  },
};




// Animation values
export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Export all theme values
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  marketplace,
  animation,
  breakpoints,
};

export default theme;