/**
 * RUTInput Component
 * Frontend-UI-Expert: Chilean RUT input with real-time validation and formatting
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { formatRUT, validateRUT } from '../../utils/chilean';

interface RUTInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  showValidation?: boolean;
  label?: string;
  required?: boolean;
}

const RUTInput: React.FC<RUTInputProps> = ({
  value,
  onChangeText,
  onValidityChange,
  placeholder = 'Ej: 12.345.678-9',
  error,
  disabled = false,
  showValidation = true,
  label = 'RUT',
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = validateRUT(value);
    setIsValid(valid);
    onValidityChange?.(valid);
  }, [value, onValidityChange]);

  const handleTextChange = (text: string) => {
    // Format the text as user types
    const formatted = formatRUT(text);
    onChangeText(formatted);
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }
    
    if (error) {
      baseStyle.push(styles.inputError);
    } else if (showValidation && value.length > 0 && isValid) {
      baseStyle.push(styles.inputValid);
    }
    
    if (disabled) {
      baseStyle.push(styles.inputDisabled);
    }
    
    return baseStyle;
  };

  const getBorderColor = () => {
    if (error) return '#ff3b30';
    if (isFocused) return '#007AFF';
    if (showValidation && value.length > 0 && isValid) return '#34c759';
    return '#e5e5e5';
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      
      <View style={[styles.inputContainer, { borderColor: getBorderColor() }]}>
        <Text style={styles.countryPrefix}>🇨🇱</Text>
        
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          maxLength={12} // XX.XXX.XXX-X format
          editable={!disabled}
          autoComplete="off"
        />
        
        {showValidation && value.length > 0 && (
          <View style={styles.validationIndicator}>
            <Text style={[
              styles.validationIcon,
              { color: isValid ? '#34c759' : '#ff3b30' }
            ]}>
              {isValid ? '✓' : '✗'}
            </Text>
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {!error && showValidation && value.length > 0 && !isValid && (
        <Text style={styles.helperText}>
          Ingresa un RUT chileno válido (formato: 12.345.678-9)
        </Text>
      )}
      
      {!error && !value && (
        <Text style={styles.helperText}>
          Tu número de identificación chileno
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  required: {
    fontSize: 16,
    color: '#ff3b30',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    minHeight: 52,
  },
  countryPrefix: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  inputFocused: {
    // Focused state handled by border color
  },
  inputError: {
    // Error state handled by border color
  },
  inputValid: {
    // Valid state handled by border color
  },
  inputDisabled: {
    backgroundColor: '#f8f8f8',
    color: '#999999',
  },
  validationIndicator: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  validationIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    marginTop: 6,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 13,
    color: '#666666',
    marginTop: 6,
    marginLeft: 4,
  },
});

export default RUTInput;