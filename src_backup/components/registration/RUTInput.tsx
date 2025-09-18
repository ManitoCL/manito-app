import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { rutUtils } from '../../utils/chilean';

interface RUTInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
}

const RUTInput: React.FC<RUTInputProps> = ({
  value,
  onChangeText,
  onValidationChange,
  placeholder = "12.345.678-9",
  label = "RUT",
  error,
  required = false,
  showValidation = true,
  disabled = false
}) => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [displayValue, setDisplayValue] = useState<string>('');

  // Update display value when prop value changes
  useEffect(() => {
    if (value !== rutUtils.getCleanRUT(displayValue)) {
      const formatted = rutUtils.formatRUT(value);
      setDisplayValue(formatted);
    }
  }, [value]);

  // Validate RUT and notify parent
  useEffect(() => {
    const validateRUT = async () => {
      if (!value) {
        setIsValid(false);
        onValidationChange?.(false);
        return;
      }

      setIsValidating(true);
      
      try {
        const valid = rutUtils.isValidRUT(value);
        setIsValid(valid);
        onValidationChange?.(valid);
      } catch (error) {
        console.error('RUT validation error:', error);
        setIsValid(false);
        onValidationChange?.(false);
      } finally {
        setIsValidating(false);
      }
    };

    // Debounce validation
    const timeoutId = setTimeout(validateRUT, 300);
    return () => clearTimeout(timeoutId);
  }, [value, onValidationChange]);

  const handleTextChange = (text: string) => {
    // Format as user types
    const formatted = rutUtils.formatAsUserTypes(text);
    setDisplayValue(formatted);
    
    // Get clean RUT for parent component
    const cleanRUT = rutUtils.getCleanRUT(formatted);
    onChangeText(cleanRUT);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Format the final value when user finishes typing
    if (displayValue) {
      const formatted = rutUtils.formatRUT(displayValue);
      setDisplayValue(formatted);
    }
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (disabled) {
      baseStyle.push(styles.inputDisabled);
    } else {
      if (isFocused) {
        baseStyle.push(styles.inputFocused);
      }
      
      if (error) {
        baseStyle.push(styles.inputError);
      } else if (showValidation && value && isValid) {
        baseStyle.push(styles.inputValid);
      } else if (showValidation && value && !isValid && !isValidating) {
        baseStyle.push(styles.inputInvalid);
      }
    }
    
    return baseStyle;
  };

  const getHelpText = () => {
    if (error) {
      return error;
    }
    
    if (isValidating) {
      return "Validando RUT...";
    }
    
    if (showValidation && value && !isValid && !isValidating) {
      return "RUT inválido. Formato: XX.XXX.XXX-X";
    }
    
    return "Ingresa tu RUT chileno (con o sin puntos y guión)";
  };

  const getHelpTextStyle = () => {
    if (error) {
      return styles.errorText;
    }
    
    if (isValidating) {
      return styles.validatingText;
    }
    
    if (showValidation && value && !isValid && !isValidating) {
      return styles.warningText;
    }
    
    return styles.helpText;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[styles.inputContainer, disabled && styles.inputContainerDisabled]}>
        <TextInput
          style={getInputStyle()}
          value={displayValue}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={disabled ? "#cccccc" : "#999999"}
          maxLength={12} // XX.XXX.XXX-X
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!disabled}
          accessibilityLabel={label}
          accessibilityHint="Ingresa tu RUT chileno"
        />
        
        {isValidating && (
          <View style={styles.validatingIcon}>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        )}
        
        {showValidation && value && isValid && !isValidating && !error && (
          <View style={styles.validIcon}>
            <Text style={styles.validIconText}>✓</Text>
          </View>
        )}
      </View>

      {(showValidation || error) && (
        <Text style={getHelpTextStyle()}>
          {getHelpText()}
        </Text>
      )}

      {showValidation && value && isValid && !error && !isValidating && (
        <View style={styles.validationContainer}>
          <Text style={styles.validText}>✓ RUT válido</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  labelDisabled: {
    color: '#999999',
  },
  required: {
    color: '#ff4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  inputContainerDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d0d0d0',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputDisabled: {
    color: '#999999',
    backgroundColor: '#f5f5f5',
  },
  inputFocused: {
    borderColor: '#4CAF50',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  inputValid: {
    borderColor: '#4CAF50',
  },
  inputInvalid: {
    borderColor: '#ff9800',
  },
  validatingIcon: {
    paddingHorizontal: 12,
  },
  validIcon: {
    paddingHorizontal: 12,
  },
  validIconText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    marginTop: 4,
    marginLeft: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#ff9800',
    marginTop: 4,
    marginLeft: 4,
  },
  validatingText: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
    marginLeft: 4,
  },
  validationContainer: {
    marginTop: 4,
    marginLeft: 4,
  },
  validText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default RUTInput;