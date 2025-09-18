import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/store';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { EnterpriseAuthInitializer } from './src/components/EnterpriseAuthInitializer';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <EnterpriseAuthInitializer />
          <AppNavigator />
          <StatusBar style="auto" />
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
