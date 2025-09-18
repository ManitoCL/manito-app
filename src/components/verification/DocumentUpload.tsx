/**
 * Document Upload Component for Provider Verification
 *
 * Handles uploading of verification documents per user stories:
 * - Cédula front/back
 * - Selfie with liveness detection
 * - Proof of skills (optional at MVP)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { DocumentType, VerificationDocument, UploadStatus } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../design/tokens';
import { documentUploadService, DocumentUploadProgress } from '../../services/storage/documentUploadService';

interface DocumentUploadProps {
  documentType: DocumentType;
  onUploadComplete: (document: VerificationDocument) => void;
  onUploadProgress?: (progress: number) => void;
  disabled?: boolean;
  existingDocument?: VerificationDocument;
  providerId: string; // Required for Supabase upload
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  onUploadComplete,
  onUploadProgress,
  disabled = false,
  existingDocument,
  providerId,
}) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('pending');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    existingDocument?.filePath || null
  );

  // Get document type information
  const getDocumentInfo = () => {
    switch (documentType) {
      case 'cedula_front':
        return {
          title: 'Cédula de Identidad - Frente',
          description: 'Fotografía clara del frente de tu cédula',
          icon: '🆔',
          tips: [
            'Asegúrate de que todos los datos sean legibles',
            'Evita reflejos y sombras',
            'Mantén la cédula completamente visible'
          ]
        };
      case 'cedula_back':
        return {
          title: 'Cédula de Identidad - Reverso',
          description: 'Fotografía clara del reverso de tu cédula',
          icon: '🆔',
          tips: [
            'Fotografía el reverso completo',
            'Asegúrate de que la firma sea visible',
            'Usa buena iluminación'
          ]
        };
      case 'selfie':
        return {
          title: 'Selfie de Verificación',
          description: 'Fotografía tuya sosteniendo tu cédula junto a tu rostro',
          icon: '🤳',
          tips: [
            'Mira directamente a la cámara',
            'Sostén tu cédula junto a tu rostro',
            'Asegúrate de que tu rostro y la cédula sean visibles',
            'Usa buena iluminación natural'
          ]
        };
      case 'proof_of_skills':
        return {
          title: 'Comprobante de Habilidades',
          description: 'Certificados o diplomas que validen tus habilidades (opcional)',
          icon: '📜',
          tips: [
            'Sube certificados relevantes a tu área',
            'Pueden ser diplomas, certificaciones, etc.',
            'Este documento es opcional para el MVP'
          ]
        };
      default:
        return {
          title: 'Documento',
          description: 'Sube el documento requerido',
          icon: '📄',
          tips: []
        };
    }
  };

  const documentInfo = getDocumentInfo();

  // Request camera permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== 'granted' || mediaLibraryStatus.status !== 'granted') {
        Alert.alert(
          'Permisos Requeridos',
          'Necesitamos acceso a tu cámara y galería para subir documentos.'
        );
        return false;
      }
    }
    return true;
  };

  // Show image picker options
  const showImagePicker = useCallback(async () => {
    if (disabled) return;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      'Seleccionar Imagen',
      '¿Cómo quieres subir tu documento?',
      [
        {
          text: 'Cámara',
          onPress: () => takePhoto(),
        },
        {
          text: 'Galería',
          onPress: () => pickFromGallery(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  }, [disabled]);

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: documentType === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la fotografía');
    }
  };

  // Pick from gallery
  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: documentType === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Handle selected image
  const handleImageSelected = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploadStatus('processing');
      setSelectedImage(asset.uri);

      // Upload to Supabase Storage using the service
      const result = await documentUploadService.uploadDocument(
        providerId,
        documentType as 'cedula_front' | 'cedula_back' | 'selfie' | 'certificate',
        asset.uri,
        (progress: DocumentUploadProgress) => {
          setUploadProgress(progress.progress);
          onUploadProgress?.(progress.progress);

          // Update status based on upload progress
          if (progress.status === 'uploading') {
            setUploadStatus('uploaded');
          } else if (progress.status === 'processing') {
            setUploadStatus('processing');
          } else if (progress.status === 'completed') {
            setUploadStatus('processed');
          } else if (progress.status === 'error') {
            setUploadStatus('failed');
            Alert.alert('Error de Subida', progress.error || 'No se pudo subir el documento');
          }
        }
      );

      if (result.success && result.documentId) {
        // Create verification document object for the parent component
        const document: VerificationDocument = {
          id: result.documentId,
          providerId,
          documentType,
          documentCategory: documentType === 'selfie' ? 'identity' :
                           documentType.includes('cedula') ? 'identity' : 'skills',
          fileName: result.filePath?.split('/').pop() || `${documentType}.jpg`,
          filePath: result.filePath || '',
          fileSize: asset.fileSize || 0,
          mimeType: `image/${asset.uri.split('.').pop()}`,
          uploadStatus: 'uploaded',
          processingStatus: 'completed',
          ocrStatus: 'pending',
          manualReviewRequired: false,
          uploadedAt: new Date().toISOString(),
          uploadedBy: providerId,
        };

        onUploadComplete(document);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error handling image:', error);
      setUploadStatus('failed');
      Alert.alert('Error', 'No se pudo procesar la imagen');
    }
  };


  // Get upload status icon and text
  const getStatusDisplay = () => {
    switch (uploadStatus) {
      case 'pending':
        return { icon: '📁', text: 'Listo para subir', color: colors.neutral[600] };
      case 'processing':
        return { icon: '⏳', text: 'Procesando...', color: colors.primary[600] };
      case 'uploaded':
        return { icon: '⬆️', text: 'Subiendo...', color: colors.primary[600] };
      case 'processed':
        return { icon: '✅', text: 'Completado', color: colors.green[600] };
      case 'failed':
        return { icon: '❌', text: 'Error', color: colors.red[600] };
      default:
        return { icon: '📁', text: 'Pendiente', color: colors.neutral[600] };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <View style={styles.container}>
      {/* Document Info Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{documentInfo.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{documentInfo.title}</Text>
          <Text style={styles.description}>{documentInfo.description}</Text>
        </View>
      </View>

      {/* Upload Area */}
      <TouchableOpacity
        style={[
          styles.uploadArea,
          selectedImage && styles.uploadAreaWithImage,
          disabled && styles.uploadAreaDisabled,
          uploadStatus === 'failed' && styles.uploadAreaError,
          uploadStatus === 'processed' && styles.uploadAreaSuccess,
        ]}
        onPress={showImagePicker}
        disabled={disabled || uploadStatus === 'processing'}
      >
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>Toca para cambiar</Text>
            </View>
          </View>
        ) : (
          <View style={styles.uploadPrompt}>
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={styles.uploadText}>Toca para subir documento</Text>
            <Text style={styles.uploadHint}>Cámara o galería</Text>
          </View>
        )}

        {/* Upload Progress */}
        {uploadStatus === 'processing' && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={styles.progressText}>Procesando imagen...</Text>
          </View>
        )}

        {uploadStatus === 'uploaded' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>Subiendo... {uploadProgress}%</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Status Display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusIcon}>{statusDisplay.icon}</Text>
        <Text style={[styles.statusText, { color: statusDisplay.color }]}>
          {statusDisplay.text}
        </Text>
      </View>

      {/* Tips */}
      {documentInfo.tips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Consejos:</Text>
          {documentInfo.tips.map((tip, index) => (
            <Text key={index} style={styles.tipText}>
              • {tip}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[6],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  icon: {
    fontSize: 32,
    marginRight: spacing[3],
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  description: {
    fontSize: typography.fontSize.sm.size,
    color: colors.neutral[600],
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[50],
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  uploadAreaWithImage: {
    borderStyle: 'solid',
    backgroundColor: colors.surface.primary,
  },
  uploadAreaDisabled: {
    opacity: 0.6,
    backgroundColor: colors.neutral[100],
  },
  uploadAreaError: {
    borderColor: colors.red[400],
    backgroundColor: colors.red[50],
  },
  uploadAreaSuccess: {
    borderColor: colors.green[400],
    backgroundColor: colors.green[50],
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing[2],
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  overlayText: {
    color: colors.surface.primary,
    fontSize: typography.fontSize.sm.size,
    fontWeight: '500',
    textAlign: 'center',
  },
  uploadPrompt: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: spacing[3],
  },
  uploadText: {
    fontSize: typography.fontSize.base.size,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing[1],
  },
  uploadHint: {
    fontSize: typography.fontSize.sm.size,
    color: colors.neutral[500],
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    marginBottom: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[600],
  },
  progressText: {
    fontSize: typography.fontSize.sm.size,
    color: colors.neutral[700],
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
  },
  statusIcon: {
    fontSize: 16,
    marginRight: spacing[2],
  },
  statusText: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: '500',
  },
  tipsContainer: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[400],
  },
  tipsTitle: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: spacing[2],
  },
  tipText: {
    fontSize: typography.fontSize.xs.size,
    color: colors.neutral[600],
    marginBottom: spacing[1],
    lineHeight: typography.fontSize.xs.lineHeight + 2,
  },
});

// Helper component for multiple document uploads
interface DocumentUploadSetProps {
  onDocumentsComplete: (documents: VerificationDocument[]) => void;
  requiredDocuments?: DocumentType[];
  providerId: string; // Required for Supabase upload
}

export const DocumentUploadSet: React.FC<DocumentUploadSetProps> = ({
  onDocumentsComplete,
  requiredDocuments = ['cedula_front', 'cedula_back', 'selfie'],
  providerId,
}) => {
  const [completedDocuments, setCompletedDocuments] = useState<VerificationDocument[]>([]);

  const handleDocumentComplete = useCallback((document: VerificationDocument) => {
    setCompletedDocuments(prev => {
      // Replace any existing document of the same type
      const filtered = prev.filter(d => d.documentType !== document.documentType);
      const updated = [...filtered, document];

      // Check if all required documents are complete
      if (updated.length === requiredDocuments.length) {
        onDocumentsComplete(updated);
      }

      return updated;
    });
  }, [requiredDocuments.length, onDocumentsComplete]);

  return (
    <View style={styles.container}>
      {requiredDocuments.map((docType) => (
        <DocumentUpload
          key={docType}
          documentType={docType}
          onUploadComplete={handleDocumentComplete}
          existingDocument={completedDocuments.find(d => d.documentType === docType)}
          providerId={providerId}
        />
      ))}
    </View>
  );
};