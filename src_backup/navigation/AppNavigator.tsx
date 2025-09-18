/**
 * AppNavigator - Frontend-UI-Expert Marketplace UX Pattern  
 * Proper onboarding flow: Landing → Browse → Auth when needed
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import GuestNavigator from './GuestNavigator';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { user, loading, pendingEmailConfirmation } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // If pending email confirmation, show auth flow
  // If user exists and no pending confirmation, show main app
  // Otherwise show guest flow
  const showAuthFlow = pendingEmailConfirmation;
  const showMainApp = user && !pendingEmailConfirmation;

  console.log('AppNavigator - User:', user?.id, 'Pending confirmation:', pendingEmailConfirmation, 'Show main app:', showMainApp, 'Show auth flow:', showAuthFlow);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showMainApp ? (
          // Authenticated user gets full app
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : showAuthFlow ? (
          // User needs email confirmation - show auth flow
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Guest gets browse-only experience with auth prompts
          <Stack.Screen name="Guest" component={GuestNavigator} />
        )}
        {/* Auth stack available for login/signup when not in auth flow */}
        {!showAuthFlow && (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ presentation: 'modal' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;