/**
 * PhoneInput Component - International phone number input with country selector
 * Supports all countries from AuthService.SUPPORTED_COUNTRIES
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService, SUPPORTED_COUNTRIES } from '../../services/auth';
import { theme } from '../../theme';

const { width: screenWidth } = Dimensions.get('window') || { width: 0 };

interface PhoneInputProps {
  value: string;
  onChangeText: (phone: string) => void;
  placeholder?: string;
  error?: string;
  style?: any;
}

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  placeholder = "Phone number",
  error,
  style,
}) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    // Default to Chile for Manito
    return {
      code: 'CL',
      name: SUPPORTED_COUNTRIES.CL.name,
      flag: SUPPORTED_COUNTRIES.CL.flag,
      dialCode: SUPPORTED_COUNTRIES.CL.code,
    };
  });

  // Format phone number as user types
  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Add spaces for better readability based on country
    if (selectedCountry.code === 'US' || selectedCountry.code === 'CA') {
      // Format: (123) 456-7890
      if (cleaned.length >= 6) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      } else if (cleaned.length >= 3) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      }
    } else if (selectedCountry.code === 'CL') {
      // Format: 9 1234 5678
      if (cleaned.length >= 5) {
        return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5, 9)}`;
      } else if (cleaned.length >= 1) {
        return `${cleaned.slice(0, 1)} ${cleaned.slice(1)}`;
      }
    } else {
      // Generic formatting with spaces every 3-4 digits
      if (cleaned.length >= 6) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
      } else if (cleaned.length >= 3) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      }
    }
    
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const fullPhone = `${selectedCountry.dialCode}${cleaned}`;
    onChangeText(fullPhone);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    
    // Update phone number with new country code
    const currentNumber = value.replace(/^\+\d+/, ''); // Remove current country code
    const newPhone = `${country.dialCode}${currentNumber}`;
    onChangeText(newPhone);
  };

  // Get display number (without country code)
  const getDisplayNumber = () => {
    if (!value) return '';
    const withoutCountryCode = value.replace(selectedCountry.dialCode, '');
    return formatPhoneNumber(withoutCountryCode);
  };

  // Prepare countries for picker
  const countries: Country[] = Object.entries(SUPPORTED_COUNTRIES || {}).map(([code, info]) => ({
    code,
    name: info.name,
    flag: info.flag,
    dialCode: info.code,
  }));

  // Sort countries: Popular first, then alphabetical
  const popularCountries = ['CL', 'US', 'AR', 'BR', 'CO', 'MX', 'PE', 'ES'];
  const sortedCountries = [
    ...countries.filter(c => popularCountries.includes(c.code)),
    ...countries.filter(c => !popularCountries.includes(c.code)).sort((a, b) => a.name.localeCompare(b.name))
  ];

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryCode}>{item.dialCode}</Text>
      </View>
      {selectedCountry.code === item.code && (
        <Text style={{ fontSize: 16, color: '#16A34A' }}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {/* Country Selector */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
          <Text style={styles.selectedCode}>{selectedCountry.dialCode}</Text>
          <Text style={{ fontSize: 12, color: '#64748B' }}>↓</Text>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          style={styles.phoneInput}
          value={getDisplayNumber()}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          returnKeyType="done"
        />
      </View>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={{ fontSize: 18, color: '#052A4A' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={sortedCountries}
            keyExtractor={(item) => item.code}
            renderItem={renderCountryItem}
            showsVerticalScrollIndicator={false}
            style={styles.countryList}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  inputError: {
    borderColor: '#E53935',
    borderWidth: 2,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    minWidth: 100,
  },
  selectedFlag: {
    fontSize: 20,
    marginRight: 6,
  },
  selectedCode: {
    fontSize: 14,
    color: '#052A4A',
    fontWeight: '500',
    marginRight: 4,
    flex: 1,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#052A4A',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#052A4A',
  },
  closeButton: {
    padding: 4,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#052A4A',
    marginBottom: 2,
  },
  countryCode: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default PhoneInput;