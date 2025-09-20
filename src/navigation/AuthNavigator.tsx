/**
 * PHASE 2: Enterprise Auth Navigator (Unauthenticated State Only)
 * Simplified navigator for unauthenticated users - no complex state logic
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  EnterpriseLoginScreen,
  EnterpriseSignUpScreen,
  EmailVerificationPendingScreen,
  EmailConfirmedScreen,
  UniversalAuthHandlerScreen,
} from '../screens/auth';
import { LandingScreen } from '../screens/landing';
import { AuthStackParamList } from '../types';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  console.log('🚀 Phase 2: AuthNavigator (unauthenticated state only)');

  // PHASE 2 ENTERPRISE: Simple auth stack - no complex state logic
  // All state management moved to AppNavigator 3-state pattern
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{
          // ENTERPRISE: Landing is the entry point
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={EnterpriseLoginScreen}
        options={{
          title: 'Iniciar Sesión',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={EnterpriseSignUpScreen}
        options={{
          title: 'Crear Cuenta',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="EmailVerificationPending"
        component={EmailVerificationPendingScreen}
        options={{
          title: 'Verificar Email',
          headerShown: true,
          headerBackTitleVisible: false,
          headerLeft: () => null, // Prevent going back to signup
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="EmailConfirmed"
        component={EmailConfirmedScreen}
        options={{
          // ENTERPRISE: Email confirmed is a terminal state
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      {/* ENTERPRISE: Device-agnostic auth verification handlers */}
      <Stack.Screen
        name="AuthVerified"
        component={UniversalAuthHandlerScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="AuthCallback"
        component={UniversalAuthHandlerScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};