import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './ui';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // ENTERPRISE DEBUGGING: Enhanced error capture for development
    console.error('🚨 ErrorBoundary caught an error:', {
      message: error?.message || 'Unknown error',
      name: error?.name || 'Unknown error type',
      stack: error?.stack || 'No stack trace',
      toString: error?.toString() || 'Cannot stringify error',
      componentStack: errorInfo?.componentStack || 'No component stack',
      errorBoundaryStack: errorInfo?.errorBoundaryStack || 'No error boundary stack',
      rawError: error,
      rawErrorInfo: errorInfo,
    });

    // Additional debugging for non-standard error objects
    if (error && typeof error === 'object') {
      const keys = Object.keys(error);
      const values = Object.values(error);
      console.error('🔍 Error object keys:', keys);
      console.error('🔍 Error object values:', values);

      // Show each key-value pair explicitly
      keys.forEach((key, index) => {
        console.error(`🔍 Error[${key}]:`, values[index]);
      });

      // Try different ways to extract error information
      console.error('🔍 error.message:', (error as any)?.message);
      console.error('🔍 error.error:', (error as any)?.error);
      console.error('🔍 error.status:', (error as any)?.status);
      console.error('🔍 error.data:', (error as any)?.data);
      console.error('🔍 JSON.stringify(error):', JSON.stringify(error, null, 2));
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>=</Text>
            <Text style={styles.title}>�Oops! Algo sali� mal</Text>
            <Text style={styles.message}>
              Ocurri� un error inesperado. Por favor intenta nuevamente.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Detalles del error:</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}

            <View style={styles.actions}>
              <Button
                title="Intentar nuevamente"
                onPress={this.handleReset}
                style={styles.retryButton}
              />
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
  },
  retryButton: {
    width: '100%',
  },
});