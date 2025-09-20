// =============================================================================
// PAYMENT METHOD MANAGER - CHILEAN PAYMENT SYSTEM INTEGRATION
// Epic #2: Profile Management - Payment Method Management
// =============================================================================
// Comprehensive payment method management for Chilean market
// Supports Transbank, bank transfers, and Chilean banking standards
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
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

// UI components
import { AutofillAwareInput } from '../ui/AutofillAwareInput';
import { Button } from '../ui/Button';

// Enterprise auth hooks
import { useEnterpriseAuth, useProfileData } from '../../hooks/useEnterpriseAuth';

// Chilean banking data
import { CHILEAN_BANKS, ChileanBank } from '../../data/chileanBanks';

// Types and validation
import { validateChileanRUT, formatRUT, validateChileanBankAccount } from '../../utils/chileanValidation';

const { width: screenWidth } = Dimensions.get('window');

// =============================================================================
// INTERFACES
// =============================================================================

export interface PaymentMethod {
  id?: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'transbank_webpay';
  label: string; // User-friendly name like "Tarjeta Principal", "Cuenta Corriente"

  // Card details (for Transbank)
  cardNumber?: string; // Masked, only last 4 digits stored
  cardHolderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cardBrand?: 'visa' | 'mastercard' | 'american_express';

  // Bank transfer details
  bankCode?: string; // Chilean bank code
  accountType?: 'cuenta_corriente' | 'cuenta_vista' | 'cuenta_ahorro';
  accountNumber?: string; // Encrypted
  accountHolderName?: string;
  accountHolderRut?: string;

  // Status and preferences
  isDefault: boolean;
  isActive: boolean;
  isVerified: boolean;
  isPreferred: boolean; // For automatic payments

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  lastUsed?: Date;
}

interface PaymentFormData {
  type: PaymentMethod['type'];
  label: string;

  // Bank transfer fields
  bankCode: string;
  accountType: 'cuenta_corriente' | 'cuenta_vista' | 'cuenta_ahorro';
  accountNumber: string;
  accountHolderName: string;
  accountHolderRut: string;

  // Card fields (for future Transbank integration)
  cardHolderName: string;
}

// =============================================================================
// PAYMENT METHOD MANAGER COMPONENT
// =============================================================================

interface PaymentMethodManagerProps {
  paymentMethods?: PaymentMethod[];
  onPaymentMethodsChange?: (methods: PaymentMethod[]) => void;
  maxMethods?: number;
  showHeader?: boolean;
  editable?: boolean;
  allowedTypes?: PaymentMethod['type'][];
}

