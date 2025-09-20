import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EarningsTrackerProps {
  totalEarnings: number;
  completedJobs: number;
  avgJobValue: number;
  monthlyEarnings: number;
}

export const EarningsTracker: React.FC<EarningsTrackerProps> = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento de Ganancias</Text>
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