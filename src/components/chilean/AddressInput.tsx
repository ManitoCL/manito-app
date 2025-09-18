/**
 * Chilean Address Input Components
 *
 * Provides hierarchical address selection (Region -> Province -> Comuna)
 * and street address input for complete Chilean addresses
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { Input } from '../ui/Input';
import {
  Region,
  Province,
  Comuna,
  CHILEAN_REGIONS,
  getProvincesByRegion,
  getComunasByProvince,
  getComunasByRegion,
  searchComunas,
  getFullAddress,
  formatAddress,
  isPremiumComuna,
  isPopularServiceArea
} from '../../utils/chilean/addressData';
import { colors, typography, spacing, borderRadius } from '../../design/tokens';

export interface ChileanAddress {
  regionCode?: string;
  provinceCode?: string;
  comunaCode?: string;
  street?: string;
  streetNumber?: string;
  apartment?: string;
  complement?: string;
}

interface AddressInputProps {
  value: ChileanAddress;
  onChange: (address: ChileanAddress) => void;
  showStreetAddress?: boolean;
  disabled?: boolean;
  style?: any;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  showStreetAddress = true,
  disabled = false,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'region' | 'province' | 'comuna'>('region');
  const [searchQuery, setSearchQuery] = useState('');

  // Get current selections
  const selectedRegion = CHILEAN_REGIONS.find(r => r.code === value.regionCode);
  const availableProvinces = value.regionCode ? getProvincesByRegion(value.regionCode) : [];
  const selectedProvince = availableProvinces.find(p => p.code === value.provinceCode);
  const availableComunas = value.provinceCode ? getComunasByProvince(value.provinceCode) : [];
  const selectedComuna = availableComunas.find(c => c.code === value.comunaCode);

  // Handle region selection
  const handleRegionSelect = useCallback((region: Region) => {
    onChange({
      regionCode: region.code,
      provinceCode: undefined,
      comunaCode: undefined,
      street: value.street,
      streetNumber: value.streetNumber,
      apartment: value.apartment,
      complement: value.complement,
    });
    setModalVisible(false);
  }, [onChange, value]);

  // Handle province selection
  const handleProvinceSelect = useCallback((province: Province) => {
    onChange({
      ...value,
      provinceCode: province.code,
      comunaCode: undefined,
    });
    setModalVisible(false);
  }, [onChange, value]);

  // Handle comuna selection
  const handleComunaSelect = useCallback((comuna: Comuna) => {
    onChange({
      ...value,
      comunaCode: comuna.code,
    });
    setModalVisible(false);
  }, [onChange, value]);

  // Handle street address changes
  const handleStreetChange = useCallback((field: keyof ChileanAddress, text: string) => {
    onChange({
      ...value,
      [field]: text,
    });
  }, [onChange, value]);

  // Open modal for selection
  const openModal = useCallback((type: 'region' | 'province' | 'comuna') => {
    if (disabled) return;

    if (type === 'province' && !value.regionCode) {
      Alert.alert('Selecciona una región', 'Primero debes seleccionar una región');
      return;
    }

    if (type === 'comuna' && !value.provinceCode) {
      Alert.alert('Selecciona una provincia', 'Primero debes seleccionar una provincia');
      return;
    }

    setModalType(type);
    setSearchQuery('');
    setModalVisible(true);
  }, [disabled, value.regionCode, value.provinceCode]);

  // Get data for modal based on type
  const getModalData = () => {
    switch (modalType) {
      case 'region':
        return CHILEAN_REGIONS.map(region => ({
          id: region.code,
          name: `${region.number} - ${region.name}`,
          subtitle: '',
          item: region,
        }));

      case 'province':
        return availableProvinces.map(province => ({
          id: province.code,
          name: province.name,
          subtitle: selectedRegion?.name || '',
          item: province,
        }));

      case 'comuna':
        let comunas = availableComunas;

        // Filter by search query if provided
        if (searchQuery.trim()) {
          comunas = searchComunas(searchQuery);
          // Filter by selected province if one is selected
          if (value.provinceCode) {
            comunas = comunas.filter(c => c.provinceCode === value.provinceCode);
          }
        }

        return comunas.map(comuna => ({
          id: comuna.code,
          name: comuna.name,
          subtitle: getSubtitle(comuna),
          item: comuna,
          isPremium: isPremiumComuna(comuna.name),
          isPopular: isPopularServiceArea(comuna.name),
        }));

      default:
        return [];
    }
  };

  const getSubtitle = (comuna: Comuna) => {
    const province = availableProvinces.find(p => p.code === comuna.provinceCode);
    return province ? province.name : '';
  };

  // Handle item selection in modal
  const handleModalSelect = useCallback((item: any) => {
    switch (modalType) {
      case 'region':
        handleRegionSelect(item);
        break;
      case 'province':
        handleProvinceSelect(item);
        break;
      case 'comuna':
        handleComunaSelect(item);
        break;
    }
  }, [modalType, handleRegionSelect, handleProvinceSelect, handleComunaSelect]);

  // Get modal title
  const getModalTitle = () => {
    switch (modalType) {
      case 'region':
        return 'Seleccionar Región';
      case 'province':
        return 'Seleccionar Provincia';
      case 'comuna':
        return 'Seleccionar Comuna';
      default:
        return '';
    }
  };

  // Render modal item
  const renderModalItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        item.isPremium && styles.premiumItem,
        item.isPopular && styles.popularItem,
      ]}
      onPress={() => handleModalSelect(item.item)}
    >
      <View style={styles.modalItemContent}>
        <Text style={styles.modalItemName}>
          {item.name}
          {item.isPremium && ' ⭐'}
          {item.isPopular && ' 🔥'}
        </Text>
        {item.subtitle && (
          <Text style={styles.modalItemSubtitle}>{item.subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>Dirección</Text>

      {/* Region Selection */}
      <TouchableOpacity
        style={[styles.selector, disabled && styles.selectorDisabled]}
        onPress={() => openModal('region')}
        disabled={disabled}
      >
        <Text style={[styles.selectorLabel, disabled && styles.selectorLabelDisabled]}>
          Región
        </Text>
        <Text style={[
          styles.selectorValue,
          !selectedRegion && styles.selectorPlaceholder,
          disabled && styles.selectorValueDisabled
        ]}>
          {selectedRegion ? `${selectedRegion.number} - ${selectedRegion.name}` : 'Seleccionar región'}
        </Text>
        <Text style={styles.selectorArrow}>▼</Text>
      </TouchableOpacity>

      {/* Province Selection */}
      <TouchableOpacity
        style={[
          styles.selector,
          !value.regionCode && styles.selectorDisabled,
          disabled && styles.selectorDisabled
        ]}
        onPress={() => openModal('province')}
        disabled={!value.regionCode || disabled}
      >
        <Text style={[
          styles.selectorLabel,
          (!value.regionCode || disabled) && styles.selectorLabelDisabled
        ]}>
          Provincia
        </Text>
        <Text style={[
          styles.selectorValue,
          !selectedProvince && styles.selectorPlaceholder,
          (!value.regionCode || disabled) && styles.selectorValueDisabled
        ]}>
          {selectedProvince ? selectedProvince.name : 'Seleccionar provincia'}
        </Text>
        <Text style={styles.selectorArrow}>▼</Text>
      </TouchableOpacity>

      {/* Comuna Selection */}
      <TouchableOpacity
        style={[
          styles.selector,
          !value.provinceCode && styles.selectorDisabled,
          disabled && styles.selectorDisabled
        ]}
        onPress={() => openModal('comuna')}
        disabled={!value.provinceCode || disabled}
      >
        <Text style={[
          styles.selectorLabel,
          (!value.provinceCode || disabled) && styles.selectorLabelDisabled
        ]}>
          Comuna
        </Text>
        <Text style={[
          styles.selectorValue,
          !selectedComuna && styles.selectorPlaceholder,
          (!value.provinceCode || disabled) && styles.selectorValueDisabled
        ]}>
          {selectedComuna ? selectedComuna.name : 'Seleccionar comuna'}
        </Text>
        <Text style={styles.selectorArrow}>▼</Text>
      </TouchableOpacity>

      {/* Street Address Fields */}
      {showStreetAddress && (
        <View style={styles.streetSection}>
          <View style={styles.streetRow}>
            <Input
              label="Calle"
              placeholder="Nombre de la calle"
              value={value.street || ''}
              onChangeText={(text) => handleStreetChange('street', text)}
              style={styles.streetInput}
              editable={!disabled}
            />
            <Input
              label="Número"
              placeholder="123"
              value={value.streetNumber || ''}
              onChangeText={(text) => handleStreetChange('streetNumber', text)}
              keyboardType="numeric"
              style={styles.numberInput}
              editable={!disabled}
            />
          </View>

          <Input
            label="Departamento/Oficina (Opcional)"
            placeholder="Depto 4B, Oficina 201, etc."
            value={value.apartment || ''}
            onChangeText={(text) => handleStreetChange('apartment', text)}
            editable={!disabled}
          />

          <Input
            label="Complemento (Opcional)"
            placeholder="Referencias adicionales"
            value={value.complement || ''}
            onChangeText={(text) => handleStreetChange('complement', text)}
            multiline
            numberOfLines={2}
            editable={!disabled}
          />
        </View>
      )}

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getModalTitle()}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search for comunas */}
            {modalType === 'comuna' && (
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar comuna..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="words"
                />
              </View>
            )}

            <FlatList
              data={getModalData()}
              renderItem={renderModalItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Simplified Comuna-only selector for quick selection
interface ComunaSelectorProps {
  value?: string; // comuna code
  onChange: (comunaCode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: any;
}

export const ComunaSelector: React.FC<ComunaSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Seleccionar comuna',
  disabled = false,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedComuna = value ? CHILEAN_REGIONS.flatMap(r =>
    getComunasByRegion(r.code)
  ).find(c => c.code === value) : undefined;

  const handleSelect = useCallback((comuna: Comuna) => {
    onChange(comuna.code);
    setModalVisible(false);
  }, [onChange]);

  const filteredComunas = useMemo(() => {
    let allComunas = CHILEAN_REGIONS.flatMap(r => getComunasByRegion(r.code));

    if (searchQuery.trim()) {
      console.log('🔍 Searching for:', searchQuery);
      allComunas = searchComunas(searchQuery.trim());
      console.log('🔍 Found comunas:', allComunas.length, allComunas.map(c => c.name));
    }

    // Sort results: popular first, then premium, then alphabetical
    const results = allComunas
      .map(comuna => ({
        id: comuna.code,
        name: comuna.name,
        subtitle: formatAddress(comuna.code, false),
        item: comuna,
        isPremium: isPremiumComuna(comuna.name),
        isPopular: isPopularServiceArea(comuna.name),
      }))
      .sort((a, b) => {
        // Popular areas first
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;

        // Then premium areas
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;

        // Finally alphabetical
        return a.name.localeCompare(b.name);
      });

    console.log('📍 Final comuna results:', results.length);
    return results;
  }, [searchQuery]); // Only recalculate when searchQuery changes

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        item.isPremium && styles.premiumItem,
        item.isPopular && styles.popularItem,
      ]}
      onPress={() => handleSelect(item.item)}
    >
      <View style={styles.modalItemContent}>
        <Text style={styles.modalItemName}>
          {item.name}
          {item.isPremium && ' ⭐'}
          {item.isPopular && ' 🔥'}
        </Text>
        <Text style={styles.modalItemSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  const openComunaModal = () => {
    setSearchQuery(''); // Clear search when opening
    setModalVisible(true);
  };

  return (
    <View style={style}>
      <TouchableOpacity
        style={[styles.selector, disabled && styles.selectorDisabled]}
        onPress={openComunaModal}
        disabled={disabled}
      >
        <Text style={[styles.selectorLabel, disabled && styles.selectorLabelDisabled]}>
          Comuna
        </Text>
        <Text style={[
          styles.selectorValue,
          !selectedComuna && styles.selectorPlaceholder,
          disabled && styles.selectorValueDisabled
        ]}>
          {selectedComuna ? selectedComuna.name : placeholder}
        </Text>
        <Text style={styles.selectorArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Comuna</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar comuna..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="words"
                autoFocus={true}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
            </View>

            <FlatList
              data={filteredComunas}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[4],
  },
  selector: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.primary,
    padding: spacing[4],
    marginBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  selectorLabel: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: '500',
    color: colors.neutral[700],
    minWidth: 80,
  },
  selectorLabelDisabled: {
    color: colors.neutral[400],
  },
  selectorValue: {
    flex: 1,
    fontSize: typography.fontSize.base.size,
    color: colors.neutral[900],
    marginLeft: spacing[2],
  },
  selectorPlaceholder: {
    color: colors.neutral[500],
  },
  selectorValueDisabled: {
    color: colors.neutral[400],
  },
  selectorArrow: {
    fontSize: 12,
    color: colors.neutral[400],
  },
  streetSection: {
    marginTop: spacing[2],
  },
  streetRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  streetInput: {
    flex: 2,
  },
  numberInput: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '80%', // Fixed height for better UX
    minHeight: '80%', // Ensure it always takes up 80% of screen
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  modalCloseButton: {
    padding: spacing[2],
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.neutral[500],
  },
  searchContainer: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.primary,
    padding: spacing[3],
    fontSize: typography.fontSize.base.size,
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  premiumItem: {
    backgroundColor: '#FEF3C7', // Light yellow
  },
  popularItem: {
    backgroundColor: '#DBEAFE', // Light blue
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemName: {
    fontSize: typography.fontSize.base.size,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  modalItemSubtitle: {
    fontSize: typography.fontSize.sm.size,
    color: colors.neutral[600],
    marginTop: spacing[1],
  },
});

// Export utilities for external use
export {
  formatAddress,
  getFullAddress,
  isPremiumComuna,
  isPopularServiceArea,
  searchComunas
} from '../../utils/chilean/addressData';