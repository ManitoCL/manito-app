/**
 * Card Component - Manito Design System
 * Professional card component for displaying content with elevation and borders
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  /** Padding size */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Margin size */
  margin?: 'none' | 'small' | 'medium' | 'large';
  /** Make card pressable */
  onPress?: () => void;
  /** Custom style overrides */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
  /** Disable card (reduces opacity) */
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  onPress,
  style,
  testID,
  disabled = false,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles],
    styles[`margin${margin.charAt(0).toUpperCase() + margin.slice(1)}` as keyof typeof styles],
    disabled && styles.disabled,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.semantic.background,
    borderRadius: theme.borderRadius.xl, // 12px - Manito brand guidelines
  },
  
  // Variants - Manito Brand (soft shadows, rounded corners)
  default: {
    ...theme.shadows.base, // Soft shadow
  },
  elevated: {
    borderRadius: theme.borderRadius['2xl'], // 14px for elevated cards
    ...theme.shadows.lg, // Larger soft shadow
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.xs, // Minimal shadow
  },
  flat: {
    backgroundColor: theme.colors.semantic.surfaceVariant,
    // No shadow for flat variant
  },
  
  // Padding variants
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: theme.spacing[3],
  },
  paddingMedium: {
    padding: theme.spacing[4],
  },
  paddingLarge: {
    padding: theme.spacing[6],
  },
  
  // Margin variants
  marginNone: {
    margin: 0,
  },
  marginSmall: {
    margin: theme.spacing[2],
  },
  marginMedium: {
    margin: theme.spacing[3],
  },
  marginLarge: {
    margin: theme.spacing[4],
  },
  
  // States
  disabled: {
    opacity: 0.6,
  },
});

export default Card;