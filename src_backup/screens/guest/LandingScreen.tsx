/**
 * LandingScreen - Manito Chilean Home Services Marketplace
 * Fixed version with proper font sizing - no complex calculations
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Icon } from '../../components/ui';
import { ServiceCard } from '../../components/marketplace';
import { theme } from '../../theme';

const { width: screenWidth } = Dimensions.get('window') || { width: 0 };

const LandingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBrowseServices = () => {
    navigation.navigate('Browse' as never);
  };

  const handleGetStarted = () => {
    navigation.navigate('Auth' as never, { screen: 'Register' } as never);
  };

  const handleLogin = () => {
    navigation.navigate('Auth' as never, { screen: 'Login' } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Icon name="home" size="2xl" color="#FFD400" />
            </View>
            <Text style={styles.appName}>Manito</Text>
          </View>
          
          <Text style={styles.tagline}>
            Te echamos una manito al tiro
          </Text>
          
          <Text style={styles.subtitle}>
            Encuentra profesionales verificados para tu hogar en Chile. Rápido, seguro y confiable.
          </Text>
          
          {/* Trust indicators */}
          <View style={styles.trustContainer}>
            <View style={styles.trustIndicators}>
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>1,500+</Text>
                <Text style={styles.trustLabel}>Profesionales</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>4.8★</Text>
                <Text style={styles.trustLabel}>Calificación</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>10,000+</Text>
                <Text style={styles.trustLabel}>Trabajos</Text>
              </View>
            </View>
          </View>
          
          {/* Primary CTA */}
          <View style={styles.heroCTA}>
            <Button
              title="Buscar Servicios"
              onPress={handleBrowseServices}
              variant="secondary"
              size="large"
              fullWidth
            />
            <Button
              title="Crear Cuenta"
              onPress={handleGetStarted}
              variant="primary"
              size="large"
              fullWidth
            />
          </View>
        </View>

        {/* Value Propositions */}
        <View style={styles.benefits}>
          <Text style={styles.sectionTitle}>¿Por qué Manito es diferente?</Text>
          
          <View style={styles.benefitGrid}>
            <Card style={styles.benefitCard}>
              <View style={styles.benefitContent}>
                <View style={styles.benefitIconContainer}>
                  <Icon name="shield" size="xl" color="#16A34A" />
                </View>
                <Text style={styles.benefitTitle}>100% Verificados</Text>
                <Text style={styles.benefitDescription}>
                  RUT, antecedentes y certificaciones validadas
                </Text>
              </View>
            </Card>

            <Card style={styles.benefitCard}>
              <View style={styles.benefitContent}>
                <View style={styles.benefitIconContainer}>
                  <Icon name="lock" size="xl" color="#2B8ED6" />
                </View>
                <Text style={styles.benefitTitle}>Pago Seguro</Text>
                <Text style={styles.benefitDescription}>
                  Tu dinero protegido hasta completar el trabajo
                </Text>
              </View>
            </Card>

            <Card style={styles.benefitCard}>
              <View style={styles.benefitContent}>
                <View style={styles.benefitIconContainer}>
                  <Icon name="star" size="xl" color="#FFD400" />
                </View>
                <Text style={styles.benefitTitle}>Reseñas Reales</Text>
                <Text style={styles.benefitDescription}>
                  Solo clientes verificados pueden calificar
                </Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Popular Services Preview */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Servicios Más Populares</Text>
          <Text style={styles.sectionSubtitle}>
            Más de 10,000 trabajos realizados con éxito
          </Text>
          
          <View style={styles.serviceGrid}>
            <ServiceCard
              icon="electrician"
              name="Electricista"
              description="Instalaciones y reparaciones eléctricas"
              providerCount={245}
              averageRating={4.7}
              priceRange="$15.000/h"
              onPress={handleBrowseServices}
              variant="compact"
              popular={true}
            />
            
            <ServiceCard
              icon="plumber"
              name="Gasfitero"
              description="Plomería y cañerías"
              providerCount={189}
              averageRating={4.6}
              priceRange="$20.000/h"
              onPress={handleBrowseServices}
              variant="compact"
            />
            
            <ServiceCard
              icon="cleaner"
              name="Limpieza"
              description="Limpieza profunda"
              providerCount={312}
              averageRating={4.9}
              priceRange="$12.000/h"
              onPress={handleBrowseServices}
              variant="compact"
              popular={true}
            />
            
            <ServiceCard
              icon="gardener"
              name="Jardinería"
              description="Mantención de jardines"
              providerCount={156}
              averageRating={4.5}
              priceRange="$18.000/h"
              onPress={handleBrowseServices}
              variant="compact"
            />
          </View>
          
          <Button
            title="Ver Todos los Servicios"
            onPress={handleBrowseServices}
            variant="ghost"
            fullWidth
          />
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Comienza hoy</Text>
          <Text style={styles.ctaSubtitle}>
            Únete a miles de familias que confían en Manito para sus hogares
          </Text>
          
          <View style={styles.ctaButtons}>
            <Button
              title="Crear Cuenta Gratis"
              onPress={handleGetStarted}
              variant="secondary"
              size="large"
              fullWidth
            />

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              variant="ghost"
              size="medium"
              fullWidth
            />
          </View>
        </View>

        {/* For Providers */}
        <View style={styles.providerSection}>
          <Text style={styles.providerTitle}>¿Eres profesional?</Text>
          <Text style={styles.providerDescription}>
            Conecta con clientes, aumenta tus ingresos y haz crecer tu negocio con Manito
          </Text>
          
          <View style={styles.providerBenefits}>
            <View style={styles.providerBenefitItem}>
              <Icon name="verified" size="sm" color="#16A34A" />
              <Text style={styles.providerBenefit}>Pagos garantizados</Text>
            </View>
            <View style={styles.providerBenefitItem}>
              <Icon name="verified" size="sm" color="#16A34A" />
              <Text style={styles.providerBenefit}>Controla tu agenda</Text>
            </View>
            <View style={styles.providerBenefitItem}>
              <Icon name="verified" size="sm" color="#16A34A" />
              <Text style={styles.providerBenefit}>Sin costo inicial</Text>
            </View>
          </View>
          
          <Button
            title="Ofrecer Servicios"
            onPress={() => navigation.navigate('Auth' as never, { 
              screen: 'Register',
              params: { userType: 'provider' }
            } as never)}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Hero Section
  hero: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#F0F4F8',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    backgroundColor: '#052A4A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  appName: {
    fontSize: screenWidth > 400 ? 36 : 28, // Simple responsive sizing
    fontWeight: 'bold',
    color: '#052A4A',
  },
  tagline: {
    fontSize: screenWidth > 400 ? 20 : 18,
    fontWeight: 'bold',
    color: '#052A4A',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  
  // Trust Indicators
  trustContainer: {
    width: '100%',
    marginBottom: 32,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD400',
  },
  trustLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Hero CTA
  heroCTA: {
    width: '100%',
    gap: 12,
  },
  
  // Benefits Section
  benefits: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 24,
    backgroundColor: '#F7FAFC',
  },
  benefitGrid: {
    gap: 16,
  },
  benefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
  },
  benefitContent: {
    alignItems: 'center',
  },
  benefitIconContainer: {
    backgroundColor: '#F7FAFC',
    borderRadius: 50,
    padding: 12,
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#052A4A',
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    textAlign: 'center',
  },
  
  // Services Section
  servicesSection: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#052A4A',
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  
  // CTA Section
  ctaSection: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
    backgroundColor: '#FFFEF0',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#052A4A',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaButtons: {
    width: '100%',
    gap: 12,
  },
  
  // Provider Section
  providerSection: {
    marginHorizontal: 24,
    marginVertical: 32,
    backgroundColor: '#052A4A',
    borderRadius: 14,
    padding: 32,
  },
  providerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  providerDescription: {
    fontSize: 16,
    color: '#D9E6F2',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  providerBenefits: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  providerBenefitItem: {
    alignItems: 'center',
    flex: 1,
  },
  providerBenefit: {
    fontSize: 12,
    color: '#D9E6F2',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LandingScreen;