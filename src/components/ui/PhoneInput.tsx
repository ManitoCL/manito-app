import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { AMERICAS_COUNTRIES, CountryInfo } from '../../types';

interface PhoneInputProps {
  label?: string;
  value: string;
  onChangeText: (phoneNumber: string) => void;
  selectedCountry: string;
  onCountryChange: (countryCode: string) => void;
  placeholder?: string;
  errorMessage?: string;
  style?: ViewStyle;
}

const colors = {
  primary: '#2563EB',
  gray: '#9CA3AF',
  lightGray: '#F3F4F6',
  border: '#D1D5DB',
  borderFocus: '#2563EB',
  borderError: '#EF4444',
  text: '#111827',
  textSecondary: '#6B7280',
  error: '#EF4444',
  white: '#FFFFFF',
  background: '#F9FAFB',
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChangeText,
  selectedCountry,
  onCountryChange,
  placeholder = 'Número de teléfono',
  errorMessage,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);

  const selectedCountryInfo = AMERICAS_COUNTRIES[selectedCountry];
  const countriesList = Object.entries(AMERICAS_COUNTRIES).map(([code, info]) => ({
    code,
    ...info,
  }));

  const getBorderColor = () => {
    if (errorMessage) return colors.borderError;
    if (isFocused) return colors.borderFocus;
    return colors.border;
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');

    // Apply basic formatting based on country
    // This is a simplified version - in production you'd want more sophisticated formatting
    if (selectedCountry === 'CL') {
      // Chilean phone format: +56 9 1234 5678
      if (cleaned.length <= 8) {
        return cleaned;
      } else if (cleaned.length === 9) {
        return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
      }
      return cleaned;
    }

    return cleaned;
  };

  const handleTextChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChangeText(formatted);
  };

  const renderCountryItem = ({ item }: { item: CountryInfo & { code: string } }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        onCountryChange(item.code);
        setIsCountryModalVisible(false);
      }}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[
        styles.inputContainer,
        { borderColor: getBorderColor() }
      ]}>
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setIsCountryModalVisible(true)}
        >
          <Text style={styles.flag}>{selectedCountryInfo.flag}</Text>
          <Text style={styles.countryCodeText}>{selectedCountryInfo.code}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.gray}
          value={value}
          onChangeText={handleTextChange}
          keyboardType="phone-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      <Modal
        visible={isCountryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu país</Text>
              <TouchableOpacity
                onPress={() => setIsCountryModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={countriesList}
              keyExtractor={(item) => item.code}
              renderItem={renderCountryItem}
              style={styles.countriesList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 16,
    color: colors.text,
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 10,
    color: colors.gray,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.gray,
  },
  countriesList: {
    padding: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  countryCode: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});