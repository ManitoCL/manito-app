/**
 * UserTypeSelection Component
 * Following frontend-ui-expert principles: mobile-first, marketplace UX patterns, Chilean market adaptation
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

interface UserTypeSelectionProps {
  onSelectType: (type: 'consumer' | 'provider') => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelectType }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>¡Bienvenido a Manito!</Text>
          <Text style={styles.subtitle}>
            ¿Cómo quieres usar la plataforma?
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* Consumer Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => onSelectType('consumer')}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🏠</Text>
            </View>
            <Text style={styles.optionTitle}>Necesito Servicios</Text>
            <Text style={styles.optionDescription}>
              Busco profesionales para servicios en mi hogar
            </Text>
            <View style={styles.benefitsList}>
              <Text style={styles.benefit}>• Encuentra profesionales verificados</Text>
              <Text style={styles.benefit}>• Pago seguro con garantía</Text>
              <Text style={styles.benefit}>• Reserva cuando necesites</Text>
              <Text style={styles.benefit}>• Califica y comenta servicios</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Continuar como Cliente</Text>
            </View>
          </TouchableOpacity>

          {/* Provider Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => onSelectType('provider')}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔧</Text>
            </View>
            <Text style={styles.optionTitle}>Ofrezco Servicios</Text>
            <Text style={styles.optionDescription}>
              Soy profesional y quiero ofrecer mis servicios
            </Text>
            <View style={styles.benefitsList}>
              <Text style={styles.benefit}>• Consigue más clientes</Text>
              <Text style={styles.benefit}>• Pagos garantizados</Text>
              <Text style={styles.benefit}>• Gestiona tu agenda</Text>
              <Text style={styles.benefit}>• Construye tu reputación</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Continuar como Profesional</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Podrás cambiar tu tipo de cuenta más adelante
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: 20,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefit: {
    fontSize: 15,
    color: '#444444',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default UserTypeSelection;