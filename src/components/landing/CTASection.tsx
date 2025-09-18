/**
 * Call-to-Action Section
 * Conversion-optimized final push with urgency and value props
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../design/tokens';
import { EnterpriseButton } from '../ui/EnterpriseButton';
import { EnterpriseCard } from '../ui/EnterpriseCard';
import { Icons } from '../icons';

interface CTASectionProps {
  onGetStarted: () => void;
  onContactSales?: () => void;
  style?: any;
}

export const CTASection: React.FC<CTASectionProps> = ({
  onGetStarted,
  onContactSales,
  style,
}) => {
  const urgencyFeatures = [
    {
      icon: <Icons.QuickResponse size={20} color={colors.warning[600]} />,
      text: 'Respuesta en 2 horas',
    },
    {
      icon: <Icons.CheckCircle size={20} color={colors.success[600]} />,
      text: 'Sin compromiso',
    },
    {
      icon: <Icons.ShieldCheck size={20} color={colors.primary[600]} />,
      text: 'Profesionales verificados',
    },
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Main CTA Card */}
      <EnterpriseCard
        variant="feature"
        padding="xl"
        style={styles.ctaCard}
      >
        <View style={styles.ctaContent}>
          {/* Urgency Badge */}
          <View style={styles.urgencyBadge}>
            <Icons.QuickResponse size={16} color={colors.warning[700]} />
            <Text style={styles.urgencyText}>
              ¡Únete a miles de chilenos satisfechos!
            </Text>
          </View>

          {/* Main Headline */}
          <Text style={styles.ctaHeadline}>
            Comienza hoy mismo
          </Text>

          {/* Value Proposition */}
          <Text style={styles.ctaDescription}>
            Regístrate gratis y accede a la red más grande de
            profesionales verificados de Chile. Sin costos ocultos,
            sin compromisos a largo plazo.
          </Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            {urgencyFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                {feature.icon}
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* Primary CTA */}
          <EnterpriseButton
            title="Comenzar Gratis Ahora"
            onPress={onGetStarted}
            variant="primary"
            size="xl"
            fullWidth
            icon={<Icons.ArrowRight size={24} color={colors.text.inverse} />}
            iconPosition="right"
            style={styles.primaryCta}
          />

          {/* Secondary CTA */}
          {onContactSales && (
            <EnterpriseButton
              title="Hablar con un Especialista"
              onPress={onContactSales}
              variant="outline"
              size="lg"
              fullWidth
              icon={<Icons.Support size={20} color={colors.primary[500]} />}
              iconPosition="left"
              style={styles.secondaryCta}
            />
          )}

          {/* Trust Signal */}
          <View style={styles.trustSignal}>
            <Icons.ShieldCheck size={16} color={colors.success[600]} />
            <Text style={styles.trustText}>
              100% gratuito • Sin tarjeta de crédito
            </Text>
          </View>
        </View>
      </EnterpriseCard>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2,500+</Text>
          <Text style={styles.statLabel}>Profesionales</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>15,000+</Text>
          <Text style={styles.statLabel}>Servicios</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8★</Text>
          <Text style={styles.statLabel}>Calificación</Text>
        </View>
      </View>

      {/* Security Reassurance */}
      <View style={styles.securityRow}>
        <Icons.SecurePayment size={20} color={colors.neutral[500]} />
        <Text style={styles.securityText}>
          Tus datos están protegidos con encriptación de grado bancario
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[12],
    backgroundColor: colors.surface.primary,
    alignItems: 'center',
  },
  ctaCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  ctaContent: {
    alignItems: 'center',
    width: '100%',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.warning[300],
  },
  urgencyText: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning[700],
    marginLeft: spacing[2],
  },
  ctaHeadline: {
    fontSize: typography.fontSize['4xl'].size,
    lineHeight: typography.fontSize['4xl'].lineHeight,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  ctaDescription: {
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight * 1.4,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: spacing[8],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  featureText: {
    fontSize: typography.fontSize.base.size,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginLeft: spacing[3],
  },
  primaryCta: {
    marginBottom: spacing[4],
    backgroundColor: colors.primary[500],
  },
  secondaryCta: {
    marginBottom: spacing[6],
  },
  trustSignal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.medium,
    color: colors.success[600],
    marginLeft: spacing[2],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[4],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'].size,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.primary,
    marginHorizontal: spacing[4],
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  securityText: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.neutral[500],
    marginLeft: spacing[2],
    textAlign: 'center',
  },
});