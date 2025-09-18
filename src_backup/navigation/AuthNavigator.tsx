import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import EmailConfirmationScreen from '../screens/auth/EmailConfirmationScreen';
import EmailConfirmedScreen from '../screens/auth/EmailConfirmedScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { pendingEmailConfirmation, pendingConfirmationData } = useAuth();

  console.log('AuthNavigator - pendingEmailConfirmation:', pendingEmailConfirmation, 'data:', pendingConfirmationData);

  // If pending email confirmation, show EmailConfirmation screen directly
  if (pendingEmailConfirmation && pendingConfirmationData) {
    return (
      <EmailConfirmationScreen
        email={pendingConfirmationData.email}
        userType={pendingConfirmationData.userType}
      />
    );
  }

  // Otherwise show normal auth flow
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
      <Stack.Screen name="EmailConfirmed" component={EmailConfirmedScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;