import React from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const colors = {
  white: '#FFFFFF',
  border: '#E5E7EB',
  background: '#F9FAFB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: colors.white,
    };

    // Padding styles
    switch (padding) {
      case 'none':
        break;
      case 'small':
        baseStyle.padding = 12;
        break;
      case 'large':
        baseStyle.padding = 24;
        break;
      default: // medium
        baseStyle.padding = 16;
    }

    // Variant styles
    switch (variant) {
      case 'elevated':
        baseStyle.shadowColor = colors.shadow;
        baseStyle.shadowOffset = { width: 0, height: 2 };
        baseStyle.shadowOpacity = 0.1;
        baseStyle.shadowRadius = 8;
        baseStyle.elevation = 4; // Android shadow
        break;
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border;
        break;
      default:
        // Default card with subtle shadow
        baseStyle.shadowColor = colors.shadow;
        baseStyle.shadowOffset = { width: 0, height: 1 };
        baseStyle.shadowOpacity = 0.05;
        baseStyle.shadowRadius = 4;
        baseStyle.elevation = 2;
    }

    return baseStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional utility styles can be added here if needed
});