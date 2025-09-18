/**
 * Navigation Updates for Landing Page Integration
 * Copy these changes to integrate the enterprise landing page
 */

// 1. UPDATE: src/types/index.ts
// Add Landing to AuthStackParamList:
/*
export type AuthStackParamList = {
  Landing: undefined;
  UserTypeSelection: undefined;
  SignUp: { userType: UserType };
  EmailConfirmation: {
    email: string;
    userType: UserType;
    isSignUp: boolean;
    password?: string;
  };
  EmailConfirmed: undefined;
};
*/

// 2. UPDATE: src/navigation/AuthNavigator.tsx
// Replace the entire file content with:
/*
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  UserTypeSelectionScreen,
  SignUpScreen,
  EmailConfirmationScreen,
  EmailConfirmedScreen,
} from '../screens/auth';
import { LandingScreen } from '../screens/landing';
import { AuthStackParamList } from '../types';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
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
      />
      <Stack.Screen
        name="UserTypeSelection"
        component={UserTypeSelectionScreen}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
      />
      <Stack.Screen
        name="EmailConfirmation"
        component={EmailConfirmationScreen}
      />
      <Stack.Screen
        name="EmailConfirmed"
        component={EmailConfirmedScreen}
      />
    </Stack.Navigator>
  );
};
*/

// 3. UPDATE: src/navigation/AppNavigator.tsx
// Add Landing to linking config:
/*
linking={{
  prefixes: ['manito://', 'https://auth.manito.cl'],
  config: {
    screens: {
      Auth: {
        screens: {
          Landing: 'landing',
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
*/

// 4. INSTALL DEPENDENCIES:
/*
npm install expo-linear-gradient react-native-svg
*/

// 5. UPDATE: src/components/ui/index.ts
// Add enterprise components:
/*
// UI Components Export
export { Button } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';

export { Input } from './Input';
export type { InputVariant } from './Input';

export { PhoneInput } from './PhoneInput';

export { Card } from './Card';

// Enterprise Components
export { EnterpriseButton } from './EnterpriseButton';
export type { EnterpriseButtonProps } from './EnterpriseButton';

export { EnterpriseCard } from './EnterpriseCard';
export type { EnterpriseCardProps } from './EnterpriseCard';

// Re-export LoadingScreen from parent components directory
export { LoadingScreen } from '../LoadingScreen';
*/