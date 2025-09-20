/**
 * PHASE 2: Enterprise 3-State Navigation (Meta/Instagram Pattern)
 * Replaces complex Redux auth navigation with simple 3-state model
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEnterpriseAuth } from '../hooks/useEnterpriseAuth';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { ProfileSetupNavigator } from './ProfileSetupNavigator';
import { LoadingScreen } from '../components/LoadingScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  console.log('🚀 Phase 2 Enterprise Navigation: AppNavigator');

  // PHASE 2: Single enterprise auth hook (replaces Redux complexity)
  const {
    isLoading,
    authStatus,
    isAuthenticated,
    isEmailVerified,
    needsOnboarding,
    profile,
    error,
  } = useEnterpriseAuth();

  console.log('🔍 Phase 2 Navigation State:', {
    authStatus,
    isAuthenticated,
    isEmailVerified,
    needsOnboarding,
    hasProfile: !!profile,
    error: error || 'none',
  });

  // ENTERPRISE PATTERN: Show loading only on initial load
  if (isLoading) {
    console.log('⏳ Phase 2: Showing loading screen');
    return <LoadingScreen />;
  }

  // PHASE 2: 3-State Enterprise Navigation Model
  const getNavigatorForState = () => {
    switch (authStatus) {
      case 'unauthenticated':
        console.log('🔐 Phase 2: Unauthenticated - showing AuthNavigator');
        return <Stack.Screen name="Auth" component={AuthNavigator} />;

      case 'authenticated_pending_profile':
        console.log('⏸️ Phase 2: Pending profile - showing ProfileSetupNavigator');
        return <Stack.Screen name="ProfileSetup" component={ProfileSetupNavigator} />;

      case 'authenticated_ready':
        console.log('✅ Phase 2: Ready - showing MainNavigator');
        return <Stack.Screen name="Main" component={MainNavigator} />;

      default:
        console.warn('❌ Phase 2: Unknown auth status, defaulting to auth');
        return <Stack.Screen name="Auth" component={AuthNavigator} />;
    }
  };

  return (
    <NavigationContainer
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
                EmailConfirmed: {
                  path: 'auth/email-confirmed',
                  exact: true,
                },
                // ENTERPRISE: Device-agnostic verification endpoints
                AuthVerified: {
                  path: 'auth/verified',
                  exact: true,
                },
                AuthCallback: {
                  path: 'auth/callback',
                  exact: true,
                },
              },
            },
            ProfileSetup: {
              screens: {
                EmailVerificationPending: 'setup/email-verification',
                OnboardingFlow: 'setup/onboarding',
                ProfileCompletion: 'setup/profile',
              },
            },
            Main: {
              screens: {
                MainTabs: {
                  screens: {
                    Home: 'home',
                    Profile: 'profile',
                  },
                },
                CustomerProfile: 'profile/customer',
                ProviderProfile: 'profile/provider',
                ProfileManagement: 'profile/management',
                ProviderVerification: 'profile/verification',
              },
            },
          },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {getNavigatorForState()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}