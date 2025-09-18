/**
 * ChileanPhoneInput Component
 * Following marketplace-ux-specialist and frontend-ui-expert principles
 * Optimized for Chilean phone number entry with real-time formatting
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { formatChileanPhone, validateChileanPhone } from '../../utils/chilean';

interface ChileanPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  showValidation?: boolean;
}

const ChileanPhoneInput: React.FC<ChileanPhoneInputProps> = ({
  value,
  onChangeText,
  onValidityChange,
  placeholder = 'Ej: +56 9 1234 5678',
  error,
  disabled = false,
  showValidation = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = validateChileanPhone(value);
    setIsValid(valid);
    onValidityChange?.(valid);
  }, [value, onValidityChange]);

  const handleTextChange = (text: string) => {
    // Remove any non-digit characters for processing
    const cleanText = text.replace(/\D/g, '');
    
    // Format the text as user types
    const formatted = formatChileanPhone(cleanText);
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
        <Text style={styles.label}>Número de Teléfono</Text>
        <Text style={styles.required}>*</Text>
      </View>
      
      <View style={[styles.inputContainer, { borderColor: getBorderColor() }]}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>🇨🇱 +56</Text>
        </View>
        
        <TextInput
          style={getInputStyle()}
          value={value.replace('+56 ', '')} // Remove country code for display
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder.replace('+56 ', '')}
          placeholderTextColor="#999999"
          keyboardType="numeric"
          maxLength={15} // Max length for formatted Chilean phone
          editable={!disabled}
          autoComplete="tel"
          textContentType="telephoneNumber"
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
          Ingresa un número chileno válido (móvil: 9XXXXXXXX)
        </Text>
      )}
      
      {!error && !value && (
        <Text style={styles.helperText}>
          Formato: +56 9 1234 5678 para móviles
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
  countryCode: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
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

export default ChileanPhoneInput;