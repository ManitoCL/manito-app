import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvailabilityCalendarProps {
  workingHours: any;
  isAvailable: boolean;
  onWorkingHoursChange: (hours: any) => void;
  onAvailabilityChange: (available: boolean) => void;
  isEditing: boolean;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendario de Disponibilidad</Text>
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