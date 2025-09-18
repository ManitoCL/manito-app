/**
 * Provider Verification Screen
 *
 * Guides providers through the verification process per user stories:
 * 1. Upload documents (Cédula front/back, selfie)
 * 2. RUT validation
 * 3. Background check
 * 4. Identity verification
 * 5. Manual review (if needed)
 * 6. Final approval
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { DocumentUploadSet } from '../../components/verification/DocumentUpload';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  VerificationDocument,
  VerificationWorkflow,
  WorkflowStep,
  VerificationStatus,
  DocumentType,
} from '../../types';
import { colors, typography, spacing, borderRadius } from '../../design/tokens';
import { verificationService } from '../../services/database/verificationService';
import { useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';

interface ProviderVerificationScreenProps {
  navigation: any;
  route: {
    params?: {
      providerId?: string;
    };
  };
}

export const ProviderVerificationScreen: React.FC<ProviderVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { user } = useEnterpriseAuth();
  const [workflow, setWorkflow] = useState<VerificationWorkflow | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<VerificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationOverview, setVerificationOverview] = useState<any>(null);

  // Required documents based on user stories
  const requiredDocuments: DocumentType[] = ['cedula_front', 'cedula_back', 'selfie'];

  useEffect(() => {
    // Initialize verification workflow
    initializeWorkflow();
  }, []);

  const initializeWorkflow = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    try {
      setIsLoading(true);

      // Get or create provider profile
      let providerProfile = await verificationService.getProviderProfile(user.id);

      if (!providerProfile) {
        // Create provider profile if it doesn't exist
        providerProfile = await verificationService.createProviderProfile({
          user_id: user.id,
          comuna: '', // Will be set during signup
          verification_status: 'pending',
          verification_score: 0,
          services_offered: [],
          service_areas: [],
        });
      }

      // Get verification overview
      const overview = await verificationService.getProviderVerificationOverview(user.id);
      setVerificationOverview(overview);

      // Create mock workflow based on current status
      const mockWorkflow: VerificationWorkflow = {
        id: `workflow_${providerProfile.id}`,
        providerId: providerProfile.id,
        currentStep: overview.nextStep === 'upload_documents' ? 'documents_upload' :
                   overview.nextStep === 'wait_review' ? 'rut_validation' :
                   overview.nextStep === 'under_review' ? 'manual_review' :
                   overview.nextStep === 'completed' ? 'completed' : 'documents_upload',
        stepsCompleted: [],
        stepsFailed: [],
        totalSteps: 6,
        autoVerificationPossible: false,
        manualReviewReasons: [],
        startedAt: new Date().toISOString(),
        priorityLevel: 1,
      };

      setWorkflow(mockWorkflow);
      setUploadedDocuments(overview.documents || []);
    } catch (error) {
      console.error('Error initializing workflow:', error);
      Alert.alert('Error', 'No se pudo inicializar el proceso de verificación');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document upload completion
  const handleDocumentsComplete = async (documents: VerificationDocument[]) => {
    setUploadedDocuments(documents);
    setIsLoading(true);

    try {
      // Save documents to database
      await saveDocumentsToDatabase(documents);

      // Update workflow step
      await updateWorkflowStep('rut_validation');

      Alert.alert(
        'Documentos Subidos',
        'Tus documentos han sido recibidos. Ahora procederemos con la validación de tu RUT.',
        [{ text: 'Continuar', onPress: () => proceedToNextStep() }]
      );
    } catch (error) {
      console.error('Error saving documents:', error);
      Alert.alert('Error', 'No se pudieron guardar los documentos');
    } finally {
      setIsLoading(false);
    }
  };

  // Save documents to database (real implementation)
  const saveDocumentsToDatabase = async (documents: VerificationDocument[]) => {
    if (!verificationOverview?.profile?.id) {
      throw new Error('Provider profile not found');
    }

    // Documents are already saved by the upload service
    // Here we can update the verification status
    await verificationService.updateProviderProfile(user!.id, {
      verification_status: 'in_review',
    });

    // Create workflow step record
    await verificationService.createWorkflowStep({
      provider_id: verificationOverview.profile.id,
      workflow_step: 'documents',
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      retry_count: 0,
    });

    console.log('Documents saved and workflow updated:', documents);
  };

  // Update workflow step
  const updateWorkflowStep = async (newStep: WorkflowStep) => {
    if (!workflow) return;

    const updatedWorkflow: VerificationWorkflow = {
      ...workflow,
      currentStep: newStep,
      stepsCompleted: [...workflow.stepsCompleted, workflow.currentStep],
    };

    setWorkflow(updatedWorkflow);
  };

  // Proceed to next verification step
  const proceedToNextStep = () => {
    if (!workflow) return;

    switch (workflow.currentStep) {
      case 'documents_upload':
        // Documents are uploaded, proceed to RUT validation
        startRutValidation();
        break;
      case 'rut_validation':
        startBackgroundCheck();
        break;
      case 'background_check':
        startIdentityVerification();
        break;
      case 'identity_verification':
        checkForManualReview();
        break;
      case 'manual_review':
        // Wait for admin review
        break;
      case 'final_approval':
        completeVerification();
        break;
    }
  };

  // Start RUT validation process
  const startRutValidation = async () => {
    setIsLoading(true);
    try {
      // In real implementation, this would call Chilean RUT validation API
      await new Promise(resolve => setTimeout(resolve, 3000));

      await updateWorkflowStep('background_check');
      Alert.alert(
        'RUT Validado',
        'Tu RUT ha sido validado exitosamente. Ahora verificaremos tus antecedentes.',
        [{ text: 'Continuar', onPress: () => proceedToNextStep() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo validar el RUT');
    } finally {
      setIsLoading(false);
    }
  };

  // Start background check
  const startBackgroundCheck = async () => {
    setIsLoading(true);
    try {
      // In real implementation, this would call antecedentes API
      await new Promise(resolve => setTimeout(resolve, 5000));

      await updateWorkflowStep('identity_verification');
      Alert.alert(
        'Antecedentes Verificados',
        'Tus antecedentes han sido verificados. Ahora confirmaremos tu identidad.',
        [{ text: 'Continuar', onPress: () => proceedToNextStep() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron verificar los antecedentes');
    } finally {
      setIsLoading(false);
    }
  };

  // Start identity verification (OCR + face matching)
  const startIdentityVerification = async () => {
    setIsLoading(true);
    try {
      // In real implementation, this would call OCR and face matching APIs
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Simulate high confidence score for auto-approval
      const faceMatchScore = 0.92;
      const ocrConfidence = 0.88;

      if (faceMatchScore >= 0.85 && ocrConfidence >= 0.80) {
        await updateWorkflowStep('final_approval');
        Alert.alert(
          'Identidad Verificada',
          'Tu identidad ha sido verificada automáticamente. ¡Estás casi listo!',
          [{ text: 'Continuar', onPress: () => proceedToNextStep() }]
        );
      } else {
        await updateWorkflowStep('manual_review');
        Alert.alert(
          'Revisión Manual Requerida',
          'Tu verificación requiere revisión manual. Te notificaremos dentro de 24 horas.',
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar la identidad');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if manual review is needed
  const checkForManualReview = () => {
    // This would be determined by the system based on various factors
    const needsManualReview = Math.random() > 0.7; // 30% chance for demo

    if (needsManualReview) {
      updateWorkflowStep('manual_review');
      Alert.alert(
        'Revisión Manual',
        'Tu solicitud será revisada manualmente por nuestro equipo dentro de 24 horas.',
        [{ text: 'Entendido' }]
      );
    } else {
      updateWorkflowStep('final_approval');
      proceedToNextStep();
    }
  };

  // Complete verification process
  const completeVerification = () => {
    Alert.alert(
      '¡Verificación Completada!',
      'Tu cuenta ha sido aprobada. Ya puedes comenzar a recibir solicitudes de trabajo.',
      [
        {
          text: 'Ir al Panel Principal',
          onPress: () => navigation.navigate('ProviderDashboard'),
        },
      ]
    );
  };

  // Get step progress information
  const getStepInfo = (step: WorkflowStep) => {
    const stepMap = {
      documents_upload: {
        title: 'Subir Documentos',
        description: 'Cédula frente, reverso y selfie',
        icon: '📄',
        order: 1,
      },
      rut_validation: {
        title: 'Validación RUT',
        description: 'Verificación con Registro Civil',
        icon: '🆔',
        order: 2,
      },
      background_check: {
        title: 'Verificación Antecedentes',
        description: 'Consulta de antecedentes criminales',
        icon: '🔍',
        order: 3,
      },
      identity_verification: {
        title: 'Verificación Identidad',
        description: 'Comparación facial y OCR',
        icon: '👤',
        order: 4,
      },
      manual_review: {
        title: 'Revisión Manual',
        description: 'Evaluación por equipo humano',
        icon: '👨‍💼',
        order: 5,
      },
      final_approval: {
        title: 'Aprobación Final',
        description: 'Activación de cuenta',
        icon: '✅',
        order: 6,
      },
      completed: {
        title: 'Completado',
        description: 'Cuenta activa',
        icon: '🎉',
        order: 7,
      },
      rejected: {
        title: 'Rechazado',
        description: 'Solicitud no aprobada',
        icon: '❌',
        order: 7,
      },
    };

    return stepMap[step];
  };

  // Render progress steps
  const renderProgressSteps = () => {
    if (!workflow) return null;

    const steps: WorkflowStep[] = [
      'documents_upload',
      'rut_validation',
      'background_check',
      'identity_verification',
      'manual_review',
      'final_approval',
    ];

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Progreso de Verificación</Text>
        {steps.map((step, index) => {
          const stepInfo = getStepInfo(step);
          const isCompleted = workflow.stepsCompleted.includes(step);
          const isCurrent = workflow.currentStep === step;
          const isFailed = workflow.stepsFailed.includes(step);

          return (
            <View key={step} style={styles.stepContainer}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isCurrent && styles.stepCircleCurrent,
                    isFailed && styles.stepCircleFailed,
                  ]}
                >
                  <Text style={styles.stepIcon}>{stepInfo.icon}</Text>
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      isCompleted && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepTitle,
                    isCurrent && styles.stepTitleCurrent,
                  ]}
                >
                  {stepInfo.title}
                </Text>
                <Text style={styles.stepDescription}>
                  {stepInfo.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Render current step content
  const renderCurrentStepContent = () => {
    if (!workflow) return null;

    switch (workflow.currentStep) {
      case 'documents_upload':
        return (
          <Card style={styles.contentCard}>
            <Text style={styles.contentTitle}>
              📄 Subir Documentos de Verificación
            </Text>
            <Text style={styles.contentDescription}>
              Para verificar tu identidad, necesitamos que subas los siguientes documentos:
            </Text>
            <DocumentUploadSet
              onDocumentsComplete={handleDocumentsComplete}
              requiredDocuments={requiredDocuments}
              providerId={verificationOverview?.profile?.id || 'temp_provider_id'}
            />
          </Card>
        );

      case 'rut_validation':
        return (
          <Card style={styles.contentCard}>
            <Text style={styles.contentTitle}>🆔 Validando tu RUT</Text>
            <Text style={styles.contentDescription}>
              Estamos verificando tu RUT con el Registro Civil de Chile.
              Este proceso toma unos minutos.
            </Text>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Validando RUT...</Text>
              </View>
            )}
          </Card>
        );

      case 'background_check':
        return (
          <Card style={styles.contentCard}>
            <Text style={styles.contentTitle}>🔍 Verificación de Antecedentes</Text>
            <Text style={styles.contentDescription}>
              Estamos consultando tus antecedentes criminales para garantizar
              la seguridad de nuestros usuarios.
            </Text>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Verificando antecedentes...</Text>
              </View>
            )}
          </Card>
        );

      case 'identity_verification':
        return (
          <Card style={styles.contentCard}>
            <Text style={styles.contentTitle}>👤 Verificación de Identidad</Text>
            <Text style={styles.contentDescription}>
              Estamos comparando tu selfie con tu cédula y extrayendo
              información de tus documentos.
            </Text>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Verificando identidad...</Text>
              </View>
            )}
          </Card>
        );

      case 'manual_review':
        return (
          <Card style={styles.contentCard}>
            <Text style={styles.contentTitle}>👨‍💼 Revisión Manual</Text>
            <Text style={styles.contentDescription}>
              Tu solicitud está siendo revisada por nuestro equipo.
              Te notificaremos por email cuando esté lista.
            </Text>
            <View style={styles.estimatedTimeContainer}>
              <Text style={styles.estimatedTimeText}>
                ⏰ Tiempo estimado: 24 horas
              </Text>
            </View>
          </Card>
        );

      case 'final_approval':
        return (
          <Card style={styles.contentCard}>
            <Text style={styles.contentTitle}>✅ Aprobación Final</Text>
            <Text style={styles.contentDescription}>
              ¡Excelente! Has pasado todas las verificaciones.
              Estamos activando tu cuenta.
            </Text>
            <Button
              title="Completar Registro"
              onPress={completeVerification}
              style={styles.completeButton}
            />
          </Card>
        );

      default:
        return null;
    }
  };

  if (!workflow) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando verificación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Verificación de Proveedor</Text>
          <Text style={styles.subtitle}>
            Completa estos pasos para comenzar a recibir trabajos
          </Text>

          {renderProgressSteps()}
          {renderCurrentStepContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  title: {
    fontSize: typography.fontSize['2xl'].size,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base.size,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  progressContainer: {
    marginBottom: spacing[8],
  },
  progressTitle: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[4],
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: spacing[4],
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  stepCircleCompleted: {
    backgroundColor: colors.green[500],
  },
  stepCircleCurrent: {
    backgroundColor: colors.primary[600],
  },
  stepCircleFailed: {
    backgroundColor: colors.red[500],
  },
  stepIcon: {
    fontSize: 16,
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: colors.neutral[200],
  },
  stepLineCompleted: {
    backgroundColor: colors.green[500],
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.base.size,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing[1],
  },
  stepTitleCurrent: {
    color: colors.primary[600],
  },
  stepDescription: {
    fontSize: typography.fontSize.sm.size,
    color: colors.neutral[500],
  },
  contentCard: {
    marginBottom: spacing[6],
  },
  contentTitle: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  contentDescription: {
    fontSize: typography.fontSize.base.size,
    color: colors.neutral[600],
    lineHeight: typography.fontSize.base.lineHeight + 4,
    marginBottom: spacing[4],
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing[6],
  },
  loadingText: {
    fontSize: typography.fontSize.base.size,
    color: colors.neutral[600],
    marginTop: spacing[2],
  },
  estimatedTimeContainer: {
    backgroundColor: colors.neutral[50],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[400],
  },
  estimatedTimeText: {
    fontSize: typography.fontSize.sm.size,
    color: colors.neutral[700],
    fontWeight: '500',
  },
  completeButton: {
    marginTop: spacing[4],
  },
});