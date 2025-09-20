/**
 * PHASE 2: Profile Setup Navigator (Enterprise Middle State)
 * Handles authenticated_pending_profile state with device-agnostic polling
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useEnterpriseAuth } from '../hooks/useEnterpriseAuth';
// Removed: EmailVerificationPendingScreen (legacy polling screen, handled by deep link now)
import { OnboardingFlowScreen } from '../screens/setup/OnboardingFlowScreen';
import { ProfileCompletionScreen } from '../screens/setup/ProfileCompletionScreen';
import { ProfileSetupStackParamList } from '../types';

const Stack = createStackNavigator<ProfileSetupStackParamList>();

export const ProfileSetupNavigator: React.FC = () => {
  console.log('🚀 Phase 2: ProfileSetupNavigator');

  const {
    isEmailVerified,
    needsOnboarding,
    profile,
    authStatus,
  } = useEnterpriseAuth();

  console.log('🔍 ProfileSetup State:', {
    authStatus,
    isEmailVerified,
    needsOnboarding,
    hasProfile: !!profile,
  });

  // ENTERPRISE PATTERN: Skip legacy email verification screen (handled by deep link)
  const getInitialRoute = () => {
    // ENTERPRISE: Email verification handled by deep link in enterprise flow
    // Users only reach this navigator AFTER email verification via deep link

    if (needsOnboarding) {
      console.log('👋 Phase 2: Needs onboarding - showing OnboardingFlow');
      return 'OnboardingFlow';
    }

    console.log('📝 Phase 2: Profile completion needed - showing ProfileCompletion');
    return 'ProfileCompletion';
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F9FAFB' },
        // ENTERPRISE: Prevent back navigation during setup
        gestureEnabled: false,
      }}
    >
      {/* Removed: EmailVerificationPending screen (legacy polling, handled by deep link now) */}
      <Stack.Screen
        name="OnboardingFlow"
        component={OnboardingFlowScreen}
        options={{
          title: 'Bienvenido a Manito',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ProfileCompletion"
        component={ProfileCompletionScreen}
        options={{
          title: 'Completa tu Perfil',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};