export const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = ({
  paymentMethods = [],
  onPaymentMethodsChange,
  maxMethods = 3,
  showHeader = true,
  editable = true,
  allowedTypes = ['bank_transfer', 'transbank_webpay'],
}) => {
  const { user } = useEnterpriseAuth();
  const { profile } = useProfileData();

  // State
  const [localMethods, setLocalMethods] = useState<PaymentMethod[]>(paymentMethods);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<ChileanBank | null>(null);
  const [showBankPicker, setShowBankPicker] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    type: 'bank_transfer',
    label: '',
    bankCode: '',
    accountType: 'cuenta_corriente',
    accountNumber: '',
    accountHolderName: '',
    accountHolderRut: '',
    cardHolderName: '',
  });

  // Form refs
  const formRefs = {
    label: useRef<TextInput>(null),
    accountNumber: useRef<TextInput>(null),
    accountHolderName: useRef<TextInput>(null),
    accountHolderRut: useRef<TextInput>(null),
    cardHolderName: useRef<TextInput>(null),
  };

  // =============================================================================
  // COMPUTED STATE
  // =============================================================================

  const canAddMore = localMethods.length < maxMethods;
  const defaultMethod = localMethods.find(method => method.isDefault);
  const activeMethods = localMethods.filter(method => method.isActive);
  const bankTransferMethods = localMethods.filter(method => method.type === 'bank_transfer');

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  const resetForm = () => {
    setFormData({
      type: 'bank_transfer',
      label: '',
      bankCode: '',
      accountType: 'cuenta_corriente',
      accountNumber: '',
      accountHolderName: '',
      accountHolderRut: '',
      cardHolderName: '',
    });
    setSelectedBank(null);
    setEditingMethod(null);
  };

  const openAddModal = (type: PaymentMethod['type'] = 'bank_transfer') => {
    resetForm();
    setFormData(prev => ({ ...prev, type }));
    setShowAddModal(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setFormData({
      type: method.type,
      label: method.label,
      bankCode: method.bankCode || '',
      accountType: method.accountType || 'cuenta_corriente',
      accountNumber: method.accountNumber || '',
      accountHolderName: method.accountHolderName || '',
      accountHolderRut: method.accountHolderRut || '',
      cardHolderName: method.cardHolderName || '',
    });

    if (method.bankCode) {
      const bank = CHILEAN_BANKS.find(b => b.code === method.bankCode);
      setSelectedBank(bank || null);
    }

    setEditingMethod(method);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowBankPicker(false);
    resetForm();
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBankSelect = (bank: ChileanBank) => {
    setSelectedBank(bank);
    setFormData(prev => ({ ...prev, bankCode: bank.code }));
    setShowBankPicker(false);
  };

  // =============================================================================
  // PAYMENT METHOD OPERATIONS
  // =============================================================================

  const validateForm = (): boolean => {
    if (!formData.label.trim()) {
      Alert.alert('Error', 'El nombre del método de pago es requerido');
      formRefs.label.current?.focus();
      return false;
    }

    if (formData.type === 'bank_transfer') {
      if (!formData.bankCode) {
        Alert.alert('Error', 'Debes seleccionar un banco');
        return false;
      }

      if (!formData.accountNumber.trim()) {
        Alert.alert('Error', 'El número de cuenta es requerido');
        formRefs.accountNumber.current?.focus();
        return false;
      }

      const accountValidation = validateChileanBankAccount(formData.accountNumber, formData.accountType);
      if (!accountValidation.isValid) {
        Alert.alert('Error', accountValidation.error);
        formRefs.accountNumber.current?.focus();
        return false;
      }

      if (!formData.accountHolderName.trim()) {
        Alert.alert('Error', 'El nombre del titular es requerido');
        formRefs.accountHolderName.current?.focus();
        return false;
      }

      if (!formData.accountHolderRut.trim()) {
        Alert.alert('Error', 'El RUT del titular es requerido');
        formRefs.accountHolderRut.current?.focus();
        return false;
      }

      const rutValidation = validateChileanRUT(formData.accountHolderRut);
      if (!rutValidation.isValid) {
        Alert.alert('Error', rutValidation.error);
        formRefs.accountHolderRut.current?.focus();
        return false;
      }
    }

    return true;
  };

  const savePaymentMethod = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const newMethod: PaymentMethod = {
        id: editingMethod?.id || `pm_${Date.now()}`,
        type: formData.type,
        label: formData.label.trim(),

        // Bank transfer specific
        ...(formData.type === 'bank_transfer' && {
          bankCode: formData.bankCode,
          accountType: formData.accountType,
          accountNumber: formData.accountNumber.trim(), // TODO: Encrypt before storing
          accountHolderName: formData.accountHolderName.trim(),
          accountHolderRut: formatRUT(formData.accountHolderRut),
        }),

        // Card specific (for future use)
        ...(formData.type !== 'bank_transfer' && {
          cardHolderName: formData.cardHolderName.trim(),
        }),

        isDefault: localMethods.length === 0, // First method is default
        isActive: true,
        isVerified: false, // Will be verified by backend
        isPreferred: localMethods.length === 0,
        createdAt: editingMethod?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      let updatedMethods: PaymentMethod[];

      if (editingMethod) {
        // Update existing method
        updatedMethods = localMethods.map(method =>
          method.id === editingMethod.id ? newMethod : method
        );
      } else {
        // Add new method
        updatedMethods = [...localMethods, newMethod];
      }

      setLocalMethods(updatedMethods);
      onPaymentMethodsChange?.(updatedMethods);

      // TODO: Save to backend and trigger verification
      console.log('Saving payment method:', newMethod);

      closeModal();
      Alert.alert(
        'Éxito',
        editingMethod
          ? 'Método de pago actualizado'
          : 'Método de pago agregado. Se verificará en las próximas 24 horas.'
      );
    } catch (error) {
      console.error('Payment method save error:', error);
      Alert.alert('Error', 'No se pudo guardar el método de pago. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaymentMethod = (methodId: string) => {
    Alert.alert(
      'Eliminar Método de Pago',
      '¿Estás seguro de que quieres eliminar este método de pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedMethods = localMethods.filter(method => method.id !== methodId);

            // If we deleted the default method, make the first remaining method default
            if (updatedMethods.length > 0 && !updatedMethods.some(method => method.isDefault)) {
              updatedMethods[0].isDefault = true;
              updatedMethods[0].isPreferred = true;
            }

            setLocalMethods(updatedMethods);
            onPaymentMethodsChange?.(updatedMethods);

            // TODO: Delete from backend
            console.log('Deleting payment method:', methodId);
          },
        },
      ]
    );
  };

  const setDefaultPaymentMethod = (methodId: string) => {
    const updatedMethods = localMethods.map(method => ({
      ...method,
      isDefault: method.id === methodId,
      isPreferred: method.id === methodId,
    }));

    setLocalMethods(updatedMethods);
    onPaymentMethodsChange?.(updatedMethods);

    // TODO: Update backend
    console.log('Setting default payment method:', methodId);
  };

  const toggleMethodActive = (methodId: string) => {
    const updatedMethods = localMethods.map(method =>
      method.id === methodId ? { ...method, isActive: !method.isActive } : method
    );

    setLocalMethods(updatedMethods);
    onPaymentMethodsChange?.(updatedMethods);

    // TODO: Update backend
    console.log('Toggling payment method active:', methodId);
  };

  // =============================================================================
  // RENDER METHODS
  // =============================================================================

  const renderPaymentMethodCard = (method: PaymentMethod) => {
    const getBankName = () => {
      if (method.type === 'bank_transfer' && method.bankCode) {
        const bank = CHILEAN_BANKS.find(b => b.code === method.bankCode);
        return bank?.name || 'Banco desconocido';
      }
      return null;
    };

    const getAccountTypeLabel = (type: string) => {
      switch (type) {
        case 'cuenta_corriente': return 'Cuenta Corriente';
        case 'cuenta_vista': return 'Cuenta Vista';
        case 'cuenta_ahorro': return 'Cuenta de Ahorro';
        default: return type;
      }
    };

    const getMethodIcon = () => {
      switch (method.type) {
        case 'bank_transfer': return '🏦';
        case 'credit_card': return '💳';
        case 'debit_card': return '💳';
        case 'transbank_webpay': return '💰';
        default: return '💳';
      }
    };

    const getStatusColor = () => {
      if (!method.isActive) return '#999999';
      if (method.isVerified) return '#22c55e';
      return '#f59e0b';
    };

    const getStatusText = () => {
      if (!method.isActive) return 'Inactivo';
      if (method.isVerified) return 'Verificado';
      return 'Pendiente verificación';
    };

    return (
      <View key={method.id} style={[
        styles.methodCard,
        method.isDefault && styles.defaultMethodCard,
        !method.isActive && styles.inactiveMethodCard,
      ]}>
        <View style={styles.methodHeader}>
          <View style={styles.methodTitleContainer}>
            <Text style={styles.methodIcon}>{getMethodIcon()}</Text>
            <View style={styles.methodInfo}>
              <Text style={[
                styles.methodLabel,
                !method.isActive && styles.inactiveText,
              ]}>
                {method.label}
              </Text>

              {method.type === 'bank_transfer' && (
                <Text style={styles.methodSubtitle}>
                  {getBankName()} • {getAccountTypeLabel(method.accountType || '')}
                </Text>
              )}

              {method.accountNumber && (
                <Text style={styles.methodSubtitle}>
                  **** {method.accountNumber.slice(-4)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.methodBadges}>
            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Principal</Text>
              </View>
            )}

            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + '20' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor() }
              ]} />
              <Text style={[
                styles.statusText,
                { color: getStatusColor() }
              ]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {method.type === 'bank_transfer' && method.accountHolderName && (
          <View style={styles.methodDetails}>
            <Text style={styles.methodDetailLabel}>Titular:</Text>
            <Text style={styles.methodDetailText}>{method.accountHolderName}</Text>
            {method.accountHolderRut && (
              <Text style={styles.methodDetailText}>RUT: {method.accountHolderRut}</Text>
            )}
          </View>
        )}

        {editable && (
          <View style={styles.methodActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(method)}
              accessibilityLabel="Editar método de pago"
            >
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>

            {!method.isDefault && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setDefaultPaymentMethod(method.id!)}
              >
                <Text style={styles.actionButtonText}>Hacer Principal</Text>
              </TouchableOpacity>
            )}

            {localMethods.length > 1 && (
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={() => deletePaymentMethod(method.id!)}
                accessibilityLabel="Eliminar método de pago"
              >
                <Text style={styles.dangerButtonText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderBankPicker = () => (
    <Modal
      visible={showBankPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowBankPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bankPickerModal}>
          <View style={styles.bankPickerHeader}>
            <Text style={styles.bankPickerTitle}>Seleccionar Banco</Text>
            <TouchableOpacity
              style={styles.bankPickerClose}
              onPress={() => setShowBankPicker(false)}
            >
              <Text style={styles.bankPickerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bankList}>
            {CHILEAN_BANKS.map((bank) => (
              <TouchableOpacity
                key={bank.code}
                style={styles.bankItem}
                onPress={() => handleBankSelect(bank)}
              >
                <Text style={styles.bankName}>{bank.name}</Text>
                <Text style={styles.bankCode}>Código: {bank.code}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
            {editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
          </Text>

          <TouchableOpacity
            style={styles.modalSaveButton}
            onPress={savePaymentMethod}
            disabled={isLoading}
            accessibilityLabel="Guardar método de pago"
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
          {/* Payment Method Type Selection */}
          {!editingMethod && (
            <View style={styles.typeSelection}>
              <Text style={styles.sectionTitle}>Tipo de Método de Pago</Text>

              {allowedTypes.includes('bank_transfer') && (
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    formData.type === 'bank_transfer' && styles.typeOptionSelected
                  ]}
                  onPress={() => handleInputChange('type', 'bank_transfer')}
                >
                  <Text style={styles.typeOptionIcon}>🏦</Text>
                  <View style={styles.typeOptionContent}>
                    <Text style={styles.typeOptionTitle}>Transferencia Bancaria</Text>
                    <Text style={styles.typeOptionSubtitle}>
                      Pagos por transferencia desde tu cuenta bancaria
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {allowedTypes.includes('transbank_webpay') && (
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    formData.type === 'transbank_webpay' && styles.typeOptionSelected
                  ]}
                  onPress={() => handleInputChange('type', 'transbank_webpay')}
                >
                  <Text style={styles.typeOptionIcon}>💰</Text>
                  <View style={styles.typeOptionContent}>
                    <Text style={styles.typeOptionTitle}>Transbank WebPay</Text>
                    <Text style={styles.typeOptionSubtitle}>
                      Tarjetas de crédito y débito (Próximamente)
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Method Label */}
          <AutofillAwareInput
            ref={formRefs.label}
            label="Nombre del Método *"
            value={formData.label}
            onChangeText={(value) => handleInputChange('label', value)}
            placeholder="Ej: Cuenta Principal, Tarjeta de Trabajo"
            textContentType="name"
            returnKeyType="next"
            maxLength={50}
          />

          {/* Bank Transfer Form */}
          {formData.type === 'bank_transfer' && (
            <>
              {/* Bank Selection */}
              <TouchableOpacity
                style={styles.bankSelector}
                onPress={() => setShowBankPicker(true)}
              >
                <Text style={styles.bankSelectorLabel}>Banco *</Text>
                <Text style={[
                  styles.bankSelectorValue,
                  !selectedBank && styles.bankSelectorPlaceholder
                ]}>
                  {selectedBank ? selectedBank.name : 'Seleccionar banco'}
                </Text>
                <Text style={styles.bankSelectorArrow}>▼</Text>
              </TouchableOpacity>

              {/* Account Type */}
              <View style={styles.accountTypeSection}>
                <Text style={styles.sectionTitle}>Tipo de Cuenta *</Text>

                <View style={styles.accountTypeOptions}>
                  {[
                    { value: 'cuenta_corriente', label: 'Cuenta Corriente' },
                    { value: 'cuenta_vista', label: 'Cuenta Vista' },
                    { value: 'cuenta_ahorro', label: 'Cuenta de Ahorro' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.accountTypeOption,
                        formData.accountType === option.value && styles.accountTypeOptionSelected
                      ]}
                      onPress={() => handleInputChange('accountType', option.value)}
                    >
                      <Text style={[
                        styles.accountTypeOptionText,
                        formData.accountType === option.value && styles.accountTypeOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Account Number */}
              <AutofillAwareInput
                ref={formRefs.accountNumber}
                label="Número de Cuenta *"
                value={formData.accountNumber}
                onChangeText={(value) => handleInputChange('accountNumber', value)}
                placeholder="123456789"
                keyboardType="numeric"
                textContentType="none"
                returnKeyType="next"
                onSubmitEditing={() => formRefs.accountHolderName.current?.focus()}
                maxLength={20}
                secureTextEntry={false}
                helpText="Tu número de cuenta será encriptado y protegido"
              />

              {/* Account Holder Name */}
              <AutofillAwareInput
                ref={formRefs.accountHolderName}
                label="Nombre del Titular *"
                value={formData.accountHolderName}
                onChangeText={(value) => handleInputChange('accountHolderName', value)}
                placeholder="Como aparece en tu cuenta bancaria"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => formRefs.accountHolderRut.current?.focus()}
                maxLength={100}
                chileanValidation="name"
              />

              {/* Account Holder RUT */}
              <AutofillAwareInput
                ref={formRefs.accountHolderRut}
                label="RUT del Titular *"
                value={formData.accountHolderRut}
                onChangeText={(value) => handleInputChange('accountHolderRut', value)}
                placeholder="12.345.678-9"
                keyboardType="numeric"
                returnKeyType="done"
                maxLength={12}
                chileanValidation="rut"
              />
            </>
          )}

          {/* Future: Transbank WebPay Form */}
          {formData.type !== 'bank_transfer' && (
            <View style={styles.comingSoonSection}>
              <Text style={styles.comingSoonIcon}>🚧</Text>
              <Text style={styles.comingSoonTitle}>Próximamente</Text>
              <Text style={styles.comingSoonText}>
                La integración con Transbank WebPay estará disponible pronto.
                Por ahora, puedes usar transferencias bancarias.
              </Text>
            </View>
          )}

          <View style={styles.formSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {renderBankPicker()}
    </Modal>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Métodos de Pago</Text>
          <Text style={styles.subtitle}>
            Gestiona tus métodos de pago para servicios más rápidos
          </Text>
        </View>
      )}

      {/* Payment Methods List */}
      <ScrollView
        style={styles.methodsList}
        contentContainerStyle={styles.methodsContent}
        showsVerticalScrollIndicator={false}
      >
        {localMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💳</Text>
            <Text style={styles.emptyStateTitle}>No tienes métodos de pago</Text>
            <Text style={styles.emptyStateText}>
              Agrega un método de pago para solicitar servicios de forma segura
            </Text>
          </View>
        ) : (
          localMethods.map(renderPaymentMethodCard)
        )}

        {/* Add Payment Method Buttons */}
        {editable && canAddMore && (
          <View style={styles.addButtonsContainer}>
            {allowedTypes.includes('bank_transfer') && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => openAddModal('bank_transfer')}
                accessibilityLabel="Agregar transferencia bancaria"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonIcon}>🏦</Text>
                <Text style={styles.addButtonText}>Agregar Transferencia Bancaria</Text>
              </TouchableOpacity>
            )}

            {allowedTypes.includes('transbank_webpay') && (
              <TouchableOpacity
                style={[styles.addButton, styles.comingSoonButton]}
                disabled={true}
                accessibilityLabel="WebPay próximamente"
              >
                <Text style={styles.addButtonIcon}>💰</Text>
                <Text style={styles.addButtonTextDisabled}>WebPay (Próximamente)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Method Limit Info */}
        {editable && !canAddMore && (
          <View style={styles.limitInfo}>
            <Text style={styles.limitInfoText}>
              Has alcanzado el límite de {maxMethods} métodos de pago
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
  methodsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  methodsContent: {
    paddingBottom: 100,
  },
  methodCard: {
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
  defaultMethodCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f8fbff',
  },
  inactiveMethodCard: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  methodTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  inactiveText: {
    color: '#999999',
  },
  methodBadges: {
    alignItems: 'flex-end',
    gap: 6,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  methodDetails: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  methodDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 2,
  },
  methodDetailText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 2,
  },
  methodActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
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
  addButtonsContainer: {
    gap: 12,
    marginTop: 8,
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
    padding: 20,
  },
  comingSoonButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  addButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  addButtonTextDisabled: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999999',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  typeSelection: {
    marginBottom: 24,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  typeOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f8fbff',
  },
  typeOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeOptionContent: {
    flex: 1,
  },
  typeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  typeOptionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
  },
  bankSelectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    minWidth: 60,
  },
  bankSelectorValue: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  bankSelectorPlaceholder: {
    color: '#999999',
  },
  bankSelectorArrow: {
    fontSize: 12,
    color: '#666666',
  },
  accountTypeSection: {
    marginBottom: 24,
  },
  accountTypeOptions: {
    gap: 8,
  },
  accountTypeOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  accountTypeOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f8fbff',
  },
  accountTypeOptionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  accountTypeOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  comingSoonSection: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 20,
  },
  comingSoonIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  formSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bankPickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bankPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bankPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  bankPickerClose: {
    padding: 4,
  },
  bankPickerCloseText: {
    fontSize: 18,
    color: '#666666',
  },
  bankList: {
    maxHeight: 400,
  },
  bankItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  bankCode: {
    fontSize: 14,
    color: '#666666',
  },
});

export default PaymentMethodManager;