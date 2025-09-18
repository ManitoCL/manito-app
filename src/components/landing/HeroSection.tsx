/**
 * Manito Landing - Professional Mobile-First Marketplace Design
 * Full page swipable sections with fixed auth buttons
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { colors, typography, spacing, shadows, borderRadius } from '../../design/tokens';
import { Icons } from '../icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HeroSectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// Simple pagination dot component without problematic animations
const PaginationDot: React.FC<{ isActive: boolean; index: number }> = ({ isActive, index }) => {
  return (
    <View
      style={[
        styles.paginationDot,
        isActive && styles.paginationDotActive,
      ]}
      accessible={true}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`Página ${index + 1}`}
    />
  );
};

const pages = [
  {
    type: 'intro',
    title: 'Manito',
    subtitle: 'Servicios para tu hogar',
    headline: 'Encuentra profesionales confiables',
    description: 'Electricistas, plomeros, limpieza y más.\nVerificados y con garantía.',
    trustMetric: '25,000+ servicios completados',
  },
  {
    type: 'feature',
    icon: <Icons.Search size={56} color={colors.secondary[500]} />,
    title: 'Busca y compara',
    description: 'Encuentra profesionales cerca de ti, compara precios y lee reseñas de otros usuarios',
  },
  {
    type: 'feature',
    icon: <Icons.CheckCircle size={56} color={colors.secondary[500]} />,
    title: 'Reserva fácil',
    description: 'Agenda tu servicio en minutos con fecha y hora que te convenga',
  },
  {
    type: 'feature',
    icon: <Icons.Shield size={56} color={colors.secondary[500]} />,
    title: 'Pago seguro',
    description: 'Paga cuando el trabajo esté listo. 100% protegido con garantía incluida',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onLogin }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setCurrentPage(index);

    // Hide swipe hint after first swipe
    if (showSwipeHint && scrollPosition > 10) {
      setShowSwipeHint(false);
    }
  };

  const renderPage = (page: any, index: number) => {
    if (page.type === 'intro') {
      return (
        <View key={index} style={styles.page}>
          <View style={styles.introContent}>
            {/* Brand Header */}
            <View style={styles.brandHeader}>
              <View style={styles.brandMark}>
                <Image
                  source={require('../../../assets/manito_logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandName}>Manito</Text>
              <Text style={styles.brandTagline}>{page.subtitle}</Text>
            </View>

            {/* Value Proposition */}
            <View style={styles.valueSection}>
              <Text style={styles.headline}>
                {page.headline.split(' ').slice(0, 2).join(' ')}{'\n'}
                <Text style={styles.headlineHighlight}>
                  {page.headline.split(' ').slice(2).join(' ')}
                </Text>
              </Text>

              <Text style={styles.description}>
                {page.description}
              </Text>
            </View>

            {/* Trust Signal */}
            <View style={styles.trustSignal}>
              <View style={styles.trustIcon}>
                <Icons.Shield size={20} color={colors.success[500]} />
              </View>
              <Text style={styles.trustText}>
                {page.trustMetric}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View key={index} style={styles.page}>
        <View style={styles.featureContent}>
          <View style={styles.featureIconContainer}>
            <View style={styles.featureIcon}>
              {page.icon}
            </View>
          </View>

          <View style={styles.featureTextContent}>
            <Text style={styles.featureTitle}>{page.title}</Text>
            <Text style={styles.featureDescription}>{page.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Swipable Content */}
      <View style={styles.swipeableContent}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          accessible={true}
          accessibilityRole="none"
          accessibilityLabel="Información de la aplicación"
          accessibilityHint="Desliza horizontalmente para ver las características"
        >
          {pages.map((page, index) => renderPage(page, index))}
        </ScrollView>


        {/* Swipe Hint */}
        {showSwipeHint && currentPage === 0 && (
          <View style={styles.swipeHint}>
            <View style={styles.swipeHintContent}>
              <Text style={styles.swipeHintText}>Desliza para explorar</Text>
              <View style={styles.swipeIndicator}>
                <Text style={styles.swipeArrow}>→</Text>
              </View>
            </View>
          </View>
        )}

        {/* Progress Indicators */}
        <View style={styles.progressSection}>
          <View
            style={styles.pagination}
            accessible={true}
            accessibilityRole="tablist"
            accessibilityLabel={`Página ${currentPage + 1} de ${pages.length}`}
            accessibilityHint="Desliza horizontalmente para navegar entre páginas"
          >
            {pages.map((_, index) => (
              <PaginationDot
                key={index}
                isActive={currentPage === index}
                index={index}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Fixed Auth Section */}
      <View style={styles.authSection}>
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Crear cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Brand Footer */}
        <View style={styles.brandFooter}>
          <View style={styles.brandFooterContent}>
            <View style={styles.miniLogo}>
              <Text style={styles.miniLogoSymbol}>◆</Text>
            </View>
            <View style={styles.brandFooterText}>
              <Text style={styles.brandFooterName}>Manito</Text>
              <Text style={styles.brandFooterSubtitle}>Servicios para tu hogar</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Layout Structure
  container: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
  swipeableContent: {
    flex: 1,
  },
  page: {
    width: screenWidth,
    height: screenHeight - 220, // Optimized space for auth section
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
  },

  // Intro Page Styles
  introContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: spacing[20], // Add top margin to avoid pagination dots
    marginBottom: spacing[16],
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: borderRadius['2xl'],
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
    ...shadows.md,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  brandName: {
    fontSize: typography.fontSize['4xl'].size,
    fontWeight: '800',
    color: colors.surface.primary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing[1],
  },
  brandTagline: {
    fontSize: typography.fontSize.base.size,
    color: colors.primary[200],
    fontWeight: '500',
    letterSpacing: typography.letterSpacing.wide,
  },
  valueSection: {
    alignItems: 'center',
    marginBottom: spacing[12],
    paddingHorizontal: spacing[2],
  },
  headline: {
    fontSize: typography.fontSize['4xl'].size,
    fontWeight: '700',
    color: colors.surface.primary,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: typography.fontSize['4xl'].lineHeight * 1.1,
    letterSpacing: typography.letterSpacing.tight,
  },
  headlineHighlight: {
    color: colors.secondary[500],
    fontWeight: '800',
  },
  description: {
    fontSize: typography.fontSize.xl.size,
    color: colors.primary[100],
    textAlign: 'center',
    lineHeight: typography.fontSize.xl.lineHeight * 1.3,
    fontWeight: '400',
    letterSpacing: typography.letterSpacing.normal,
    maxWidth: screenWidth * 0.85,
  },
  trustSignal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  trustIcon: {
    marginRight: spacing[2],
  },
  trustText: {
    fontSize: typography.fontSize.base.size,
    color: colors.success[300],
    fontWeight: '600',
    letterSpacing: typography.letterSpacing.wide,
  },

  // Feature Page Styles
  featureContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  featureIconContainer: {
    marginBottom: spacing[12],
  },
  featureIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius['3xl'],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  featureTextContent: {
    alignItems: 'center',
    maxWidth: screenWidth * 0.85,
  },
  featureTitle: {
    fontSize: typography.fontSize['4xl'].size,
    fontWeight: '700',
    color: colors.surface.primary,
    textAlign: 'center',
    marginBottom: spacing[6],
    letterSpacing: typography.letterSpacing.tight,
  },
  featureDescription: {
    fontSize: typography.fontSize.xl.size,
    color: colors.primary[100],
    textAlign: 'center',
    lineHeight: typography.fontSize.xl.lineHeight * 1.4,
    fontWeight: '400',
    letterSpacing: typography.letterSpacing.normal,
  },

  // Navigation & Indicators
  swipeHint: {
    position: 'absolute',
    bottom: spacing[24],
    alignSelf: 'center',
  },
  swipeHintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  swipeHintText: {
    fontSize: typography.fontSize.sm.size,
    color: colors.surface.primary,
    fontWeight: '500',
    marginRight: spacing[2],
  },
  swipeIndicator: {
    marginLeft: spacing[1],
  },
  swipeArrow: {
    fontSize: typography.fontSize.lg.size,
    color: colors.secondary[500],
    fontWeight: '700',
  },
  progressSection: {
    position: 'absolute',
    top: spacing[4], // Much higher - minimal padding from top
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: spacing[2],
    zIndex: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(0, 0, 0, 0.12)'
      : 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: spacing[1],
  },
  paginationDotActive: {
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary[500],
    marginHorizontal: spacing[1],
    ...shadows.sm,
  },
  pageCounter: {
    fontSize: typography.fontSize.sm.size,
    color: colors.primary[300],
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: typography.letterSpacing.wide,
  },

  // Auth Section
  authSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: spacing[6],
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[6],
  },
  authButtons: {
    marginBottom: spacing[6],
  },
  primaryButton: {
    backgroundColor: colors.secondary[500],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.secondary[400],
    ...shadows.lg,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.xl.size,
    fontWeight: '700',
    color: colors.surface.primary,
    letterSpacing: typography.letterSpacing.wide,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg.size,
    color: colors.surface.primary,
    fontWeight: '600',
    letterSpacing: typography.letterSpacing.wide,
  },

  // Enhanced Brand Footer
  brandFooter: {
    alignItems: 'center',
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  brandFooterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLogo: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  miniLogoSymbol: {
    fontSize: 12,
    color: colors.secondary[500],
    fontWeight: '600',
  },
  brandFooterText: {
    alignItems: 'flex-start',
  },
  brandFooterName: {
    fontSize: typography.fontSize.lg.size,
    fontWeight: '700',
    color: colors.surface.primary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: 1,
  },
  brandFooterSubtitle: {
    fontSize: typography.fontSize.sm.size,
    color: colors.primary[300],
    fontWeight: '500',
    letterSpacing: typography.letterSpacing.normal,
  },
});