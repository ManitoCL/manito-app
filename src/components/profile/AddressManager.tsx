// =============================================================================
// ADDRESS MANAGER COMPONENT - COMPREHENSIVE ADDRESS MANAGEMENT
// Epic #2: Profile Management - Address Management Features
// =============================================================================
// Advanced address management with multiple addresses, building access, and parking
// Integrates with existing Chilean comuna system and enterprise patterns
// Author: Frontend UI Expert
// Created: 2025-09-19

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

// Chilean address components
import { AddressInput, ComunaSelector, ChileanAddress } from '../chilean/AddressInput';

// UI components
import { AutofillAwareInput } from '../ui/AutofillAwareInput';
import { Button } from '../ui/Button';

// Enterprise auth hooks
import { useEnterpriseAuth, useProfileData } from '../../hooks/useEnterpriseAuth';

// Types and validation
import { validateChileanName } from '../../utils/chileanValidation';

const { width: screenWidth } = Dimensions.get('window');

// =============================================================================
// INTERFACES
// =============================================================================

export interface ManitoAddress {
  id?: string;
  label: string; // "Casa", "Trabajo", "Casa de mi mamá", etc.
  chileanAddress: ChileanAddress;
  buildingAccess?: string; // Instructions for entering building
  parkingInstructions?: string; // Parking availability and instructions
  specialInstructions?: string; // Additional notes for service providers
  isDefault: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AddressFormData {
  label: string;
  chileanAddress: ChileanAddress;
  buildingAccess: string;
  parkingInstructions: string;
  specialInstructions: string;
}

// =============================================================================
// ADDRESS MANAGER COMPONENT
// =============================================================================

interface AddressManagerProps {
  addresses?: ManitoAddress[];
  onAddressesChange?: (addresses: ManitoAddress[]) => void;
  maxAddresses?: number;
  showHeader?: boolean;
  editable?: boolean;
}

export const AddressManager: React.FC<AddressManagerProps> = ({
  addresses = [],
  onAddressesChange,
  maxAddresses = 5,
  showHeader = true,
  editable = true,
}) => {
  const { user } = useEnterpriseAuth();
  const { profile } = useProfileData();

  // State
  const [localAddresses, setLocalAddresses] = useState<ManitoAddress[]>(addresses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ManitoAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    label: '',
    chileanAddress: {},
    buildingAccess: '',
    parkingInstructions: '',
    specialInstructions: '',
  });

  // Form refs
  const formRefs = {
    label: useRef<TextInput>(null),
    buildingAccess: useRef<TextInput>(null),
    parkingInstructions: useRef<TextInput>(null),
    specialInstructions: useRef<TextInput>(null),
  };

  // =============================================================================
  // COMPUTED STATE
  // =============================================================================

