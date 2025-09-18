import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

interface LoadingScreenProps {
  message?: string;
  backgroundColor?: string;
}

const colors = {
  primary: '#2563EB',
  white: '#FFFFFF',
  gray: '#6B7280',
  background: '#F9FAFB',
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Cargando...',
  backgroundColor = colors.background,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.spinner}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
});