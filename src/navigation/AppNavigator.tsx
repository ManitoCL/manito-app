import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useEnterpriseAuth';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { LoadingScreen } from '../components/LoadingScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, isReady } = useAuth();

  // Deep link handling is done in AuthMiddleware - no additional handling needed here

  // Show loading screen while auth state is being determined
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Determine which navigator to show based on auth state
  // isReady means authenticated + email verified + profile exists

  return (
    <NavigationContainer
      linking={{
        prefixes: ['manito://', 'https://auth.manito.cl'],
        config: {
          screens: {
            Auth: {
              screens: {
                UserTypeSelection: 'auth/user-type',
                SignUp: 'auth/signup',
                EmailConfirmation: 'auth/email-confirmation',
                EmailConfirmed: 'auth/email-confirmed',
              },
            },
            Main: {
              screens: {
                Home: 'home',
                Profile: 'profile',
              },
            },
          },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isReady ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}