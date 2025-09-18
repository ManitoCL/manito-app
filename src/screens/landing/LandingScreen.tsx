/**
 * Simple B2C Landing Screen
 * Clean, focused landing page for home services marketplace
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../design/tokens';
import { HeroSection } from '../../components/landing/HeroSection';

interface LandingScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const handleGetStarted = () => {
    // Navigate to signup (users can select type there)
    navigation.navigate('SignUp');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary[500]}
        translucent={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        decelerationRate="normal"
      >
        {/* Hero Section with Value Prop + Auth */}
        <HeroSection
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});