  const canAddMore = localAddresses.length < maxAddresses;
  const defaultAddress = localAddresses.find(addr => addr.isDefault);
  const activeAddresses = localAddresses.filter(addr => addr.isActive);

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  const resetForm = () => {
    setFormData({
      label: '',
      chileanAddress: {},
      buildingAccess: '',
      parkingInstructions: '',
      specialInstructions: '',
    });
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (address: ManitoAddress) => {
    setFormData({
      label: address.label,
      chileanAddress: address.chileanAddress,
      buildingAccess: address.buildingAccess || '',
      parkingInstructions: address.parkingInstructions || '',
      specialInstructions: address.specialInstructions || '',
    });
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleInputChange = (field: keyof AddressFormData, value: string | ChileanAddress) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // =============================================================================
  // ADDRESS OPERATIONS
  // =============================================================================

  const validateForm = (): boolean => {
    if (!formData.label.trim()) {
      Alert.alert('Error', 'El nombre de la dirección es requerido');
      formRefs.label.current?.focus();
      return false;
    }

    const nameValidation = validateChileanName(formData.label);
    if (!nameValidation.isValid) {
      Alert.alert('Error', nameValidation.error);
      formRefs.label.current?.focus();
      return false;
    }

    if (!formData.chileanAddress.comunaCode) {
      Alert.alert('Error', 'Debes seleccionar al menos una comuna');
      return false;
    }

    return true;
  };

  const saveAddress = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const newAddress: ManitoAddress = {
        id: editingAddress?.id || `addr_${Date.now()}`,
        label: formData.label.trim(),
        chileanAddress: formData.chileanAddress,
        buildingAccess: formData.buildingAccess.trim() || undefined,
        parkingInstructions: formData.parkingInstructions.trim() || undefined,
        specialInstructions: formData.specialInstructions.trim() || undefined,
        isDefault: localAddresses.length === 0, // First address is default
        isActive: true,
        createdAt: editingAddress?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      let updatedAddresses: ManitoAddress[];

      if (editingAddress) {
        // Update existing address
        updatedAddresses = localAddresses.map(addr =>
          addr.id === editingAddress.id ? newAddress : addr
        );
      } else {
        // Add new address
        updatedAddresses = [...localAddresses, newAddress];
      }

      setLocalAddresses(updatedAddresses);
      onAddressesChange?.(updatedAddresses);

      // TODO: Save to backend
      console.log('Saving address:', newAddress);

      closeModal();
      Alert.alert('Éxito', editingAddress ? 'Dirección actualizada' : 'Dirección agregada');
    } catch (error) {
      console.error('Address save error:', error);
      Alert.alert('Error', 'No se pudo guardar la dirección. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = (addressId: string) => {
    Alert.alert(
      'Eliminar Dirección',
      '¿Estás seguro de que quieres eliminar esta dirección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedAddresses = localAddresses.filter(addr => addr.id !== addressId);

            // If we deleted the default address, make the first remaining address default
            if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isDefault)) {
              updatedAddresses[0].isDefault = true;
            }

            setLocalAddresses(updatedAddresses);
            onAddressesChange?.(updatedAddresses);

            // TODO: Delete from backend
            console.log('Deleting address:', addressId);
          },
        },
      ]
    );
  };

  const setDefaultAddress = (addressId: string) => {
    const updatedAddresses = localAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));

    setLocalAddresses(updatedAddresses);
    onAddressesChange?.(updatedAddresses);

    // TODO: Update backend
    console.log('Setting default address:', addressId);
  };

  const toggleAddressActive = (addressId: string) => {
    const updatedAddresses = localAddresses.map(addr =>
      addr.id === addressId ? { ...addr, isActive: !addr.isActive } : addr
    );

    setLocalAddresses(updatedAddresses);
    onAddressesChange?.(updatedAddresses);

    // TODO: Update backend
    console.log('Toggling address active:', addressId);
  };

  // =============================================================================
  // RENDER METHODS
  // =============================================================================

  const renderAddressCard = (address: ManitoAddress) => {
    const comunaName = address.chileanAddress.comunaCode ?
      // TODO: Get comuna name from code
      'Comuna seleccionada' : 'Sin comuna';

    const fullAddress = [
      address.chileanAddress.street,
      address.chileanAddress.streetNumber,
      address.chileanAddress.apartment,
      comunaName,
    ].filter(Boolean).join(', ');

    return (
      <View key={address.id} style={[
        styles.addressCard,
        address.isDefault && styles.defaultAddressCard,
        !address.isActive && styles.inactiveAddressCard,
      ]}>
        <View style={styles.addressHeader}>
          <View style={styles.addressTitleContainer}>
            <Text style={[
              styles.addressLabel,
              !address.isActive && styles.inactiveText,
            ]}>
              {address.label}
            </Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Principal</Text>
              </View>
            )}
          </View>

          {editable && (
            <View style={styles.addressActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(address)}
                accessibilityLabel="Editar dirección"
              >
                <Text style={styles.actionButtonText}>✏️</Text>
              </TouchableOpacity>

              {localAddresses.length > 1 && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteAddress(address.id!)}
                  accessibilityLabel="Eliminar dirección"
                >
                  <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <Text style={[
          styles.addressText,
          !address.isActive && styles.inactiveText,
        ]}>
          {fullAddress}
        </Text>

        {address.buildingAccess && (
          <View style={styles.addressDetail}>
            <Text style={styles.addressDetailLabel}>Acceso al edificio:</Text>
            <Text style={styles.addressDetailText}>{address.buildingAccess}</Text>
          </View>
        )}

        {address.parkingInstructions && (
          <View style={styles.addressDetail}>
            <Text style={styles.addressDetailLabel}>Estacionamiento:</Text>
            <Text style={styles.addressDetailText}>{address.parkingInstructions}</Text>
          </View>
        )}

        {address.specialInstructions && (
          <View style={styles.addressDetail}>
            <Text style={styles.addressDetailLabel}>Instrucciones especiales:</Text>
            <Text style={styles.addressDetailText}>{address.specialInstructions}</Text>
          </View>
        )}

        {editable && (
          <View style={styles.addressFooter}>
            {!address.isDefault && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setDefaultAddress(address.id!)}
              >
                <Text style={styles.secondaryButtonText}>Hacer Principal</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => toggleAddressActive(address.id!)}
            >
              <Text style={styles.secondaryButtonText}>
                {address.isActive ? 'Desactivar' : 'Activar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={closeModal}
            accessibilityLabel="Cerrar"
          >
            <Text style={styles.modalCloseText}>Cancelar</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>
            {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
          </Text>

          <TouchableOpacity
            style={styles.modalSaveButton}
            onPress={saveAddress}
            disabled={isLoading}
            accessibilityLabel="Guardar dirección"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.modalSaveText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Address Label */}
          <AutofillAwareInput
            ref={formRefs.label}
            label="Nombre de la Dirección *"
            value={formData.label}
            onChangeText={(value) => handleInputChange('label', value)}
            placeholder="Ej: Casa, Trabajo, Casa de mi mamá"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => formRefs.buildingAccess.current?.focus()}
            maxLength={50}
            chileanValidation="name"
          />

          {/* Chilean Address */}
          <AddressInput
            value={formData.chileanAddress}
            onChange={(address) => handleInputChange('chileanAddress', address)}
            showStreetAddress={true}
            style={styles.addressInput}
          />

          {/* Building Access Instructions */}
          <AutofillAwareInput
            ref={formRefs.buildingAccess}
            label="Instrucciones de Acceso al Edificio"
            value={formData.buildingAccess}
            onChangeText={(value) => handleInputChange('buildingAccess', value)}
            placeholder="Ej: Timbre 123, Código 4567, Hablar con portero"
            multiline
            numberOfLines={3}
            returnKeyType="next"
            onSubmitEditing={() => formRefs.parkingInstructions.current?.focus()}
            maxLength={200}
            textAlignVertical="top"
            helpText="Ayuda a los prestadores a encontrar tu ubicación"
          />

          {/* Parking Instructions */}
          <AutofillAwareInput
            ref={formRefs.parkingInstructions}
            label="Información de Estacionamiento"
            value={formData.parkingInstructions}
            onChangeText={(value) => handleInputChange('parkingInstructions', value)}
            placeholder="Ej: Estacionamiento gratuito en calle, No hay estacionamiento"
            multiline
            numberOfLines={2}
            returnKeyType="next"
            onSubmitEditing={() => formRefs.specialInstructions.current?.focus()}
            maxLength={150}
            textAlignVertical="top"
            helpText="Información sobre disponibilidad de estacionamiento"
          />

          {/* Special Instructions */}
          <AutofillAwareInput
            ref={formRefs.specialInstructions}
            label="Instrucciones Especiales"
            value={formData.specialInstructions}
            onChangeText={(value) => handleInputChange('specialInstructions', value)}
            placeholder="Ej: Cuidado con el perro, Usar entrada trasera"
            multiline
            numberOfLines={3}
            returnKeyType="done"
            maxLength={250}
            textAlignVertical="top"
            helpText="Cualquier información adicional importante"
          />

          <View style={styles.formSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Mis Direcciones</Text>
          <Text style={styles.subtitle}>
            Gestiona tus direcciones para un servicio más rápido
          </Text>
        </View>
      )}

      {/* Addresses List */}
      <ScrollView
        style={styles.addressesList}
        contentContainerStyle={styles.addressesContent}
        showsVerticalScrollIndicator={false}
      >
        {localAddresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📍</Text>
            <Text style={styles.emptyStateTitle}>No tienes direcciones guardadas</Text>
            <Text style={styles.emptyStateText}>
              Agrega tu primera dirección para comenzar a solicitar servicios
            </Text>
          </View>
        ) : (
          localAddresses.map(renderAddressCard)
        )}

        {/* Add Address Button */}
        {editable && canAddMore && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
            accessibilityLabel="Agregar nueva dirección"
            accessibilityRole="button"
          >
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>Agregar Nueva Dirección</Text>
          </TouchableOpacity>
        )}

        {/* Address Limit Info */}
        {editable && !canAddMore && (
          <View style={styles.limitInfo}>
            <Text style={styles.limitInfoText}>
              Has alcanzado el límite de {maxAddresses} direcciones
            </Text>
          </View>
        )}
      </ScrollView>

      {renderAddModal()}
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  addressesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addressesContent: {
    paddingBottom: 100,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  defaultAddressCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f8fbff',
  },
  inactiveAddressCard: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  addressText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 12,
  },
  inactiveText: {
    color: '#666666',
  },
  addressDetail: {
    marginBottom: 8,
  },
  addressDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 2,
  },
  addressDetailText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  addressFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fbff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    marginTop: 8,
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#007AFF',
    marginRight: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  limitInfo: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  limitInfoText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCloseButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  modalSaveButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  addressInput: {
    marginBottom: 24,
  },
  formSpacer: {
    height: 40,
  },
});

export default AddressManager;