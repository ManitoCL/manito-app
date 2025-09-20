import React from 'react';
import { Platform, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../types';
import { HomeScreen, ProfileScreen } from '../screens/main';
import { HomeIcon, UserIcon } from '../components/icons';

const Tab = createBottomTabNavigator<MainStackParamList>();

// Chilean marketplace design tokens
const DESIGN_TOKENS = {
  colors: {
    // Primary brand colors - professional and trustworthy
    primary: '#2563EB', // Deep blue - trust and reliability
    primaryDark: '#1D4ED8',
    secondary: '#059669', // Emerald green - growth and prosperity (Chilean economic themes)

    // Neutral grays - modern and clean
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Background and surface colors
    white: '#FFFFFF',
    surface: '#FAFBFC',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Navigation specific
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabBarActive: '#2563EB', // Primary blue for active state
    tabBarInactive: '#6B7280', // Gray for inactive state
    tabBarActiveBackground: '#EFF6FF', // Light blue background for active state
  },

  typography: {
    fontSizes: {
      xs: 10,
      sm: 12,
      base: 14,
      lg: 16,
      xl: 18,
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
  },
};

export const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Calculate tab bar height with safe area
  const tabBarHeight = Platform.select({
    ios: 64 + insets.bottom, // 64px base height + safe area
    android: 64, // Android handles safe area differently
  }) || 64;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DESIGN_TOKENS.colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: DESIGN_TOKENS.colors.tabBarBorder,
          paddingTop: DESIGN_TOKENS.spacing.md,
          paddingBottom: Math.max(DESIGN_TOKENS.spacing.md, insets.bottom),
          paddingHorizontal: DESIGN_TOKENS.spacing.lg,
          height: tabBarHeight,
          // Add subtle shadow for depth
          ...DESIGN_TOKENS.shadows.sm,
          // Ensure tab bar stays above content
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: DESIGN_TOKENS.colors.tabBarActive,
        tabBarInactiveTintColor: DESIGN_TOKENS.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: DESIGN_TOKENS.typography.fontSizes.sm,
          fontWeight: DESIGN_TOKENS.typography.fontWeights.semibold,
          marginTop: DESIGN_TOKENS.spacing.xs,
          marginBottom: 2,
        },
        // Improved tab press feedback
        tabBarPressColor: Platform.OS === 'android' ? DESIGN_TOKENS.colors.tabBarActiveBackground : undefined,
        tabBarPressOpacity: Platform.OS === 'ios' ? 0.7 : undefined,

        // Better accessibility
        tabBarAccessibilityLabel: 'Navegación principal',
        tabBarAllowFontScaling: false, // Prevent font scaling issues
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused, color, size = 24 }) => (
            <HomeIcon
              filled={focused}
              color={color}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarAccessibilityLabel: 'Inicio - Buscar servicios para el hogar',
          tabBarTestID: 'main-tab-home',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused, color, size = 24 }) => (
            <UserIcon
              filled={focused}
              color={color}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarAccessibilityLabel: 'Perfil - Tu cuenta y configuración',
          tabBarTestID: 'main-tab-profile',
        }}
      />
    </Tab.Navigator>
  );
};