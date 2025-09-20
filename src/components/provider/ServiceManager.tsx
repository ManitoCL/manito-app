import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ServiceManagerProps {
  services: string[];
  specialties: string[];
  certifications: string[];
  serviceAreas: string[];
  onServicesChange: (services: string[]) => void;
  onSpecialtiesChange: (specialties: string[]) => void;
  onCertificationsChange: (certifications: string[]) => void;
  onServiceAreasChange: (areas: string[]) => void;
  isEditing: boolean;
}

export const ServiceManager: React.FC<ServiceManagerProps> = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Servicios</Text>
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