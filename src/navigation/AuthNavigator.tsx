import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  EnterpriseLoginScreen,
  EnterpriseSignUpScreen,
  EnterpriseEmailConfirmationScreen,
  EmailConfirmedScreen,
} from '../screens/auth';
import { LandingScreen } from '../screens/landing';
import { AuthStackParamList } from '../types';
import { useAuth } from '../hooks/useEnterpriseAuth';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isEmailVerified,
    shouldShowEmailVerification,
    onboardingStep,
    needsEmailVerification
  } = useAuth();

  // Debug navigation state
  console.log('🔍 AuthNavigator state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isAuthenticated,
    isEmailVerified,
    shouldShowEmailVerification,
    onboardingStep,
    needsEmailVerification
  });

  // Instagram/Meta pattern: Render different stacks based on auth state
  if (shouldShowEmailVerification && user?.email) {
    console.log('🏗️ AuthNavigator: Rendering EmailConfirmation stack');

    return (
      <Stack.Navigator
        initialRouteName="EmailConfirmation"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F9FAFB' },
        }}
      >
        <Stack.Screen
          name="EmailConfirmation"
          component={EnterpriseEmailConfirmationScreen}
          initialParams={{
            email: user.email,
            userType: user.userType || 'customer',
            isSignUp: true
          }}
        />
        <Stack.Screen
          name="EmailConfirmed"
          component={EmailConfirmedScreen}
        />
        {/* Keep other screens available for back navigation */}
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
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
        />
      </Stack.Navigator>
    );
  }

  // Default auth stack
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
      />
      <Stack.Screen
        name="EmailConfirmation"
        component={EnterpriseEmailConfirmationScreen}
      />
      <Stack.Screen
        name="EmailConfirmed"
        component={EmailConfirmedScreen}
      />
    </Stack.Navigator>
  );
};