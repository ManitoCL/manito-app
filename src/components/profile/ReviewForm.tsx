// =============================================================================
// REVIEW FORM - COMPREHENSIVE RATING AND REVIEW SYSTEM
// Epic #2: Profile Management - Review and Rating Features
// =============================================================================
// Advanced review form with photo upload, star rating, and Chilean UX patterns
// Integrates with storage infrastructure and enterprise patterns
// Author: Frontend UI Expert
// Created: 2025-09-19

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';

// Enterprise auth hooks
import { useEnterpriseAuth, useProfileData } from '../../hooks/useEnterpriseAuth';

// Storage and image components
import { AvatarProgressiveImage, ProgressiveImage } from '../storage/ProgressiveImage';

// UI components
import { AutofillAwareInput } from '../ui/AutofillAwareInput';
import { Button } from '../ui/Button';

// Storage service
import { uploadReviewImage } from '../../services/profileStorageHelpers';

// Job booking interface (imported from JobHistoryList)
import { JobBooking } from './JobHistoryList';

const { width: screenWidth } = Dimensions.get('window');

// =============================================================================
// INTERFACES
// =============================================================================

export interface ReviewData {
  rating: number; // 1-5 stars
  reviewText: string;
  photos: string[]; // URLs of uploaded photos
  wouldRecommend: boolean;
  categories: {
    punctuality: number; // 1-5
    quality: number; // 1-5
    communication: number; // 1-5
    cleanliness: number; // 1-5
    value: number; // 1-5
  };
  isPublic: boolean; // Whether review is visible to other users
}

interface ReviewFormProps {
  job: JobBooking;
  initialReview?: Partial<ReviewData>;
  onSubmit: (reviewData: ReviewData) => Promise<void>;
  onCancel: () => void;
  isVisible: boolean;
  isLoading?: boolean;
}

