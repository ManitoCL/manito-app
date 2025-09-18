/**
 * Simple B2C Features Section
 * Focused on user benefits and value
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../design/tokens';
import { EnterpriseCard } from '../ui/EnterpriseCard';
import { Icons } from '../icons';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  style?: any;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ style }) => {
  const features: Feature[] = [
    {
      icon: <Icons.ShieldCheck size={32} color={colors.primary[500]} />,
      title: 'Profesionales Verificados',
      description: 'Todos nuestros profesionales están verificados con documentos oficiales y tienen buenas calificaciones.',
    },
    {
      icon: <Icons.SecurePayment size={32} color={colors.success[500]} />,
      title: 'Pagos Seguros',
      description: 'Paga de forma segura y tu dinero queda protegido hasta que confirmes que el trabajo está bien hecho.',
    },
    {
      icon: <Icons.Insurance size={32} color={colors.secondary[500]} />,
      title: 'Garantía Incluida',
      description: 'Todos los servicios tienen garantía. Si algo sale mal, lo solucionamos sin costo adicional.',
    },
    {
      icon: <Icons.QuickResponse size={32} color={colors.warning[500]} />,
      title: 'Respuesta Rápida',
      description: 'Encuentra un profesional disponible en minutos. La mayoría responde en menos de 2 horas.',
    },
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Simple Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          ¿Por qué elegir Manito?
        </Text>
        <Text style={styles.sectionSubtitle}>
          Te ayudamos a encontrar profesionales confiables para tu hogar
        </Text>
      </View>

      {/* Simple Features Grid */}
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <EnterpriseCard
            key={index}
            variant="elevated"
            padding="lg"
            style={styles.featureCard}
          >
            <View style={styles.featureContent}>
              <View style={styles.iconContainer}>
                {feature.icon}
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </EnterpriseCard>
        ))}
      </View>

      {/* Simple How It Works */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.howItWorksTitle}>¿Cómo funciona?</Text>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Describe lo que necesitas</Text>
            <Text style={styles.stepDescription}>Cuéntanos qué servicio necesitas y cuándo</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Recibe propuestas</Text>
            <Text style={styles.stepDescription}>Los profesionales te envían sus propuestas</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Elige y paga seguro</Text>
            <Text style={styles.stepDescription}>Selecciona el mejor profesional y paga de forma segura</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[12],
    backgroundColor: colors.surface.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  sectionTitle: {
    fontSize: typography.fontSize['3xl'].size,
    lineHeight: typography.fontSize['3xl'].lineHeight * 0.9,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
    fontFamily: typography.fontFamily.display[0],
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: '90%',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing[12],
  },
  featureCard: {
    width: '48%',
    marginBottom: spacing[4],
    minHeight: 200,
  },
  featureContent: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  featureTitle: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight * 1.4,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  howItWorksSection: {
    marginBottom: spacing[8],
  },
  howItWorksTitle: {
    fontSize: typography.fontSize['2xl'].size,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[8],
    fontFamily: typography.fontFamily.display[0],
  },
  stepsContainer: {
    gap: spacing[6],
  },
  step: {
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  stepNumberText: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  stepTitle: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: typography.fontSize.base.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base.lineHeight * 1.4,
  },
});