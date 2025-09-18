/**
 * Enterprise-level Button Component
 * Optimized for conversions and accessibility
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
import { colors, typography, spacing, borderRadius, shadows } from '../../design/tokens';

export interface EnterpriseButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  testID?: string;
}

export const EnterpriseButton: React.FC<EnterpriseButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
  testID,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      ...styles[size],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.neutral[300] : colors.primary[500],
          ...shadows.sm,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.neutral[200] : colors.secondary[500],
          ...shadows.sm,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? colors.neutral[300] : colors.primary[500],
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.neutral[300] : colors.error[500],
          ...shadows.sm,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.text,
      ...styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return {
          ...baseTextStyle,
          color: disabled ? colors.neutral[500] : colors.text.inverse,
        };
      case 'outline':
        return {
          ...baseTextStyle,
          color: disabled ? colors.neutral[400] : colors.primary[500],
        };
      case 'ghost':
        return {
          ...baseTextStyle,
          color: disabled ? colors.neutral[400] : colors.primary[500],
        };
      default:
        return baseTextStyle;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? colors.primary[500] : colors.text.inverse}
          />
          <Text style={[getTextStyle(), { marginLeft: spacing[2] }]}>
            {title}
          </Text>
        </View>
      );
    }

    if (icon) {
      return (
        <View style={[styles.contentContainer, iconPosition === 'right' && styles.contentReverse]}>
          {iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      );
    }

    return <Text style={[getTextStyle(), textStyle]}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
  },

  // Size variants
  sm: {
    height: 32,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  md: {
    height: 40,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  lg: {
    height: 48,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  xl: {
    height: 56,
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
  },

  // Text styles
  text: {
    fontFamily: typography.fontFamily.sans[0],
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  textSm: {
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
  },
  textMd: {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight,
  },
  textLg: {
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
  },
  textXl: {
    fontSize: typography.fontSize.xl.size,
    lineHeight: typography.fontSize.xl.lineHeight,
  },

  // Content layout
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentReverse: {
    flexDirection: 'row-reverse',
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});