/**
 * MainNavigator - Role-Specific Bottom Tab Navigation
 * Different navigation experience for consumers vs providers
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/ui';
import { theme } from '../theme';

import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const { user } = useAuth();
  const isProvider = user?.userType === 'provider';

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.semantic.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.neutral[500],
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="home"
              size="lg"
              color={color}
              style={{ opacity: focused ? 1 : 0.7 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: isProvider ? 'Clientes' : 'Buscar',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={isProvider ? 'users' : 'search'}
              size="lg"
              color={color}
              style={{ opacity: focused ? 1 : 0.7 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: isProvider ? 'Trabajos' : 'Solicitudes',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={isProvider ? 'job' : 'booking'}
              size="lg"
              color={color}
              style={{ opacity: focused ? 1 : 0.7 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Mensajes',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="message"
              size="lg"
              color={color}
              style={{ opacity: focused ? 1 : 0.7 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="profile"
              size="lg"
              color={color}
              style={{ opacity: focused ? 1 : 0.7 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;