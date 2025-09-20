/**
 * Simple Social Proof Section
 * Clean testimonials and basic stats for B2C users
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../design/tokens';
import { EnterpriseCard } from '../ui/EnterpriseCard';
import { Icons } from '../icons';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  service: string;
}

interface SocialProofSectionProps {
  style?: any;
}

export const SocialProofSection: React.FC<SocialProofSectionProps> = ({ style }) => {
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'María González',
      location: 'Las Condes',
      rating: 5,
      comment: 'Excelente servicio de plomería. El profesional llegó puntual, hizo un trabajo impecable y el precio fue justo. Lo recomiendo 100%.',
      service: 'Plomería',
    },
    {
      id: '2',
      name: 'Carlos Ramírez',
      location: 'Providencia',
      rating: 5,
      comment: 'Contraté un electricista y quedé muy satisfecho. Todo funcionó perfecto desde la app hasta el pago. Muy fácil de usar.',
      service: 'Electricidad',
    },
    {
      id: '3',
      name: 'Ana Morales',
      location: 'Ñuñoa',
      rating: 5,
      comment: 'El servicio de limpieza fue espectacular. Llegaron a tiempo, fueron muy profesionales y mi casa quedó impecable.',
      service: 'Limpieza',
    },
  ];

  const stats = [
    {
      number: '25,000+',
      label: 'Servicios completados',
      icon: <Icons.CheckCircle size={24} color={colors.success[500]} />,
    },
    {
      number: '3,200+',
      label: 'Profesionales activos',
      icon: <Icons.VerifiedProfessional size={24} color={colors.primary[500]} />,
    },
    {
      number: '4.9★',
      label: 'Calificación promedio',
      icon: <Icons.Star size={24} color={colors.warning[500]} filled />,
    },
    {
      number: '98%',
      label: 'Clientes satisfechos',
      icon: <Icons.ThumbsUp size={24} color={colors.secondary[500]} />,
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icons.Star
            key={star}
            size={16}
            color={star <= rating ? colors.warning[500] : colors.neutral[300]}
            filled={star <= rating}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Simple Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          Lo que dicen nuestros clientes
        </Text>
        <Text style={styles.sectionSubtitle}>
          Miles de hogares chilenos ya confían en Manito
        </Text>
      </View>

      {/* Simple Statistics */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            {stat.icon}
            <Text style={styles.statNumber}>{stat.number}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Simple Testimonials */}
      <View style={styles.testimonialsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.testimonialsScrollContent}
          decelerationRate="fast"
          snapToInterval={300}
          snapToAlignment="start"
        >
          {testimonials.map((testimonial) => (
            <EnterpriseCard
              key={testimonial.id}
              variant="elevated"
              padding="lg"
              style={styles.testimonialCard}
            >
              <View style={styles.testimonialContent}>
                {/* Header */}
                <View style={styles.testimonialHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {testimonial.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.testimonialUserInfo}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <Text style={styles.testimonialLocation}>{testimonial.location}</Text>
                    {renderStars(testimonial.rating)}
                  </View>
                </View>

                {/* Comment */}
                <Text style={styles.testimonialComment}>
                  "{testimonial.comment}"
                </Text>

                {/* Service */}
                <View style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{testimonial.service}</Text>
                </View>
              </View>
            </EnterpriseCard>
          ))}
        </ScrollView>
      </View>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[12],
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'].size,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[2],
    fontFamily: typography.fontFamily.display[0],
  },
  statLabel: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  testimonialsContainer: {
    marginBottom: spacing[8],
  },
  testimonialsScrollContent: {
    paddingHorizontal: spacing[5],
    paddingRight: spacing[10],
  },
  testimonialCard: {
    width: 300,
    marginRight: spacing[4],
    minHeight: 200,
  },
  testimonialContent: {},
  testimonialHeader: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: "600",
    color: colors.primary[600],
  },
  testimonialUserInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: typography.fontSize.base.size,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  testimonialLocation: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  testimonialComment: {
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight * 1.4,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  serviceTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.sm,
  },
  serviceTagText: {
    fontSize: typography.fontSize.xs.size,
    fontWeight: "600",
    color: colors.primary[700],
  },
});