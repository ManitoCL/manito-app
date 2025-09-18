/**
 * Button Component - Manito Design System
 * Professional, accessible button component with multiple variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { theme } from '../../theme';

export interface ButtonProps {
  /** Button text content */
  title: string;
  /** Button press handler */
  onPress: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost' | 'accent';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
  /** Custom text style overrides */
  textStyle?: TextStyle;
  /** Icon component to display before text */
  leftIcon?: React.ReactNode;
  /** Icon component to display after text */
  rightIcon?: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  testID,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textColor = getTextColor(variant, disabled || loading);
  
  const buttonTextStyle = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    { color: textColor },
    textStyle,
  ];

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={textColor}
            style={styles.spinner}
          />
        ) : (
          <>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={buttonTextStyle}>{title}</Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getTextColor = (variant: string, disabled: boolean): string => {
  if (disabled) {
    return theme.colors.neutral[400];
  }

  switch (variant) {
    case 'primary':
    case 'success':
      return theme.colors.semantic.background; // White text
    case 'secondary':
    case 'accent':
      return theme.colors.primary[500]; // Navy text on yellow
    case 'outline':
    case 'ghost':
      return theme.colors.primary[500]; // Navy text
    default:
      return theme.colors.semantic.background;
  }
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.xl, // 12px rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // Shadow applied per variant
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variants - Manito Brand Guidelines
  primary: {
    backgroundColor: theme.colors.primary[500], // Navy background, white text, strong shadow
    ...theme.shadows.md,
  },
  secondary: {
    backgroundColor: theme.colors.secondary[500], // Yellow background, navy text
    ...theme.shadows.sm,
  },
  accent: {
    backgroundColor: theme.colors.secondary[500], // Same as secondary - yellow
    ...theme.shadows.sm,
  },
  success: {
    backgroundColor: theme.colors.accent.success, // Green background
    ...theme.shadows.sm,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary[500], // Navy border
  },
  ghost: {
    backgroundColor: 'transparent', // Transparent with navy border
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  
  // Sizes
  small: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    minHeight: 36,
  },
  medium: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    minHeight: 44,
  },
  large: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    minHeight: 52,
  },
  
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  textSmall: {
    fontSize: theme.typography.fontSize.sm,
  },
  textMedium: {
    fontSize: theme.typography.fontSize.base,
  },
  textLarge: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  // States
  disabled: {
    opacity: 0.5,
    ...theme.shadows.xs,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Icons
  leftIcon: {
    marginRight: theme.spacing[2],
  },
  rightIcon: {
    marginLeft: theme.spacing[2],
  },
  spinner: {
    marginHorizontal: theme.spacing[2],
  },
});

export default Button;