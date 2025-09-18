/**
 * ProfileScreen - Marketplace UX Specialist Pattern
 * Comprehensive profile management for consumers and providers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileService } from '../../services/profile';
import ChileanPhoneInput from '../../components/registration/ChileanPhoneInput';
import RUTInput from '../../components/profile/RUTInput';
import { CHILEAN_SERVICES, CHILEAN_REGIONS, validateEmail } from '../../utils/chilean';

type ProfileSection = 'personal' | 'business' | 'addresses' | 'verification';

const ProfileScreen: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  
  // Profile data state
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    rutNumber: '',
    businessName: '',
    description: '',
    hourlyRate: '',
    isAvailable: true,
    services: [] as string[],
    serviceAreas: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await ProfileService.getUserProfile(user.id);
      
      if (error) {
        Alert.alert('Error', 'Error al cargar perfil');
        return;
      }

      setProfileData(data);
      
      // Populate form with current data
      setFormData({
        fullName: data.full_name || '',
        email: data.email || '',
        phoneNumber: data.phone_number || '',
        rutNumber: data.rut_number || '',
        businessName: data.providerProfile?.business_name || '',
        description: data.providerProfile?.description || '',
        hourlyRate: data.providerProfile?.hourly_rate_clp?.toString() || '',
        isAvailable: data.providerProfile?.is_available ?? true,
        services: data.providerProfile?.services || [],
        serviceAreas: data.providerProfile?.service_areas || [],
      });
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Update basic profile
      const userUpdate = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      };
      
      await ProfileService.updateUserProfile(user!.id, userUpdate);

      // Update provider profile if applicable
      if (profileData?.user_type === 'provider') {
        const providerUpdate = {
          businessName: formData.businessName,
          description: formData.description,
          services: formData.services,
          serviceAreas: formData.serviceAreas,
          hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
          isAvailable: formData.isAvailable,
        };
        
        await ProfileService.updateProviderProfile(user!.id, providerUpdate);
      }

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      await loadUserProfile(); // Reload to get updated data
    } catch (error) {
      Alert.alert('Error', 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (profileData?.user_type === 'provider') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'El nombre del negocio es requerido';
      }
      
      if (formData.services.length === 0) {
        newErrors.services = 'Selecciona al menos un servicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors || {}).length === 0;
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: () => signOut(), style: 'destructive' },
      ]
    );
  };

  const renderSectionTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeSection === 'personal' && styles.activeTab]}
        onPress={() => setActiveSection('personal')}
      >
        <Text style={[styles.tabText, activeSection === 'personal' && styles.activeTabText]}>
          Personal
        </Text>
      </TouchableOpacity>
      
      {profileData?.user_type === 'provider' && (
        <>
          <TouchableOpacity
            style={[styles.tab, activeSection === 'business' && styles.activeTab]}
            onPress={() => setActiveSection('business')}
          >
            <Text style={[styles.tabText, activeSection === 'business' && styles.activeTabText]}>
              Negocio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeSection === 'verification' && styles.activeTab]}
            onPress={() => setActiveSection('verification')}
          >
            <Text style={[styles.tabText, activeSection === 'verification' && styles.activeTabText]}>
              Verificación
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderPersonalSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información Personal</Text>
      
      {/* Profile Photo */}
      <View style={styles.photoContainer}>
        <View style={styles.photoCircle}>
          {profileData?.avatar_url ? (
            <Image source={{ uri: profileData.avatar_url }} style={styles.profilePhoto} />
          ) : (
            <Text style={styles.photoPlaceholder}>
              {formData.fullName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.changePhotoButton}>
          <Text style={styles.changePhotoText}>Cambiar Foto</Text>
        </TouchableOpacity>
      </View>

      {/* Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre Completo *</Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...(formData || {}), fullName: text })}
          placeholder="Tu nombre completo"
        />
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={formData.email}
          placeholder="tu@email.com"
          editable={false}
        />
        <Text style={styles.helperText}>El email no se puede cambiar</Text>
      </View>

      {/* Phone */}
      <View style={styles.inputGroup}>
        <ChileanPhoneInput
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData({ ...(formData || {}), phoneNumber: text })}
          error={errors.phoneNumber}
        />
      </View>

      {/* RUT */}
      <View style={styles.inputGroup}>
        <RUTInput
          value={formData.rutNumber}
          onChangeText={(text) => setFormData({ ...(formData || {}), rutNumber: text })}
          error={errors.rutNumber}
          label="RUT (Opcional)"
        />
      </View>
    </View>
  );

  const renderBusinessSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información del Negocio</Text>
      
      {/* Business Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre del Negocio *</Text>
        <TextInput
          style={[styles.input, errors.businessName && styles.inputError]}
          value={formData.businessName}
          onChangeText={(text) => setFormData({ ...(formData || {}), businessName: text })}
          placeholder="Ej: Electricidad González"
        />
        {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...(formData || {}), description: text })}
          placeholder="Describe tus servicios y experiencia"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Hourly Rate */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tarifa por Hora (CLP)</Text>
        <TextInput
          style={styles.input}
          value={formData.hourlyRate}
          onChangeText={(text) => setFormData({ ...(formData || {}), hourlyRate: text.replace(/[^0-9]/g, '') })}
          placeholder="Ej: 15000"
          keyboardType="numeric"
        />
      </View>

      {/* Availability */}
      <View style={styles.switchGroup}>
        <Text style={styles.inputLabel}>Disponible para trabajos</Text>
        <Switch
          value={formData.isAvailable}
          onValueChange={(value) => setFormData({ ...(formData || {}), isAvailable: value })}
          trackColor={{ false: '#e5e5e5', true: '#007AFF' }}
          thumbColor={formData.isAvailable ? '#ffffff' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  const renderVerificationSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Verificación</Text>
      
      <View style={styles.verificationCard}>
        <Text style={styles.verificationTitle}>Estado de Verificación</Text>
        <View style={styles.verificationStatus}>
          <Text style={[
            styles.statusBadge,
            { backgroundColor: getVerificationColor() }
          ]}>
            {getVerificationText()}
          </Text>
        </View>
        <Text style={styles.verificationDescription}>
          {getVerificationDescription()}
        </Text>
      </View>

      {/* Verification Actions */}
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Subir Documentos</Text>
      </TouchableOpacity>
    </View>
  );

  const getVerificationColor = () => {
    switch (profileData?.providerProfile?.verification_status) {
      case 'approved': return '#34c759';
      case 'in_review': return '#ff9500';
      case 'rejected': return '#ff3b30';
      default: return '#8e8e93';
    }
  };

  const getVerificationText = () => {
    switch (profileData?.providerProfile?.verification_status) {
      case 'approved': return 'Verificado';
      case 'in_review': return 'En Revisión';
      case 'rejected': return 'Rechazado';
      default: return 'Pendiente';
    }
  };

  const getVerificationDescription = () => {
    switch (profileData?.providerProfile?.verification_status) {
      case 'approved': return 'Tu cuenta está verificada y puedes recibir trabajos.';
      case 'in_review': return 'Estamos revisando tus documentos. Te notificaremos pronto.';
      case 'rejected': return 'Tu verificación fue rechazada. Contacta soporte para más información.';
      default: return 'Sube tus documentos para verificar tu cuenta profesional.';
    }
  };

  if (loading && !profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <View style={styles.userTypeBadge}>
            <Text style={styles.userTypeText}>
              {profileData?.user_type === 'provider' ? 'Profesional' : 'Cliente'}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        {renderSectionTabs()}

        {/* Content */}
        {activeSection === 'personal' && renderPersonalSection()}
        {activeSection === 'business' && renderBusinessSection()}
        {activeSection === 'verification' && renderVerificationSection()}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userTypeBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  userTypeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#666666',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  inputDisabled: {
    backgroundColor: '#f8f8f8',
    color: '#999999',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    marginTop: 6,
  },
  helperText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 6,
  },
  verificationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  verificationStatus: {
    marginBottom: 12,
  },
  statusBadge: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  verificationDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 24,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    borderWidth: 2,
    borderColor: '#ff3b30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;