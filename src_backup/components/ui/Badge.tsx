/**
 * Badge Component - Manito Design System
 * Professional badge component for status indicators, verification, and labels
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme';

export interface BadgeProps {
  /** Badge text content */
  label: string;
  /** Badge variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'verified' | 'pending';
  /** Badge size */
  size?: 'small' | 'medium' | 'large';
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Custom style overrides */
  style?: ViewStyle;
  /** Custom text style overrides */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  style,
  textStyle,
  testID,
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const badgeTextStyle = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
    textStyle,
  ];

  return (
    <View style={badgeStyle} testID={testID}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={badgeTextStyle}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.primary[500],
  },
  secondary: {
    backgroundColor: theme.colors.neutral[200],
  },
  success: {
    backgroundColor: theme.colors.secondary[500],
  },
  warning: {
    backgroundColor: theme.colors.accent.warning,
  },
  error: {
    backgroundColor: theme.colors.accent.error,
  },
  info: {
    backgroundColor: theme.colors.accent.info,
  },
  verified: {
    backgroundColor: theme.colors.status.verified,
  },
  pending: {
    backgroundColor: theme.colors.status.pending,
  },
  
  // Sizes
  small: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    minHeight: 20,
  },
  medium: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    minHeight: 24,
  },
  large: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    minHeight: 32,
  },
  
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  textSmall: {
    fontSize: theme.typography.fontSize.xs,
  },
  textMedium: {
    fontSize: theme.typography.fontSize.sm,
  },
  textLarge: {
    fontSize: theme.typography.fontSize.base,
  },
  
  // Text color variants
  textPrimary: {
    color: theme.colors.semantic.background,
  },
  textSecondary: {
    color: theme.colors.neutral[700],
  },
  textSuccess: {
    color: theme.colors.semantic.background,
  },
  textWarning: {
    color: theme.colors.semantic.background,
  },
  textError: {
    color: theme.colors.semantic.background,
  },
  textInfo: {
    color: theme.colors.semantic.background,
  },
  textVerified: {
    color: theme.colors.semantic.background,
  },
  textPending: {
    color: theme.colors.semantic.background,
  },
  
  // Icon container
  iconContainer: {
    marginRight: theme.spacing[1],
  },
});

export default Badge;