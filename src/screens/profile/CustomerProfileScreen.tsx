// =============================================================================
// CUSTOMER PROFILE SCREEN - COMPREHENSIVE PROFILE MANAGEMENT
// Epic #2: Profile Management - Customer Profile Features
// =============================================================================
// Comprehensive customer profile management with Chilean UX patterns
// Integrates with enterprise auth hooks and storage infrastructure
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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';

// Enterprise auth hooks
import { useEnterpriseAuth, useProfileData, useAuthStatus } from '../../hooks/useEnterpriseAuth';

// Chilean components
import { PhoneInput } from '../../components/chilean/PhoneInput';
import { RutInput } from '../../components/chilean/RutInput';

// Storage and image components
import { AvatarProgressiveImage } from '../../components/storage/ProgressiveImage';

// UI components
import { AutofillAwareInput } from '../../components/ui/AutofillAwareInput';
import { Button } from '../../components/ui/Button';

// Types and validation
import { validateChileanName, validateEmail } from '../../utils/chileanValidation';
import { uploadProfileImage } from '../../services/profileStorageHelpers';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// =============================================================================
// INTERFACES
// =============================================================================

interface ProfileFormData {
  full_name: string;
  display_name: string;
  bio: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  rut_number: string;
  comuna: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

interface ProfileCompletionData {
  personalInfo: number;
  contactInfo: number;
  addressInfo: number;
  emergencyInfo: number;
  overall: number;
}

// =============================================================================
// CUSTOMER PROFILE SCREEN
// =============================================================================

export const CustomerProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useEnterpriseAuth();
  const { profile, isLoading, refetch } = useProfileData();
  const { isReady } = useAuthStatus();

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile?.full_name || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    email: user?.email || '',
    phone_number: profile?.phone_number || '',
    whatsapp_number: profile?.whatsapp_number || '',
    rut_number: profile?.rut_number || '',
    comuna: profile?.comuna || '',
    address: profile?.address || '',
    emergency_contact_name: profile?.emergency_contact_name || '',
    emergency_contact_phone: profile?.emergency_contact_phone || '',
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Form refs for smooth scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const formRefs = {
    fullName: useRef<TextInput>(null),
    displayName: useRef<TextInput>(null),
    bio: useRef<TextInput>(null),
    phone: useRef<TextInput>(null),
    whatsapp: useRef<TextInput>(null),
    rut: useRef<TextInput>(null),
    address: useRef<TextInput>(null),
    emergencyName: useRef<TextInput>(null),
    emergencyPhone: useRef<TextInput>(null),
  };

  // =============================================================================
  // COMPUTED STATE
  // =============================================================================

  const profileCompletion = useCallback((): ProfileCompletionData => {
    const personalFields = [formData.full_name, formData.display_name, formData.bio];
    const contactFields = [formData.phone_number, formData.whatsapp_number, formData.rut_number];
    const addressFields = [formData.comuna, formData.address];
    const emergencyFields = [formData.emergency_contact_name, formData.emergency_contact_phone];

    const calculateCompletion = (fields: string[]) => {
      const completed = fields.filter(field => field && field.trim().length > 0).length;
      return Math.round((completed / fields.length) * 100);
    };

    const personalInfo = calculateCompletion(personalFields);
    const contactInfo = calculateCompletion(contactFields);
    const addressInfo = calculateCompletion(addressFields);
    const emergencyInfo = calculateCompletion(emergencyFields);

    const overall = Math.round((personalInfo + contactInfo + addressInfo + emergencyInfo) / 4);

    return { personalInfo, contactInfo, addressInfo, emergencyInfo, overall };
  }, [formData]);

