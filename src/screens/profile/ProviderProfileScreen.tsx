// =============================================================================
// PROVIDER PROFILE SCREEN - COMPREHENSIVE MAESTRO PROFILE MANAGEMENT
// Epic #2: Profile Management - Provider Profile Features
// =============================================================================
// Comprehensive maestro profile management with Chilean UX patterns
// Integrates with enterprise auth hooks and verification system
// Author: Marketplace UX Specialist
// Created: 2025-09-19

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  RefreshControl,
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

// Provider-specific components
import { ServiceManager } from '../../components/provider/ServiceManager';
import { AvailabilityCalendar } from '../../components/provider/AvailabilityCalendar';
import { PricingManager } from '../../components/provider/PricingManager';
import { PortfolioUpload } from '../../components/provider/PortfolioUpload';
import { EarningsTracker } from '../../components/provider/EarningsTracker';

// Types and validation
import { validateChileanName, validateEmail } from '../../utils/chileanValidation';
import { uploadProfileImage } from '../../services/profileStorageHelpers';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// =============================================================================
// INTERFACES
// =============================================================================

interface ProviderFormData {
  // Business information
  business_name: string;
  description: string;
  full_name: string;
  display_name: string;
  bio: string;

  // Contact information
  email: string;
  phone_number: string;
  whatsapp_number: string;
  rut_number: string;

  // Location
  comuna: string;
  address: string;
  service_areas: string[];

  // Business details
  services: string[];
  specialties: string[];
  certifications: string[];
  languages: string[];
  hourly_rate_clp: number;

  // Availability
  working_hours: any;
  is_available: boolean;

  // Emergency contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

interface ProviderStats {
  total_jobs: number;
  completed_jobs: number;
  completion_rate: number;
  total_earnings: number;
  avg_rating: number;
  total_reviews: number;
  response_time_hours: number;
  portfolio_items: number;
}

interface ProfileTabType {
  id: string;
  title: string;
  icon: string;
  badge?: number;
}

// =============================================================================
// PROVIDER PROFILE SCREEN
// =============================================================================

export const ProviderProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useEnterpriseAuth();
  const { profile, providerProfile, isLoading, refetch } = useProfileData();
  const { isReady } = useAuthStatus();

