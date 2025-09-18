/**
 * Chilean RUT Input Component
 *
 * Provides real-time RUT validation and formatting with visual feedback
 * Follows existing Input component patterns for consistency
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input, InputVariant } from '../ui/Input';
import { validateAndFormatRut, validateRut, RutValidationResult } from '../../utils/chilean/rutValidation';
import { colors, typography, spacing } from '../../design/tokens';

interface RutInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (rut: string) => void;
  onValidationChange?: (validation: RutValidationResult) => void;
  errorMessage?: string;
  helperText?: string;
  variant?: InputVariant;
  showValidationIcon?: boolean;
  autoValidate?: boolean;
  disabled?: boolean;
  style?: any;
}

const DEFAULT_PLACEHOLDER = 'Ej: 12.345.678-5';
const DEFAULT_LABEL = 'RUT';
const DEFAULT_HELPER_TEXT = 'Ingresa tu RUT sin puntos ni guión';

export const RutInput: React.FC<RutInputProps> = ({
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
  style,
}) => {
  const [internalValidation, setInternalValidation] = useState<RutValidationResult>({ isValid: false });
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

  // Handle RUT input with real-time formatting and validation
  const handleRutChange = useCallback((inputText: string) => {
    // Format and validate the input
    const { formatted, isValid, error } = validateAndFormatRut(inputText);

    // Update the input value with formatted text
    onChangeText(formatted);

    // Update internal validation state
    const validation: RutValidationResult = { isValid, error };
    setInternalValidation(validation);

    // Notify parent of validation changes if callback provided
    if (onValidationChange) {
      // For external validation callback, use full validation when RUT is complete
      if (formatted.length >= 3) { // At least X-Y format
        const fullValidation = validateRut(formatted);
        onValidationChange(fullValidation);
      } else {
        onValidationChange({ isValid: false, error: undefined });
      }
    }
  }, [onChangeText, onValidationChange]);

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
      const fullValidation = validateRut(value);
      setInternalValidation(fullValidation);

      if (onValidationChange) {
        onValidationChange(fullValidation);
      }
    }
  }, [value, autoValidate, onValidationChange]);

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

  // Get helper text with validation hints
  const getHelperText = (): string => {
    // External error takes precedence
    if (externalErrorMessage) return helperText;

    // During typing, show format hints
    if (isFocused && value.length === 0) {
      return 'Formato: 12.345.678-5 (se formatea automáticamente)';
    }

    // Show validation status for partial input
    if (isFocused && value.length > 0 && value.length < 3) {
      return 'Continúa escribiendo tu RUT...';
    }

    // Show success message
    if (showSuccess) {
      return '✅ RUT válido';
    }

    // Show default helper text
    return helperText;
  };

  return (
    <View style={[styles.container, style]}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={handleRutChange}
        variant={getVariant()}
        errorMessage={getErrorMessage()}
        helperText={getHelperText()}
        keyboardType="numeric"
        autoCapitalize="none"
        autoComplete="off"
        textContentType="none"
        returnKeyType="done"
        editable={!disabled}
        maxLength={12} // XX.XXX.XXX-X format
        rightIcon={getValidationIcon()}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </View>
  );
};

// Enhanced RUT Input with context validation
interface ContextualRutInputProps extends RutInputProps {
  context?: 'personal' | 'company' | 'foreign';
  contextLabel?: string;
}

export const ContextualRutInput: React.FC<ContextualRutInputProps> = ({
  context = 'personal',
  contextLabel,
  ...props
}) => {
  const getContextualLabel = () => {
    if (contextLabel) return contextLabel;

    switch (context) {
      case 'personal':
        return 'RUT Personal';
      case 'company':
        return 'RUT Empresa';
      case 'foreign':
        return 'RUT Extranjero';
      default:
        return 'RUT';
    }
  };

  const getContextualHelperText = () => {
    switch (context) {
      case 'personal':
        return 'Ingresa tu RUT personal (persona natural)';
      case 'company':
        return 'Ingresa el RUT de la empresa';
      case 'foreign':
        return 'Ingresa tu RUT de extranjero';
      default:
        return DEFAULT_HELPER_TEXT;
    }
  };

  return (
    <RutInput
      {...props}
      label={getContextualLabel()}
      helperText={props.helperText || getContextualHelperText()}
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
});

// Export utilities for external use
export { validateRut, validateAndFormatRut } from '../../utils/chilean/rutValidation';