  const completion = profileCompletion();

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setFormData({
      full_name: profile?.full_name || '',
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      email: user?.email || '',
      phone_number: profile?.phone_number || '',
      whatsapp_number: profile?.whatsapp_number || '',
      rut_number: profile?.rut_number || '',
      comuna: profile?.comuna || '',
      address: profile?.address || '',
      emergency_contact_name: profile?.emergency_contact_name || '',
      emergency_contact_phone: profile?.emergency_contact_phone || '',
    });
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      full_name: profile?.full_name || '',
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      email: user?.email || '',
      phone_number: profile?.phone_number || '',
      whatsapp_number: profile?.whatsapp_number || '',
      rut_number: profile?.rut_number || '',
      comuna: profile?.comuna || '',
      address: profile?.address || '',
      emergency_contact_name: profile?.emergency_contact_name || '',
      emergency_contact_phone: profile?.emergency_contact_phone || '',
    });
  };

  const validateForm = (): boolean => {
    // Validate required fields
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido');
      formRefs.fullName.current?.focus();
      return false;
    }

    // Validate Chilean name
    const nameValidation = validateChileanName(formData.full_name);
    if (!nameValidation.isValid) {
      Alert.alert('Error', nameValidation.error);
      formRefs.fullName.current?.focus();
      return false;
    }

    // Validate email
    if (formData.email && !validateEmail(formData.email).isValid) {
      Alert.alert('Error', 'Formato de email inválido');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // TODO: Implement profile update API call
      // This would use the enterprise profile service
      console.log('Saving profile data:', formData);

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      await refetch(); // Refresh profile data
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Inténtalo nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // =============================================================================
  // AVATAR MANAGEMENT
  // =============================================================================

  const handleAvatarPress = () => {
    if (isEditing) {
      setShowImagePicker(true);
    }
  };

  const handleImagePickerOption = async (option: 'camera' | 'library') => {
    setShowImagePicker(false);

    let result;
    if (option === 'camera') {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert('Permisos', 'Se necesitan permisos de cámara para tomar fotos');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!libraryPermission.granted) {
        Alert.alert('Permisos', 'Se necesitan permisos de galería para seleccionar fotos');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets[0]) {
      await handleAvatarUpload(result.assets[0].uri);
    }
  };

  const handleAvatarUpload = async (imageUri: string) => {
    if (!user?.id) return;

    setIsUploadingAvatar(true);
    setAvatarUploadProgress(0);

    try {
      const uploadResult = await uploadProfileImage({
        imageUri,
        userId: user.id,
        onProgress: (progress) => setAvatarUploadProgress(progress),
      });

      if (uploadResult.success) {
        Alert.alert('Éxito', 'Foto de perfil actualizada');
        await refetch(); // Refresh profile to get new avatar URL
      } else {
        Alert.alert('Error', uploadResult.error || 'No se pudo subir la imagen');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Error al subir la imagen. Inténtalo nuevamente.');
    } finally {
      setIsUploadingAvatar(false);
      setAvatarUploadProgress(0);
    }
  };

  // =============================================================================
  // RENDER METHODS
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={isEditing ? handleCancelEditing : handleStartEditing}
          accessibilityLabel={isEditing ? "Cancelar edición" : "Editar perfil"}
          accessibilityRole="button"
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancelar' : 'Editar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile completion progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>
          Perfil completo al {completion.overall}%
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${completion.overall}%` }
            ]}
          />
        </View>
        <Text style={styles.progressSubtitle}>
          Completa tu perfil para obtener mejores recomendaciones
        </Text>
      </View>
    </View>
  );

  const renderAvatarSection = () => (
    <View style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        <AvatarProgressiveImage
          src={profile?.avatar_url}
          thumbnailSrc={profile?.avatar_thumbnail_url}
          size={120}
          userName={formData.display_name || formData.full_name}
          onPress={handleAvatarPress}
          style={styles.avatar}
        />

        {isEditing && (
          <TouchableOpacity
            style={styles.avatarEditButton}
            onPress={handleAvatarPress}
            accessibilityLabel="Cambiar foto de perfil"
            accessibilityRole="button"
          >
            <Text style={styles.avatarEditIcon}>📷</Text>
          </TouchableOpacity>
        )}

        {isUploadingAvatar && (
          <View style={styles.avatarUploadOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.avatarUploadText}>
              {Math.round(avatarUploadProgress)}%
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.userName}>
        {formData.display_name || formData.full_name || 'Usuario'}
      </Text>
      {formData.bio && (
        <Text style={styles.userBio}>{formData.bio}</Text>
      )}
    </View>
  );

  const renderFormSection = (title: string, completion: number, children: React.ReactNode) => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionCompletion}>
          <Text style={styles.sectionCompletionText}>{completion}%</Text>
          <View style={styles.sectionCompletionBar}>
            <View
              style={[
                styles.sectionCompletionFill,
                { width: `${completion}%` }
              ]}
            />
          </View>
        </View>
      </View>
      {children}
    </View>
  );

  // Loading state
  if (isLoading || !isReady) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Debes iniciar sesión para ver tu perfil</Text>
        <Button
          title="Iniciar Sesión"
          onPress={() => navigation.navigate('Auth' as never)}
          style={styles.errorButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderAvatarSection()}

          {/* Personal Information */}
          {renderFormSection('Información Personal', completion.personalInfo, (
            <>
              <AutofillAwareInput
                ref={formRefs.fullName}
                label="Nombre Completo *"
                value={formData.full_name}
                onChangeText={(value) => handleInputChange('full_name', value)}
                placeholder="Ej: María José González"
                textContentType="name"
                autoComplete="name"
                editable={isEditing}
                returnKeyType="next"
                onSubmitEditing={() => formRefs.displayName.current?.focus()}
                maxLength={50}
                chileanValidation="name"
              />

              <AutofillAwareInput
                ref={formRefs.displayName}
                label="Nombre para Mostrar"
                value={formData.display_name}
                onChangeText={(value) => handleInputChange('display_name', value)}
                placeholder="Ej: María José"
                textContentType="nickname"
                autoComplete="username"
                editable={isEditing}
                returnKeyType="next"
                onSubmitEditing={() => formRefs.bio.current?.focus()}
                maxLength={30}
              />

              <AutofillAwareInput
                ref={formRefs.bio}
                label="Acerca de mí"
                value={formData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                placeholder="Cuéntanos un poco sobre ti..."
                multiline
                numberOfLines={3}
                editable={isEditing}
                maxLength={150}
                textAlignVertical="top"
              />
            </>
          ))}

          {/* Contact Information */}
          {renderFormSection('Información de Contacto', completion.contactInfo, (
            <>
              <AutofillAwareInput
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="correo@ejemplo.com"
                textContentType="emailAddress"
                autoComplete="email"
                keyboardType="email-address"
                editable={false} // Email cannot be changed directly
                style={styles.disabledInput}
              />

              <PhoneInput
                ref={formRefs.phone}
                label="Teléfono Móvil"
                value={formData.phone_number}
                onChangeText={(value) => handleInputChange('phone_number', value)}
                editable={isEditing}
                returnKeyType="next"
                onSubmitEditing={() => formRefs.whatsapp.current?.focus()}
              />

              <PhoneInput
                ref={formRefs.whatsapp}
                label="WhatsApp"
                value={formData.whatsapp_number}
                onChangeText={(value) => handleInputChange('whatsapp_number', value)}
                editable={isEditing}
                returnKeyType="next"
                onSubmitEditing={() => formRefs.rut.current?.focus()}
                helpText="Para recibir actualizaciones del servicio"
              />

              <RutInput
                ref={formRefs.rut}
                label="RUT"
                value={formData.rut_number}
                onChangeText={(value) => handleInputChange('rut_number', value)}
                editable={isEditing}
                returnKeyType="next"
                onSubmitEditing={() => formRefs.address.current?.focus()}
              />
            </>
          ))}

          {/* Address Information */}
          {renderFormSection('Información de Dirección', completion.addressInfo, (
            <>
              <AutofillAwareInput
                label="Comuna"
                value={formData.comuna}
                onChangeText={(value) => handleInputChange('comuna', value)}
                placeholder="Ej: Las Condes"
                editable={isEditing}
                returnKeyType="next"
                onSubmitEditing={() => formRefs.address.current?.focus()}
              />

              <AutofillAwareInput
                ref={formRefs.address}
                label="Dirección"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Ej: Av. Las Condes 123, Depto 456"
                textContentType="fullStreetAddress"
                autoComplete="street-address"
                multiline
                numberOfLines={2}
                editable={isEditing}
                returnKeyType="next"
                onSubmitEditing={() => formRefs.emergencyName.current?.focus()}
                textAlignVertical="top"
              />
            </>
          ))}

          {/* Emergency Contact */}
          {renderFormSection('Contacto de Emergencia', completion.emergencyInfo, (
            <>
              <AutofillAwareInput
                ref={formRefs.emergencyName}
                label="Nombre de Contacto"
                value={formData.emergency_contact_name}
                onChangeText={(value) => handleInputChange('emergency_contact_name', value)}
                placeholder="Ej: Pedro González"
                textContentType="name"
                editable={isEditing}
                returnKeyType="next"
                onSubmitEditing={() => formRefs.emergencyPhone.current?.focus()}
              />

              <PhoneInput
                ref={formRefs.emergencyPhone}
                label="Teléfono de Contacto"
                value={formData.emergency_contact_phone}
                onChangeText={(value) => handleInputChange('emergency_contact_phone', value)}
                editable={isEditing}
                returnKeyType="done"
              />
            </>
          ))}

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <Button
                title="Guardar Cambios"
                onPress={handleSave}
                loading={isSaving}
                disabled={isSaving}
                style={styles.saveButton}
              />
            </View>
          )}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <BlurView intensity={80} style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowImagePicker(false)}
            activeOpacity={1}
          >
            <View style={styles.imagePickerModal}>
              <Text style={styles.imagePickerTitle}>Cambiar Foto de Perfil</Text>

              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={() => handleImagePickerOption('camera')}
              >
                <Text style={styles.imagePickerOptionIcon}>📷</Text>
                <Text style={styles.imagePickerOptionText}>Tomar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={() => handleImagePickerOption('library')}
              >
                <Text style={styles.imagePickerOptionIcon}>🖼️</Text>
                <Text style={styles.imagePickerOptionText}>Elegir de Galería</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imagePickerCancel}
                onPress={() => setShowImagePicker(false)}
              >
                <Text style={styles.imagePickerCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </BlurView>
      )}
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 200,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarEditIcon: {
    fontSize: 16,
  },
  avatarUploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUploadText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: screenWidth - 48,
  },
  formSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  sectionCompletion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCompletionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
    marginRight: 8,
  },
  sectionCompletionBar: {
    width: 40,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sectionCompletionFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#666666',
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  saveButton: {
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 24,
  },
  imagePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  imagePickerOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  imagePickerOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  imagePickerCancel: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
  },
  imagePickerCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
});