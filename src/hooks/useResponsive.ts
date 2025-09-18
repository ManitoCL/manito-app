/**
 * Mobile-first responsive design hook for Manito
 * Optimized for Chilean mobile users
 */

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { breakpoints, responsive } from '../design/tokens';

interface ResponsiveConfig {
  isXS: boolean;
  isSM: boolean;
  isMD: boolean;
  isLG: boolean;
  isXL: boolean;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  spacing: typeof responsive.mobile.padding;
  fontSize: typeof responsive.mobile.fontSize;
}

export const useResponsive = (): ResponsiveConfig => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const width = dimensions.width;
  const height = dimensions.height;

  // Mobile-first breakpoint detection
  const isXS = width < breakpoints.sm;
  const isSM = width >= breakpoints.sm && width < breakpoints.md;
  const isMD = width >= breakpoints.md && width < breakpoints.lg;
  const isLG = width >= breakpoints.lg && width < breakpoints.xl;
  const isXL = width >= breakpoints.xl;

  // Device type detection
  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;

  // Get appropriate spacing and fonts for device
  const getResponsiveConfig = () => {
    if (isMobile) {
      return {
        spacing: responsive.mobile.padding,
        fontSize: responsive.mobile.fontSize,
      };
    } else if (isTablet) {
      return {
        spacing: responsive.tablet.padding,
        fontSize: responsive.tablet.fontSize,
      };
    } else {
      return {
        spacing: responsive.desktop.padding,
        fontSize: responsive.desktop.fontSize,
      };
    }
  };

  const config = getResponsiveConfig();

  return {
    isXS,
    isSM,
    isMD,
    isLG,
    isXL,
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    spacing: config.spacing,
    fontSize: config.fontSize,
  };
};

// Utility function for responsive values
export const useResponsiveValue = <T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T => {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) return values.mobile;
  if (isTablet) return values.tablet || values.mobile;
  return values.desktop || values.tablet || values.mobile;
};