  // Form state
  const [formData, setFormData] = useState<ProviderFormData>({
    business_name: providerProfile?.business_name || '',
    description: providerProfile?.description || '',
    full_name: profile?.full_name || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    email: user?.email || '',
    phone_number: profile?.phone_number || '',
    whatsapp_number: profile?.whatsapp_number || '',
    rut_number: profile?.rut_number || '',
    comuna: profile?.comuna || '',
    address: profile?.address || '',
    service_areas: providerProfile?.service_areas || [],
    services: providerProfile?.services || [],
    specialties: providerProfile?.specialties || [],
    certifications: providerProfile?.certifications || [],
    languages: providerProfile?.languages || ['EspaÒol'],
    hourly_rate_clp: providerProfile?.hourly_rate_clp || 0,
    working_hours: providerProfile?.working_hours || {},
    is_available: providerProfile?.is_available || true,
    emergency_contact_name: profile?.emergency_contact_name || '',
    emergency_contact_phone: profile?.emergency_contact_phone || '',
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Stats
  const [providerStats, setProviderStats] = useState<ProviderStats>({
    total_jobs: providerProfile?.total_jobs_completed || 0,
    completed_jobs: providerProfile?.total_jobs_completed || 0,
    completion_rate: 100,
    total_earnings: 0,
    avg_rating: providerProfile?.rating || 0,
    total_reviews: providerProfile?.total_reviews || 0,
    response_time_hours: providerProfile?.response_time_hours || 2,
    portfolio_items: 0,
  });

  // Form refs
  const scrollViewRef = useRef<ScrollView>(null);

  // =============================================================================
  // TAB CONFIGURATION
  // =============================================================================

  const tabs: ProfileTabType[] = [
    { id: 'overview', title: 'Resumen', icon: '=d' },
    { id: 'services', title: 'Servicios', icon: '°', badge: formData.services.length },
    { id: 'portfolio', title: 'Portafolio', icon: '=˜', badge: providerStats.portfolio_items },
    { id: 'availability', title: 'Disponibilidad', icon: '=≈' },
    { id: 'pricing', title: 'Precios', icon: '=∞' },
    { id: 'earnings', title: 'Ganancias', icon: '=µ' },
    { id: 'verification', title: 'VerificaciÛn', icon: '' },
  ];

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (providerProfile) {
      setFormData(prev => ({
        ...prev,
        business_name: providerProfile.business_name || '',
        description: providerProfile.description || '',
        service_areas: providerProfile.service_areas || [],
        services: providerProfile.services || [],
        specialties: providerProfile.specialties || [],
        certifications: providerProfile.certifications || [],
        languages: providerProfile.languages || ['EspaÒol'],
        hourly_rate_clp: providerProfile.hourly_rate_clp || 0,
        working_hours: providerProfile.working_hours || {},
        is_available: providerProfile.is_available || true,
      }));
    }
  }, [providerProfile]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      // TODO: Fetch provider stats
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleInputChange = (field: keyof ProviderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    // Reset form data
    if (providerProfile) {
      setFormData(prev => ({
        ...prev,
        business_name: providerProfile.business_name || '',
        description: providerProfile.description || '',
        service_areas: providerProfile.service_areas || [],
        services: providerProfile.services || [],
        specialties: providerProfile.specialties || [],
        certifications: providerProfile.certifications || [],
        languages: providerProfile.languages || ['EspaÒol'],
        hourly_rate_clp: providerProfile.hourly_rate_clp || 0,
        working_hours: providerProfile.working_hours || {},
        is_available: providerProfile.is_available || true,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.business_name.trim()) {
      Alert.alert('Error', 'El nombre del negocio es requerido');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripciÛn del negocio es requerida');
      return false;
    }

    if (formData.services.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos un servicio');
      return false;
    }

    if (formData.hourly_rate_clp <= 0) {
      Alert.alert('Error', 'Debes establecer una tarifa por hora v·lida');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // TODO: Implement provider profile update API call
      console.log('Saving provider profile data:', formData);

      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsEditing(false);
      Alert.alert('…xito', 'Perfil de proveedor actualizado correctamente');
      await refetch();
    } catch (error) {
      console.error('Provider profile save error:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. IntÈntalo nuevamente.');
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
        Alert.alert('Permisos', 'Se necesitan permisos de c·mara para tomar fotos');
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
        Alert.alert('Permisos', 'Se necesitan permisos de galerÌa para seleccionar fotos');
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
        Alert.alert('…xito', 'Foto de perfil actualizada');
        await refetch();
      } else {
        Alert.alert('Error', uploadResult.error || 'No se pudo subir la imagen');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Error al subir la imagen. IntÈntalo nuevamente.');
    } finally {
      setIsUploadingAvatar(false);
      setAvatarUploadProgress(0);
    }
  };

  // =============================================================================
  // VERIFICATION STATUS
  // =============================================================================

  const getVerificationStatus = () => {
    const status = providerProfile?.verification_status || 'pending';
    const statusConfig = {
      pending: { text: 'Pendiente', color: '#FFA500', icon: 'Û' },
      in_review: { text: 'En RevisiÛn', color: '#007AFF', icon: '=@' },
      approved: { text: 'Verificado', color: '#28A745', icon: '' },
      rejected: { text: 'Rechazado', color: '#DC3545', icon: 'L' },
    };
    return statusConfig[status] || statusConfig.pending;
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
          <Text style={styles.backButtonText}>ê</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil de Maestro</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={isEditing ? handleCancelEditing : handleStartEditing}
          accessibilityLabel={isEditing ? "Cancelar ediciÛn" : "Editar perfil"}
          accessibilityRole="button"
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancelar' : 'Editar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Verification Status */}
      <View style={styles.verificationContainer}>
        <View style={[styles.verificationBadge, { backgroundColor: getVerificationStatus().color + '20' }]}>
          <Text style={styles.verificationIcon}>{getVerificationStatus().icon}</Text>
          <Text style={[styles.verificationText, { color: getVerificationStatus().color }]}>
            {getVerificationStatus().text}
          </Text>
        </View>
        {providerProfile?.verification_status === 'pending' && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => navigation.navigate('ProviderVerification' as never)}
          >
            <Text style={styles.verifyButtonText}>Completar VerificaciÛn</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderProviderCard = () => (
    <View style={styles.providerCard}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <AvatarProgressiveImage
            src={profile?.avatar_url}
            thumbnailSrc={profile?.avatar_thumbnail_url}
            size={100}
            userName={formData.display_name || formData.business_name}
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
              <Text style={styles.avatarEditIcon}>=˜</Text>
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

        <View style={styles.providerInfo}>
          <Text style={styles.businessName}>
            {formData.business_name || 'Nombre del Negocio'}
          </Text>
          <Text style={styles.providerName}>
            {formData.display_name || formData.full_name || 'Maestro'}
          </Text>
          <Text style={styles.providerLocation}>
            {formData.comuna || 'Comuna'}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{providerStats.avg_rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>P Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{providerStats.completed_jobs}</Text>
          <Text style={styles.statLabel}>Trabajos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            ${Math.round(formData.hourly_rate_clp / 1000)}k
          </Text>
          <Text style={styles.statLabel}>CLP/hora</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{providerStats.response_time_hours}h</Text>
          <Text style={styles.statLabel}>Respuesta</Text>
        </View>
      </View>

      {/* Services Overview */}
      <View style={styles.servicesOverview}>
        <Text style={styles.servicesTitle}>Servicios Principales</Text>
        <View style={styles.servicesTags}>
          {formData.services.slice(0, 3).map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service}</Text>
            </View>
          ))}
          {formData.services.length > 3 && (
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>+{formData.services.length - 3} m·s</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.title}
            </Text>
            {tab.badge !== undefined && tab.badge > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'services':
        return (
          <ServiceManager
            services={formData.services}
            specialties={formData.specialties}
            certifications={formData.certifications}
            serviceAreas={formData.service_areas}
            onServicesChange={(services) => handleInputChange('services', services)}
            onSpecialtiesChange={(specialties) => handleInputChange('specialties', specialties)}
            onCertificationsChange={(certs) => handleInputChange('certifications', certs)}
            onServiceAreasChange={(areas) => handleInputChange('service_areas', areas)}
            isEditing={isEditing}
          />
        );
      case 'portfolio':
        return (
          <PortfolioUpload
            providerId={user?.id || ''}
            portfolioItems={[]}
            onPortfolioUpdate={() => refetch()}
            isEditing={isEditing}
          />
        );
      case 'availability':
        return (
          <AvailabilityCalendar
            workingHours={formData.working_hours}
            isAvailable={formData.is_available}
            onWorkingHoursChange={(hours) => handleInputChange('working_hours', hours)}
            onAvailabilityChange={(available) => handleInputChange('is_available', available)}
            isEditing={isEditing}
          />
        );
      case 'pricing':
        return (
          <PricingManager
            hourlyRate={formData.hourly_rate_clp}
            services={formData.services}
            onHourlyRateChange={(rate) => handleInputChange('hourly_rate_clp', rate)}
            isEditing={isEditing}
          />
        );
      case 'earnings':
        return (
          <EarningsTracker
            totalEarnings={providerStats.total_earnings}
            completedJobs={providerStats.completed_jobs}
            avgJobValue={providerStats.total_earnings / Math.max(providerStats.completed_jobs, 1)}
            monthlyEarnings={0}
          />
        );
      case 'verification':
        return renderVerificationTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Business Information */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>InformaciÛn del Negocio</Text>

        <AutofillAwareInput
          label="Nombre del Negocio *"
          value={formData.business_name}
          onChangeText={(value) => handleInputChange('business_name', value)}
          placeholder="Ej: Electricidad Gonz·lez"
          editable={isEditing}
          maxLength={50}
        />

        <AutofillAwareInput
          label="DescripciÛn del Negocio *"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          placeholder="Describe tu negocio y experiencia..."
          multiline
          numberOfLines={4}
          editable={isEditing}
          maxLength={300}
          textAlignVertical="top"
        />

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.inputLabel}>Idiomas</Text>
            <View style={styles.languageTags}>
              {formData.languages.map((lang, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageTagText}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>InformaciÛn de Contacto</Text>

        <PhoneInput
          label="TelÈfono de Trabajo"
          value={formData.phone_number}
          onChangeText={(value) => handleInputChange('phone_number', value)}
          editable={isEditing}
        />

        <PhoneInput
          label="WhatsApp de Negocios"
          value={formData.whatsapp_number}
          onChangeText={(value) => handleInputChange('whatsapp_number', value)}
          editable={isEditing}
          helpText="Para comunicaciÛn con clientes"
        />

        <AutofillAwareInput
          label="Comuna Principal"
          value={formData.comuna}
          onChangeText={(value) => handleInputChange('comuna', value)}
          placeholder="Ej: Las Condes"
          editable={isEditing}
        />
      </View>

      {/* Emergency Contact */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>

        <AutofillAwareInput
          label="Nombre del Contacto"
          value={formData.emergency_contact_name}
          onChangeText={(value) => handleInputChange('emergency_contact_name', value)}
          placeholder="Ej: MarÌa Gonz·lez"
          editable={isEditing}
        />

        <PhoneInput
          label="TelÈfono de Contacto"
          value={formData.emergency_contact_phone}
          onChangeText={(value) => handleInputChange('emergency_contact_phone', value)}
          editable={isEditing}
        />
      </View>
    </View>
  );

  const renderVerificationTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Estado de VerificaciÛn</Text>

      <View style={styles.verificationStatus}>
        <View style={[styles.verificationBadgeLarge, { backgroundColor: getVerificationStatus().color + '20' }]}>
          <Text style={styles.verificationIconLarge}>{getVerificationStatus().icon}</Text>
          <Text style={[styles.verificationTextLarge, { color: getVerificationStatus().color }]}>
            {getVerificationStatus().text}
          </Text>
        </View>

        {providerProfile?.verification_status === 'pending' && (
          <View style={styles.verificationHelp}>
            <Text style={styles.verificationHelpText}>
              Para comenzar a recibir trabajos, necesitas completar el proceso de verificaciÛn.
            </Text>
            <Button
              title="Iniciar VerificaciÛn"
              onPress={() => navigation.navigate('ProviderVerification' as never)}
              style={styles.verificationButton}
            />
          </View>
        )}

        {providerProfile?.verification_status === 'approved' && (
          <View style={styles.verificationSuccess}>
            <Text style={styles.verificationSuccessText}>
              °Felicidades! Tu cuenta est· verificada y puedes recibir trabajos.
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Loading state
  if (isLoading || !isReady) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando perfil de maestro...</Text>
      </SafeAreaView>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Debes iniciar sesiÛn para ver tu perfil</Text>
        <Button
          title="Iniciar SesiÛn"
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          }
        >
          {renderProviderCard()}
          {renderTabs()}
          {renderTabContent()}

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
                <Text style={styles.imagePickerOptionIcon}>=˜</Text>
                <Text style={styles.imagePickerOptionText}>Tomar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={() => handleImagePickerOption('library')}
              >
                <Text style={styles.imagePickerOptionIcon}>=º</Text>
                <Text style={styles.imagePickerOptionText}>Elegir de GalerÌa</Text>
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
    backgroundColor: '#f8f9fa',
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
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verificationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
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
  providerCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  avatarUploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUploadText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  providerInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  providerLocation: {
    fontSize: 14,
    color: '#999999',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  servicesOverview: {
    marginTop: 10,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  servicesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  serviceTagText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  tabContent: {
    padding: 16,
  },
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  languageTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageTagText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  verificationStatus: {
    alignItems: 'center',
    padding: 20,
  },
  verificationBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  verificationIconLarge: {
    fontSize: 24,
    marginRight: 12,
  },
  verificationTextLarge: {
    fontSize: 18,
    fontWeight: '600',
  },
  verificationHelp: {
    alignItems: 'center',
  },
  verificationHelpText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  verificationButton: {
    minWidth: 200,
  },
  verificationSuccess: {
    alignItems: 'center',
  },
  verificationSuccessText: {
    fontSize: 16,
    color: '#28A745',
    textAlign: 'center',
    lineHeight: 22,
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