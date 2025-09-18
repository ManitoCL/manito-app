import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';

export type InputVariant = 'default' | 'error' | 'success';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: InputVariant;
  error?: string; // Add alias for errorMessage
  errorMessage?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'new-password' | 'current-password' | 'name' | 'tel' | 'off' | 'username';
  textContentType?: 'none' | 'URL' | 'addressCity' | 'addressCityAndState' | 'addressState' | 'countryName' | 'creditCardNumber' | 'emailAddress' | 'familyName' | 'fullStreetAddress' | 'givenName' | 'jobTitle' | 'location' | 'middleName' | 'name' | 'namePrefix' | 'nameSuffix' | 'nickname' | 'organizationName' | 'postalCode' | 'streetAddressLine1' | 'streetAddressLine2' | 'sublocality' | 'telephoneNumber' | 'username' | 'password' | 'newPassword' | 'oneTimeCode';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  ref?: React.RefObject<TextInput>;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode | string; // Allow string for emoji icons
  onRightIconPress?: () => void;
  required?: boolean; // Add required prop
  passwordRules?: string; // Add iOS password rules
  importantForAutofill?: 'auto' | 'no' | 'noExcludeDescendants' | 'yes' | 'yesExcludeDescendants'; // Add autofill prop
}

const colors = {
  primary: '#2563EB',
  gray: '#9CA3AF',
  lightGray: '#F3F4F6',
  border: '#D1D5DB',
  borderFocus: '#2563EB',
  borderError: '#EF4444',
  borderSuccess: '#10B981',
  text: '#111827',
  textSecondary: '#6B7280',
  error: '#EF4444',
  success: '#10B981',
  white: '#FFFFFF',
};

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  error,
  errorMessage,
  helperText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  textContentType,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit = true,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required,
  passwordRules,
  importantForAutofill,
  ref: forwardedRef,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Use forwarded ref if provided, otherwise use internal ref
  const activeRef = forwardedRef || inputRef;

  // iOS-specific autofill optimization
  const getIOSOptimizedProps = () => {
    if (Platform.OS !== 'ios') return {};

    // For iOS, we need to be very specific about textContentType to avoid conflicts
    if (secureTextEntry) {
      // For password fields, use newPassword for registration or password for login
      const contentType = textContentType || (autoComplete === 'new-password' ? 'newPassword' : 'password');
      return {
        textContentType: contentType,
        autoComplete: autoComplete === 'new-password' ? 'new-password' : 'current-password',
        passwordRules: autoComplete === 'new-password' ? 'minlength: 6;' : undefined,
      };
    }

    // For email fields
    if (keyboardType === 'email-address' || autoComplete === 'email') {
      return {
        textContentType: 'emailAddress',
        autoComplete: 'email',
      };
    }

    // For name fields
    if (autoComplete === 'name') {
      return {
        textContentType: 'name',
        autoComplete: 'name',
      };
    }

    // Default case - use provided textContentType or disable autofill
    return {
      textContentType: textContentType || 'none',
    };
  };

  const iosProps = getIOSOptimizedProps();

  const getBorderColor = () => {
    if (variant === 'error' || error || errorMessage) return colors.borderError;
    if (variant === 'success') return colors.borderSuccess;
    if (isFocused) return colors.borderFocus;
    return colors.border;
  };

  const showPasswordToggle = secureTextEntry && value.length > 0;
  const actualSecureEntry = secureTextEntry && !isPasswordVisible;
  const displayError = error || errorMessage;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[
        styles.inputContainer,
        { borderColor: getBorderColor() },
        !editable && styles.disabled
      ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          ref={activeRef}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
            inputStyle
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={actualSecureEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={iosProps.autoComplete || autoComplete}
          textContentType={iosProps.textContentType}
          passwordRules={iosProps.passwordRules || passwordRules}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          enablesReturnKeyAutomatically={true}
          importantForAutofill={importantForAutofill || "yes"}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={styles.passwordToggle}>
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {typeof rightIcon === 'string' ? (
              <Text style={styles.iconText}>{rightIcon}</Text>
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        )}
      </View>

      {displayError && (
        <Text style={styles.errorText}>{displayError}</Text>
      )}

      {helperText && !displayError && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  disabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  leftIconContainer: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  rightIconContainer: {
    paddingRight: 12,
    paddingLeft: 8,
  },
  passwordToggle: {
    fontSize: 18,
  },
  iconText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});