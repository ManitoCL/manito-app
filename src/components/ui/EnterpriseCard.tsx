/**
 * Enterprise-level Card Component
 * Professional design with advanced shadow system and accessibility
 */

import React from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../design/tokens';

export interface EnterpriseCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive' | 'feature';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'primary' | 'secondary' | 'white' | 'gradient';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export const EnterpriseCard: React.FC<EnterpriseCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'md',
  radius = 'md',
  background = 'white',
  border = false,
  shadow,
  disabled = false,
  accessibilityLabel,
  testID,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
    };

    // Background
    switch (background) {
      case 'primary':
        baseStyle.backgroundColor = colors.primary[50];
        break;
      case 'secondary':
        baseStyle.backgroundColor = colors.background.secondary;
        break;
      case 'gradient':
        baseStyle.backgroundColor = colors.primary[500];
        break;
      default:
        baseStyle.backgroundColor = colors.surface.primary;
    }

    // Padding
    switch (padding) {
      case 'none':
        break;
      case 'xs':
        baseStyle.padding = spacing[2];
        break;
      case 'sm':
        baseStyle.padding = spacing[3];
        break;
      case 'lg':
        baseStyle.padding = spacing[6];
        break;
      case 'xl':
        baseStyle.padding = spacing[8];
        break;
      default: // md
        baseStyle.padding = spacing[4];
    }

    // Border radius
    switch (radius) {
      case 'none':
        baseStyle.borderRadius = 0;
        break;
      case 'sm':
        baseStyle.borderRadius = borderRadius.sm;
        break;
      case 'lg':
        baseStyle.borderRadius = borderRadius.lg;
        break;
      case 'xl':
        baseStyle.borderRadius = borderRadius.xl;
        break;
      default: // md
        baseStyle.borderRadius = borderRadius.md;
    }

    // Border
    if (border) {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = colors.border.primary;
    }

    // Shadow based on variant or explicit shadow prop
    const shadowStyle = shadow || (variant === 'elevated' ? 'lg' : variant === 'interactive' ? 'md' : 'sm');

    switch (shadowStyle) {
      case 'none':
        break;
      case 'sm':
        Object.assign(baseStyle, shadows.sm);
        break;
      case 'md':
        Object.assign(baseStyle, shadows.md);
        break;
      case 'lg':
        Object.assign(baseStyle, shadows.lg);
        break;
      case 'xl':
        Object.assign(baseStyle, shadows.xl);
        break;
      default:
        Object.assign(baseStyle, shadows.base);
    }

    // Variant-specific styles
    switch (variant) {
      case 'elevated':
        baseStyle.backgroundColor = colors.surface.elevated;
        break;
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border.primary;
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'interactive':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border.primary;
        if (onPress && !disabled) {
          baseStyle.borderColor = colors.primary[200];
        }
        break;
      case 'feature':
        baseStyle.backgroundColor = colors.primary[50];
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.primary[200];
        break;
    }

    // Disabled state
    if (disabled) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const CardComponent = onPress ? (disabled ? View : Pressable) : View;

  const commonProps = {
    style: [getCardStyle(), style],
    accessibilityLabel,
    testID,
  };

  const pressableProps = onPress && !disabled ? {
    onPress,
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled },
    android_ripple: {
      color: colors.primary[100],
      borderless: false,
    },
  } : {};

  return (
    <CardComponent
      {...commonProps}
      {...pressableProps}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});