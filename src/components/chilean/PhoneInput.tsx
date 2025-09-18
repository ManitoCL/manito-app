/**
 * Chilean Phone Input Component
 *
 * Provides real-time Chilean phone validation and formatting with visual feedback
 * Supports mobile and fixed line numbers with context-specific validation
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input, InputVariant } from '../ui/Input';
import {
  validateAndFormatChileanPhone,
  validateChileanPhone,
  validatePhoneByContext,
  PhoneValidationResult,
  PHONE_VALIDATION_RULES,
  getPhoneInfo
} from '../../utils/chilean/phoneValidation';

interface PhoneInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (phone: string) => void;
  onValidationChange?: (validation: PhoneValidationResult) => void;
  errorMessage?: string;
  helperText?: string;
  variant?: InputVariant;
  showValidationIcon?: boolean;
  autoValidate?: boolean;
  disabled?: boolean;
  context?: 'mobile' | 'fixed' | 'any';
  showPhoneInfo?: boolean;
  style?: any;
}

const DEFAULT_PLACEHOLDER = '+56 9 1234 5678';
const DEFAULT_LABEL = 'Teléfono';
const DEFAULT_HELPER_TEXT = 'Ingresa tu número de teléfono chileno';

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = DEFAULT_LABEL,
  placeholder = DEFAULT_PLACEHOLDER,
  value,
  onChangeText,
  onValidationChange,
  errorMessage: externalErrorMessage,
  helperText = DEFAULT_HELPER_TEXT,
  variant: externalVariant,
  showValidationIcon = true,
  autoValidate = true,
  disabled = false,
  context = 'any',
  showPhoneInfo = true,
  style,
}) => {
  const [internalValidation, setInternalValidation] = useState<PhoneValidationResult>({ isValid: false });
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine which validation state to use
  const currentValidation = internalValidation;
  const showError = hasBeenBlurred && !currentValidation.isValid && value.length > 0;
  const showSuccess = hasBeenBlurred && currentValidation.isValid;

  // Determine variant based on validation state or external override
  const getVariant = (): InputVariant => {
    if (externalVariant) return externalVariant;
    if (externalErrorMessage) return 'error';
    if (showError) return 'error';
    if (showSuccess) return 'success';
    return 'default';
  };

  // Determine error message to display
  const getErrorMessage = (): string | undefined => {
    if (externalErrorMessage) return externalErrorMessage;
    if (showError && currentValidation.error) return currentValidation.error;
    return undefined;
  };

  // Handle phone input with real-time formatting and validation
  const handlePhoneChange = useCallback((inputText: string) => {
    // Format and validate the input
    const { formatted, isValid, error } = validateAndFormatChileanPhone(inputText);

    // Update the input value with formatted text
    onChangeText(formatted);

    // Update internal validation state
    const validation: PhoneValidationResult = { isValid, error };
    setInternalValidation(validation);

    // Notify parent of validation changes if callback provided
    if (onValidationChange) {
      // For external validation callback, use context-specific validation when phone is complete
      if (formatted.length >= 8) { // At least +56 X format
        const contextValidation = context === 'any'
          ? validateChileanPhone(formatted)
          : validatePhoneByContext(formatted, context === 'mobile' ? 'MOBILE_ONLY' : context === 'fixed' ? 'FIXED_ONLY' : 'ANY');
        onValidationChange(contextValidation);
      } else {
        onValidationChange({ isValid: false, error: undefined });
      }
    }
  }, [onChangeText, onValidationChange, context]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle input blur - trigger validation display
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setHasBeenBlurred(true);

    // Perform full validation on blur if auto-validate is enabled
    if (autoValidate && value.length > 0) {
      const fullValidation = context === 'any'
        ? validateChileanPhone(value)
        : validatePhoneByContext(value, context === 'mobile' ? 'MOBILE_ONLY' : context === 'fixed' ? 'FIXED_ONLY' : 'ANY');

      setInternalValidation(fullValidation);

      if (onValidationChange) {
        onValidationChange(fullValidation);
      }
    }
  }, [value, autoValidate, onValidationChange, context]);

  // Get validation icon
  const getValidationIcon = () => {
    if (!showValidationIcon || value.length === 0) return null;

    if (showSuccess) {
      return <Text style={styles.validationIcon}>✅</Text>;
    }

    if (showError) {
      return <Text style={styles.validationIcon}>❌</Text>;
    }

    return null;
  };

  // Get phone info for display
  const getPhoneInfoText = (): string | null => {
    if (!showPhoneInfo || !currentValidation.isValid || value.length === 0) return null;

    const phoneInfo = getPhoneInfo(value);

    if (phoneInfo.type === 'mobile') {
      return `📱 Móvil${phoneInfo.carrier ? ` - ${phoneInfo.carrier}` : ''}`;
    }

    if (phoneInfo.type === 'fixed') {
      return `🏠 Fijo${phoneInfo.region ? ` - ${phoneInfo.region}` : ''}`;
    }

    return null;
  };

  // Get helper text with validation hints
  const getHelperText = (): string => {
    // External error takes precedence
    if (externalErrorMessage) return helperText;

    // Show phone info when valid
    const phoneInfoText = getPhoneInfoText();
    if (phoneInfoText && showSuccess) {
      return phoneInfoText;
    }

    // During typing, show format hints based on context
    if (isFocused && value.length === 0) {
      switch (context) {
        case 'mobile':
          return 'Formato: +56 9 1234 5678 (solo móviles)';
        case 'fixed':
          return 'Formato: +56 2 1234 5678 (solo fijos)';
        default:
          return 'Formato: +56 9 1234 5678 (se formatea automáticamente)';
      }
    }

    // Show validation status for partial input
    if (isFocused && value.length > 0 && value.length < 8) {
      return 'Continúa escribiendo tu número de teléfono...';
    }

    // Show success message
    if (showSuccess) {
      return '✅ Número válido';
    }

    // Show default helper text
    return helperText;
  };

  // Get context-specific placeholder
  const getPlaceholder = (): string => {
    switch (context) {
      case 'mobile':
        return '+56 9 1234 5678';
      case 'fixed':
        return '+56 2 1234 5678';
      default:
        return placeholder;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Input
        label={label}
        placeholder={getPlaceholder()}
        value={value}
        onChangeText={handlePhoneChange}
        variant={getVariant()}
        errorMessage={getErrorMessage()}
        helperText={getHelperText()}
        keyboardType="phone-pad"
        autoCapitalize="none"
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType="done"
        editable={!disabled}
        maxLength={18} // +56 XX XXXX XXXX format
        rightIcon={getValidationIcon()}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </View>
  );
};

// Enhanced Phone Input with SMS context (mobile only)
interface SMSPhoneInputProps extends Omit<PhoneInputProps, 'context'> {
  showSMSHint?: boolean;
}

export const SMSPhoneInput: React.FC<SMSPhoneInputProps> = ({
  showSMSHint = true,
  helperText,
  ...props
}) => {
  const getSMSHelperText = () => {
    if (helperText) return helperText;
    if (showSMSHint) return 'Número móvil para verificación por SMS';
    return 'Ingresa tu número móvil';
  };

  return (
    <PhoneInput
      {...props}
      context="mobile"
      label="Teléfono Móvil"
      helperText={getSMSHelperText()}
      placeholder="+56 9 1234 5678"
    />
  );
};

// Chilean WhatsApp Phone Input (mobile only with WhatsApp context)
interface WhatsAppPhoneInputProps extends Omit<PhoneInputProps, 'context'> {
  showWhatsAppHint?: boolean;
}

export const WhatsAppPhoneInput: React.FC<WhatsAppPhoneInputProps> = ({
  showWhatsAppHint = true,
  helperText,
  ...props
}) => {
  const getWhatsAppHelperText = () => {
    if (helperText) return helperText;
    if (showWhatsAppHint) return 'Número móvil con WhatsApp para notificaciones';
    return 'Ingresa tu número de WhatsApp';
  };

  return (
    <PhoneInput
      {...props}
      context="mobile"
      label="WhatsApp"
      helperText={getWhatsAppHelperText()}
      placeholder="+56 9 1234 5678"
      leftIcon={<Text style={styles.whatsappIcon}>💬</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    // Container styles handled by Input component
  },
  validationIcon: {
    fontSize: 16,
  },
  whatsappIcon: {
    fontSize: 16,
  },
});

// Export utilities for external use
export {
  validateChileanPhone,
  validateAndFormatChileanPhone,
  validatePhoneByContext,
  getPhoneInfo,
  PHONE_VALIDATION_RULES
} from '../../utils/chilean/phoneValidation';