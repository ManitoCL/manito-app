/**
 * Chilean Trust Signals Section
 * Local partnerships, compliance, and cultural adaptation
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

interface ChileanTrustSectionProps {
  style?: any;
}

export const ChileanTrustSection: React.FC<ChileanTrustSectionProps> = ({ style }) => {
  const partnerships = [
    {
      name: 'SERNAC',
      description: 'Cumplimiento total con las normativas de protección al consumidor',
      logo: '🛡️',
      verified: true,
    },
    {
      name: 'Banco Estado',
      description: 'Integración directa para pagos seguros y transferencias',
      logo: '🏦',
      verified: true,
    },
    {
      name: 'Registro Civil',
      description: 'Verificación de identidad a través del Registro Civil de Chile',
      logo: '📋',
      verified: true,
    },
    {
      name: 'Transbank',
      description: 'Procesamiento de pagos certificado por la red financiera chilena',
      logo: '💳',
      verified: true,
    },
  ];

  const compliance = [
    {
      title: 'Ley de Protección de Datos',
      description: 'Cumplimos con la Ley N° 19.628 sobre protección de datos personales',
      icon: <Icons.ShieldCheck size={24} color={colors.success[500]} />,
    },
    {
      title: 'Código del Trabajo',
      description: 'Todos nuestros profesionales conocen y respetan la legislación laboral chilena',
      icon: <Icons.VerifiedProfessional size={24} color={colors.primary[500]} />,
    },
    {
      title: 'Normativas Municipales',
      description: 'Verificamos que cada profesional cumpla con las regulaciones locales',
      icon: <Icons.CheckCircle size={24} color={colors.secondary[500]} />,
    },
  ];

  const regions = [
    'Región Metropolitana',
    'Región de Valparaíso',
    'Región del Biobío',
    'Región de La Araucanía',
    'Región de Los Lagos',
    'Región de Antofagasta',
  ];

  const paymentMethods = [
    {
      name: 'Transbank Webpay',
      description: 'Tarjetas de crédito y débito',
      icon: '💳',
    },
    {
      name: 'MercadoPago',
      description: 'Billetera digital y transferencias',
      icon: '📱',
    },
    {
      name: 'Transferencia Nacional',
      description: 'Todos los bancos chilenos',
      icon: '🏦',
    },
    {
      name: 'Khipu',
      description: 'Pagos bancarios simplificados',
      icon: '⚡',
    },
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Icons.ChileMap size={48} color={colors.primary[500]} />
        <Text style={styles.sectionTitle}>
          Hecho para Chile
        </Text>
        <Text style={styles.sectionSubtitle}>
          Cumplimos con todas las normativas chilenas y trabajamos
          con las instituciones más confiables del país
        </Text>
      </View>

      {/* Government Partnerships */}
      <View style={styles.sectionContainer}>
        <Text style={styles.subsectionTitle}>
          Partnerships Institucionales
        </Text>
        <View style={styles.partnershipsGrid}>
          {partnerships.map((partnership, index) => (
            <EnterpriseCard
              key={index}
              variant="elevated"
              padding="lg"
              style={styles.partnershipCard}
            >
              <View style={styles.partnershipContent}>
                <View style={styles.partnershipHeader}>
                  <Text style={styles.partnershipLogo}>{partnership.logo}</Text>
                  {partnership.verified && (
                    <Icons.CheckCircle size={20} color={colors.success[500]} />
                  )}
                </View>
                <Text style={styles.partnershipName}>{partnership.name}</Text>
                <Text style={styles.partnershipDescription}>{partnership.description}</Text>
              </View>
            </EnterpriseCard>
          ))}
        </View>
      </View>

      {/* Legal Compliance */}
      <View style={styles.sectionContainer}>
        <Text style={styles.subsectionTitle}>
          Cumplimiento Legal
        </Text>
        <View style={styles.complianceContainer}>
          {compliance.map((item, index) => (
            <EnterpriseCard
              key={index}
              variant="outlined"
              padding="md"
              style={styles.complianceCard}
            >
              <View style={styles.complianceContent}>
                <View style={styles.complianceIcon}>
                  {item.icon}
                </View>
                <View style={styles.complianceText}>
                  <Text style={styles.complianceTitle}>{item.title}</Text>
                  <Text style={styles.complianceDescription}>{item.description}</Text>
                </View>
              </View>
            </EnterpriseCard>
          ))}
        </View>
      </View>

      {/* Coverage Map */}
      <View style={styles.sectionContainer}>
        <Text style={styles.subsectionTitle}>
          Cobertura Nacional
        </Text>
        <EnterpriseCard
          variant="feature"
          padding="lg"
          style={styles.coverageCard}
        >
          <View style={styles.coverageContent}>
            <Icons.ChileMap size={64} color={colors.primary[500]} />
            <Text style={styles.coverageTitle}>
              Servicios en {regions.length} Regiones
            </Text>
            <View style={styles.regionsContainer}>
              {regions.map((region, index) => (
                <View key={index} style={styles.regionItem}>
                  <Icons.CheckCircle size={16} color={colors.success[500]} />
                  <Text style={styles.regionText}>{region}</Text>
                </View>
              ))}
            </View>
          </View>
        </EnterpriseCard>
      </View>

      {/* Payment Methods */}
      <View style={styles.sectionContainer}>
        <Text style={styles.subsectionTitle}>
          Métodos de Pago Chilenos
        </Text>
        <View style={styles.paymentMethodsGrid}>
          {paymentMethods.map((method, index) => (
            <EnterpriseCard
              key={index}
              variant="outlined"
              padding="md"
              style={styles.paymentMethodCard}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                <Text style={styles.paymentMethodDescription}>{method.description}</Text>
              </View>
            </EnterpriseCard>
          ))}
        </View>
      </View>

      {/* Chilean Values */}
      <EnterpriseCard
        variant="feature"
        padding="xl"
        style={styles.valuesCard}
      >
        <View style={styles.valuesContent}>
          <Text style={styles.valuesTitle}>
            Valores Chilenos
          </Text>
          <Text style={styles.valuesDescription}>
            Entendemos la cultura chilena. Nuestro equipo está en Santiago
            y conoce las necesidades específicas de los hogares chilenos.
          </Text>
          <View style={styles.valuesGrid}>
            <View style={styles.valueItem}>
              <Text style={styles.valueIcon}>🤝</Text>
              <Text style={styles.valueText}>Confianza</Text>
            </View>
            <View style={styles.valueItem}>
              <Text style={styles.valueIcon}>⏰</Text>
              <Text style={styles.valueText}>Puntualidad</Text>
            </View>
            <View style={styles.valueItem}>
              <Text style={styles.valueIcon}>💯</Text>
              <Text style={styles.valueText}>Calidad</Text>
            </View>
            <View style={styles.valueItem}>
              <Text style={styles.valueIcon}>🏠</Text>
              <Text style={styles.valueText}>Respeto</Text>
            </View>
          </View>
        </View>
      </EnterpriseCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[12],
    backgroundColor: colors.background.secondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[10],
    paddingHorizontal: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.fontSize['3xl'].size,
    lineHeight: typography.fontSize['3xl'].lineHeight,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: '90%',
  },
  sectionContainer: {
    marginBottom: spacing[12],
    paddingHorizontal: spacing[5],
  },
  subsectionTitle: {
    fontSize: typography.fontSize['2xl'].size,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  partnershipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  partnershipCard: {
    width: '48%',
    marginBottom: spacing[4],
  },
  partnershipContent: {
    alignItems: 'center',
  },
  partnershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  partnershipLogo: {
    fontSize: 32,
  },
  partnershipName: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  partnershipDescription: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm.lineHeight * 1.3,
  },
  complianceContainer: {
    gap: spacing[3],
  },
  complianceCard: {
    width: '100%',
  },
  complianceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  complianceIcon: {
    marginRight: spacing[4],
    marginTop: spacing[1],
  },
  complianceText: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: typography.fontSize.base.size,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  complianceDescription: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm.lineHeight * 1.3,
  },
  coverageCard: {
    alignItems: 'center',
  },
  coverageContent: {
    alignItems: 'center',
  },
  coverageTitle: {
    fontSize: typography.fontSize['2xl'].size,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  regionsContainer: {
    alignSelf: 'stretch',
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  regionText: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentMethodCard: {
    width: '48%',
    marginBottom: spacing[4],
  },
  paymentMethodContent: {
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: spacing[2],
  },
  paymentMethodName: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
    textAlign: 'center',
  },
  paymentMethodDescription: {
    fontSize: typography.fontSize.xs.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  valuesCard: {
    marginHorizontal: spacing[5],
    alignItems: 'center',
  },
  valuesContent: {
    alignItems: 'center',
  },
  valuesTitle: {
    fontSize: typography.fontSize['2xl'].size,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  valuesDescription: {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight * 1.5,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[4],
  },
  valueItem: {
    alignItems: 'center',
    width: '40%',
  },
  valueIcon: {
    fontSize: 24,
    marginBottom: spacing[2],
  },
  valueText: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
});