/**
 * GuestNavigator - Marketplace UX Specialist Pattern
 * Browse-only experience with strategic auth prompts
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import LandingScreen from '../screens/guest/LandingScreen';
import BrowseServicesScreen from '../screens/guest/BrowseServicesScreen';
import ServiceDetailScreen from '../screens/guest/ServiceDetailScreen';
import ProviderProfileScreen from '../screens/guest/ProviderProfileScreen';
import AuthPromptScreen from '../screens/guest/AuthPromptScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Browse stack for service discovery
const BrowseStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BrowseServices" component={BrowseServicesScreen} />
    <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
    <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
    <Stack.Screen name="AuthPrompt" component={AuthPromptScreen} />
  </Stack.Navigator>
);

const GuestNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
      }}
    >
      <Tab.Screen
        name="Landing"
        component={LandingScreen}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseStack}
        options={{
          tabBarLabel: 'Servicios',
        }}
      />
      <Tab.Screen
        name="GetStarted"
        component={AuthPromptScreen}
        options={{
          tabBarLabel: 'Empezar',
        }}
      />
    </Tab.Navigator>
  );
};

export default GuestNavigator;