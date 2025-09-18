import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ForgotPasswordScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text style={styles.placeholder}>Forgot password screen coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;