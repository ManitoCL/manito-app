import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const colors = {
  primary: '#2563EB', // Professional blue
  primaryHover: '#1D4ED8',
  secondary: '#F3F4F6',
  secondaryText: '#374151',
  ghost: 'transparent',
  ghostText: '#2563EB',
  white: '#FFFFFF',
  gray: '#9CA3AF',
  disabled: '#E5E7EB',
  disabledText: '#9CA3AF',
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 16;
        baseStyle.minHeight = 36;
        break;
      case 'large':
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 24;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 20;
        baseStyle.minHeight = 48;
    }

    // Variant styles
    if (isDisabled) {
      baseStyle.backgroundColor = colors.disabled;
    } else {
      switch (variant) {
        case 'primary':
          baseStyle.backgroundColor = colors.primary;
          break;
        case 'secondary':
          baseStyle.backgroundColor = colors.secondary;
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = '#D1D5DB';
          break;
        case 'ghost':
          baseStyle.backgroundColor = colors.ghost;
          break;
      }
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default: // medium
        baseStyle.fontSize = 16;
    }

    // Variant styles
    if (isDisabled) {
      baseStyle.color = colors.disabledText;
    } else {
      switch (variant) {
        case 'primary':
          baseStyle.color = colors.white;
          break;
        case 'secondary':
          baseStyle.color = colors.secondaryText;
          break;
        case 'ghost':
          baseStyle.color = colors.ghostText;
          break;
      }
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>
        {loading ? 'Cargando...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional utility styles can be added here if needed
});