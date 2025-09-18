/**
 * Input Component - Manito Design System
 * Professional text input component with validation and accessibility features
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Input variant */
  variant?: 'default' | 'outlined' | 'filled';
  /** Input size */
  size?: 'small' | 'medium' | 'large';
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Right icon component */
  rightIcon?: React.ReactNode;
  /** Show/hide password toggle for password inputs */
  showPasswordToggle?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom input style */
  inputStyle?: ViewStyle;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  placeholder,
  error,
  helperText,
  variant = 'default',
  size = 'medium',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  containerStyle,
  inputStyle,
  required = false,
  disabled = false,
  secureTextEntry,
  ...textInputProps
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const hasError = Boolean(error);
  const isPasswordField = secureTextEntry || showPasswordToggle;

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    styles[variant],
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    isFocused && styles.focused,
    hasError && styles.error,
    disabled && styles.disabled,
  ];

  const inputStyles = [
    styles.input,
    styles[`inputSize${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    disabled && styles.inputDisabled,
    inputStyle,
  ];

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={containerStyles}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={inputStyles}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.neutral[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={isPasswordField ? !isPasswordVisible : false}
          {...textInputProps}
        />
        
        {(rightIcon || isPasswordField) && (
          <View style={styles.rightIconContainer}>
            {isPasswordField && showPasswordToggle ? (
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.passwordToggle}
              >
                <Text style={styles.passwordToggleText}>
                  {isPasswordVisible ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            ) : (
              rightIcon
            )}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <View style={styles.messageContainer}>
          <Text style={[styles.message, hasError && styles.errorText]}>
            {error || helperText}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  
  labelContainer: {
    marginBottom: theme.spacing[1],
  },
  
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[700],
  },
  
  required: {
    color: theme.colors.accent.error,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.semantic.background,
    borderRadius: theme.borderRadius.md,
  },
  
  // Variants
  default: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  
  outlined: {
    borderWidth: 2,
    borderColor: theme.colors.neutral[300],
    backgroundColor: 'transparent',
  },
  
  filled: {
    backgroundColor: theme.colors.neutral[50],
    borderWidth: 0,
  },
  
  // Sizes
  sizeSmall: {
    minHeight: 36,
    paddingHorizontal: theme.spacing[3],
  },
  
  sizeMedium: {
    minHeight: 44,
    paddingHorizontal: theme.spacing[4],
  },
  
  sizeLarge: {
    minHeight: 52,
    paddingHorizontal: theme.spacing[5],
  },
  
  // States
  focused: {
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
  },
  
  error: {
    borderColor: theme.colors.accent.error,
    borderWidth: 2,
  },
  
  disabled: {
    backgroundColor: theme.colors.neutral[100],
    borderColor: theme.colors.neutral[200],
    opacity: 0.6,
  },
  
  // Input styles
  input: {
    flex: 1,
    color: theme.colors.neutral[900],
    fontWeight: theme.typography.fontWeight.regular,
  },
  
  inputSizeSmall: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  inputSizeMedium: {
    fontSize: theme.typography.fontSize.base,
  },
  
  inputSizeLarge: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  inputDisabled: {
    color: theme.colors.neutral[400],
  },
  
  // Icon containers
  leftIconContainer: {
    marginRight: theme.spacing[2],
  },
  
  rightIconContainer: {
    marginLeft: theme.spacing[2],
  },
  
  passwordToggle: {
    padding: theme.spacing[1],
  },
  
  passwordToggleText: {
    fontSize: theme.typography.fontSize.base,
  },
  
  // Message styles
  messageContainer: {
    marginTop: theme.spacing[1],
  },
  
  message: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
  },
  
  errorText: {
    color: theme.colors.accent.error,
  },
});

Input.displayName = 'Input';

export default Input;