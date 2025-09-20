import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PricingManagerProps {
  hourlyRate: number;
  services: string[];
  onHourlyRateChange: (rate: number) => void;
  isEditing: boolean;
}

export const PricingManager: React.FC<PricingManagerProps> = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Precios</Text>
      <Text style={styles.subtitle}>Funcionalidad en desarrollo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
});