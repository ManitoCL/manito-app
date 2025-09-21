/**
 * Debug Screen for Enterprise Verification System
 * Temporary screen for debugging user creation and token tracking issues
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';

export const DebugScreen: React.FC = () => {
  const { debugUserCreation, debugTokenTracking } = useEnterpriseAuth();
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDebugUserCreation = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await debugUserCreation(email.trim().toLowerCase());
      setResults({ type: 'user_creation', ...result });
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert('Error', 'Debug failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugTokenTracking = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await debugTokenTracking(email.trim().toLowerCase());
      setResults({ type: 'token_tracking', ...result });
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert('Error', 'Debug failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🐛 Enterprise Debug Tools</Text>
        <Text style={styles.subtitle}>
          Debugging tools for user creation and token tracking
        </Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Email Address:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email to debug"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleDebugUserCreation}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Loading...' : 'Debug User Creation'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleDebugTokenTracking}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Loading...' : 'Debug Token Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        {results && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              📊 Debug Results ({results.type})
            </Text>

            {results.error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>❌ Error:</Text>
                <Text style={styles.errorDetail}>{results.error}</Text>
              </View>
            ) : (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>✅ Results:</Text>
                <Text style={styles.jsonText}>{formatJson(results.data)}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>📝 Instructions:</Text>
          <Text style={styles.instructionText}>
            1. Enter the email address you used for signup
          </Text>
          <Text style={styles.instructionText}>
            2. Click "Debug User Creation" to check if user/provider profiles exist
          </Text>
          <Text style={styles.instructionText}>
            3. Click "Debug Token Tracking" to check verification token usage
          </Text>
          <Text style={styles.instructionText}>
            4. Check console logs for detailed debugging information
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  buttonSection: {
    gap: 12,
    marginBottom: 32,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#059669',
  },
  secondaryButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    marginBottom: 32,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#991B1B',
  },
  successContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  jsonText: {
    fontSize: 12,
    color: '#065F46',
    fontFamily: 'monospace',
  },
  instructionsSection: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#1D4ED8',
    marginBottom: 4,
  },
});