// =============================================================================
// STAR RATING COMPONENT
// =============================================================================

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
  showLabels?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 32,
  disabled = false,
  showLabels = false,
}) => {
  const labels = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  return (
    <View style={styles.starRatingContainer}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={[styles.starButton, { width: size, height: size }]}
            onPress={() => !disabled && onRatingChange(star)}
            disabled={disabled}
            accessibilityLabel={`${star} estrella${star > 1 ? 's' : ''}`}
            accessibilityRole="button"
          >
            <Text style={[
              styles.starIcon,
              { fontSize: size * 0.8 },
              { color: star <= rating ? '#FFD700' : '#E0E0E0' }
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showLabels && rating > 0 && (
        <Text style={styles.ratingLabel}>
          {labels[rating - 1]}
        </Text>
      )}
    </View>
  );
};

// =============================================================================
// REVIEW FORM COMPONENT
// =============================================================================

export const ReviewForm: React.FC<ReviewFormProps> = ({
  job,
  initialReview,
  onSubmit,
  onCancel,
  isVisible,
  isLoading = false,
}) => {
  const { user } = useEnterpriseAuth();
  const { profile } = useProfileData();

  // Form state
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: initialReview?.rating || 0,
    reviewText: initialReview?.reviewText || '',
    photos: initialReview?.photos || [],
    wouldRecommend: initialReview?.wouldRecommend ?? true,
    categories: {
      punctuality: initialReview?.categories?.punctuality || 0,
      quality: initialReview?.categories?.quality || 0,
      communication: initialReview?.categories?.communication || 0,
      cleanliness: initialReview?.categories?.cleanliness || 0,
      value: initialReview?.categories?.value || 0,
    },
    isPublic: initialReview?.isPublic ?? true,
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]); // Track uploading images
  const [currentStep, setCurrentStep] = useState<'rating' | 'details' | 'photos'>('rating');

  // Form refs
  const reviewTextRef = useRef<TextInput>(null);

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  const updateReviewData = useCallback((updates: Partial<ReviewData>) => {
    setReviewData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateCategoryRating = useCallback((category: keyof ReviewData['categories'], rating: number) => {
    setReviewData(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: rating }
    }));
  }, []);

  const validateForm = (): boolean => {
    if (reviewData.rating === 0) {
      Alert.alert('Error', 'Debes dar una calificación general');
      setCurrentStep('rating');
      return false;
    }

    if (reviewData.reviewText.trim().length < 10) {
      Alert.alert('Error', 'La reseña debe tener al menos 10 caracteres');
      setCurrentStep('details');
      reviewTextRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(reviewData);
    } catch (error) {
      console.error('Review submission error:', error);
      Alert.alert('Error', 'No se pudo enviar la reseña. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================================================
  // PHOTO MANAGEMENT
  // =============================================================================

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
        aspect: [16, 9],
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
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - reviewData.photos.length, // Max 5 photos total
      });
    }

    if (!result.canceled && result.assets.length > 0) {
      for (const asset of result.assets) {
        await handlePhotoUpload(asset.uri);
      }
    }
  };

  const handlePhotoUpload = async (imageUri: string) => {
    if (!user?.id || reviewData.photos.length >= 5) return;

    const tempId = `temp_${Date.now()}`;
    setUploadingImages(prev => [...prev, tempId]);

    try {
      const uploadResult = await uploadReviewImage({
        imageUri,
        userId: user.id,
        jobId: job.id,
        onProgress: (progress) => {
          // Could show upload progress here
          console.log(`Upload progress for ${tempId}: ${progress}%`);
        },
      });

      if (uploadResult.success && uploadResult.url) {
        setReviewData(prev => ({
          ...prev,
          photos: [...prev.photos, uploadResult.url!]
        }));
      } else {
        Alert.alert('Error', uploadResult.error || 'No se pudo subir la imagen');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert('Error', 'Error al subir la imagen. Inténtalo nuevamente.');
    } finally {
      setUploadingImages(prev => prev.filter(id => id !== tempId));
    }
  };

  const removePhoto = (photoUrl: string) => {
    setReviewData(prev => ({
      ...prev,
      photos: prev.photos.filter(url => url !== photoUrl)
    }));
  };

  // =============================================================================
  // RENDER METHODS
  // =============================================================================

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {['rating', 'details', 'photos'].map((step, index) => (
        <View key={step} style={styles.stepIndicatorContainer}>
          <TouchableOpacity
            style={[
              styles.stepDot,
              currentStep === step && styles.stepDotActive,
              (currentStep === 'details' && step === 'rating') ||
              (currentStep === 'photos' && ['rating', 'details'].includes(step)) ? styles.stepDotCompleted : null
            ]}
            onPress={() => setCurrentStep(step as any)}
          >
            <Text style={[
              styles.stepDotText,
              currentStep === step && styles.stepDotTextActive
            ]}>
              {index + 1}
            </Text>
          </TouchableOpacity>
          {index < 2 && <View style={styles.stepConnector} />}
        </View>
      ))}
    </View>
  );

  const renderJobHeader = () => (
    <View style={styles.jobHeader}>
      <AvatarProgressiveImage
        src={job.providerAvatar}
        size={50}
        userName={job.providerName}
      />
      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.providerName}>{job.providerName}</Text>
        <Text style={styles.jobDate}>
          {new Date(job.scheduledDate).toLocaleDateString('es-CL')}
        </Text>
      </View>
    </View>
  );

  const renderRatingStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>¿Cómo calificarías este servicio?</Text>

      {/* Overall Rating */}
      <View style={styles.ratingSection}>
        <Text style={styles.ratingLabel}>Calificación General</Text>
        <StarRating
          rating={reviewData.rating}
          onRatingChange={(rating) => updateReviewData({ rating })}
          size={40}
          showLabels={true}
        />
      </View>

      {/* Category Ratings */}
      <Text style={styles.categoryTitle}>Califica por categorías:</Text>

      {[
        { key: 'punctuality', label: 'Puntualidad' },
        { key: 'quality', label: 'Calidad del trabajo' },
        { key: 'communication', label: 'Comunicación' },
        { key: 'cleanliness', label: 'Orden y limpieza' },
        { key: 'value', label: 'Relación precio-calidad' },
      ].map(({ key, label }) => (
        <View key={key} style={styles.categoryRating}>
          <Text style={styles.categoryLabel}>{label}</Text>
          <StarRating
            rating={reviewData.categories[key as keyof ReviewData['categories']]}
            onRatingChange={(rating) => updateCategoryRating(key as keyof ReviewData['categories'], rating)}
            size={24}
          />
        </View>
      ))}

      {/* Recommendation */}
      <View style={styles.recommendationSection}>
        <Text style={styles.recommendationLabel}>
          ¿Recomendarías este prestador a otros usuarios?
        </Text>
        <View style={styles.recommendationButtons}>
          <TouchableOpacity
            style={[
              styles.recommendationButton,
              reviewData.wouldRecommend && styles.recommendationButtonActive
            ]}
            onPress={() => updateReviewData({ wouldRecommend: true })}
          >
            <Text style={[
              styles.recommendationButtonText,
              reviewData.wouldRecommend && styles.recommendationButtonTextActive
            ]}>
              👍 Sí
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.recommendationButton,
              !reviewData.wouldRecommend && styles.recommendationButtonActive
            ]}
            onPress={() => updateReviewData({ wouldRecommend: false })}
          >
            <Text style={[
              styles.recommendationButtonText,
              !reviewData.wouldRecommend && styles.recommendationButtonTextActive
            ]}>
              👎 No
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Cuéntanos sobre tu experiencia</Text>

      {/* Review Text */}
      <AutofillAwareInput
        ref={reviewTextRef}
        label="Tu reseña *"
        value={reviewData.reviewText}
        onChangeText={(text) => updateReviewData({ reviewText: text })}
        placeholder="Describe tu experiencia con este servicio..."
        multiline
        numberOfLines={6}
        maxLength={500}
        textAlignVertical="top"
        style={styles.reviewTextInput}
        helpText={`${reviewData.reviewText.length}/500 caracteres`}
      />

      {/* Privacy Settings */}
      <View style={styles.privacySection}>
        <View style={styles.privacyOption}>
          <View style={styles.privacyInfo}>
            <Text style={styles.privacyLabel}>Hacer reseña pública</Text>
            <Text style={styles.privacyDescription}>
              Otros usuarios podrán ver tu reseña y calificación
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.switch,
              reviewData.isPublic && styles.switchActive
            ]}
            onPress={() => updateReviewData({ isPublic: !reviewData.isPublic })}
          >
            <View style={[
              styles.switchThumb,
              reviewData.isPublic && styles.switchThumbActive
            ]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPhotosStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Agrega fotos (opcional)</Text>
      <Text style={styles.stepSubtitle}>
        Comparte fotos del trabajo realizado para ayudar a otros usuarios
      </Text>

      {/* Photo Grid */}
      <View style={styles.photoGrid}>
        {reviewData.photos.map((photoUrl, index) => (
          <View key={photoUrl} style={styles.photoContainer}>
            <ProgressiveImage
              src={photoUrl}
              alt={`Foto de reseña ${index + 1}`}
              width={80}
              height={80}
              style={styles.photoThumbnail}
            />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => removePhoto(photoUrl)}
            >
              <Text style={styles.removePhotoIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Uploading indicators */}
        {uploadingImages.map((tempId) => (
          <View key={tempId} style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.uploadingText}>Subiendo...</Text>
          </View>
        ))}

        {/* Add Photo Button */}
        {reviewData.photos.length < 5 && uploadingImages.length === 0 && (
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={() => setShowImagePicker(true)}
          >
            <Text style={styles.addPhotoIcon}>📷</Text>
            <Text style={styles.addPhotoText}>Agregar Foto</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.photoLimitText}>
        Máximo 5 fotos • {reviewData.photos.length}/5 utilizadas
      </Text>
    </View>
  );

  const renderNavigationButtons = () => (
    <View style={styles.navigationButtons}>
      {currentStep !== 'rating' && (
        <Button
          title="Anterior"
          onPress={() => {
            if (currentStep === 'details') setCurrentStep('rating');
            if (currentStep === 'photos') setCurrentStep('details');
          }}
          variant="secondary"
          style={styles.navButton}
        />
      )}

      {currentStep !== 'photos' ? (
        <Button
          title="Siguiente"
          onPress={() => {
            if (currentStep === 'rating' && reviewData.rating > 0) {
              setCurrentStep('details');
            } else if (currentStep === 'details' && reviewData.reviewText.trim().length >= 10) {
              setCurrentStep('photos');
            } else if (currentStep === 'rating') {
              Alert.alert('Error', 'Debes dar una calificación general');
            } else if (currentStep === 'details') {
              Alert.alert('Error', 'La reseña debe tener al menos 10 caracteres');
            }
          }}
          disabled={
            (currentStep === 'rating' && reviewData.rating === 0) ||
            (currentStep === 'details' && reviewData.reviewText.trim().length < 10)
          }
          style={styles.navButton}
        />
      ) : (
        <Button
          title="Enviar Reseña"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.navButton}
        />
      )}
    </View>
  );

  const renderImagePicker = () => (
    <Modal
      visible={showImagePicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowImagePicker(false)}
    >
      <BlurView intensity={80} style={StyleSheet.absoluteFill}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowImagePicker(false)}
          activeOpacity={1}
        >
          <View style={styles.imagePickerModal}>
            <Text style={styles.imagePickerTitle}>Agregar Foto</Text>

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
    </Modal>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Calificar Servicio</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderJobHeader()}
          {renderStepIndicator()}

          {currentStep === 'rating' && renderRatingStep()}
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'photos' && renderPhotosStep()}
        </ScrollView>

        {renderNavigationButtons()}
        {renderImagePicker()}
      </KeyboardAvoidingView>
    </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerSpacer: {
    minWidth: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fbff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  jobInfo: {
    marginLeft: 12,
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 2,
  },
  jobDate: {
    fontSize: 14,
    color: '#666666',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  stepDotActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  stepDotCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  stepDotTextActive: {
    color: '#ffffff',
  },
  stepConnector: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  stepContainer: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 16,
  },
  starRatingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    color: '#E0E0E0',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  categoryRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryLabel: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  recommendationSection: {
    marginTop: 24,
  },
  recommendationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  recommendationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  recommendationButtonActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#007AFF',
  },
  recommendationButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  recommendationButtonTextActive: {
    color: '#007AFF',
  },
  reviewTextInput: {
    minHeight: 120,
  },
  privacySection: {
    marginTop: 24,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  privacyInfo: {
    flex: 1,
    marginRight: 16,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#666666',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#007AFF',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
  },
  photoThumbnail: {
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadingContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    backgroundColor: '#f8fbff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  photoLimitText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  navButton: {
    flex: 1,
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

export default ReviewForm;