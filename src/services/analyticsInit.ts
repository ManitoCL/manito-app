/**
 * Analytics Initialization - App Startup Integration
 * Initializes Mixpanel when app starts
 */

import Constants from 'expo-constants';
import { analytics } from './analytics';

export const initializeAnalytics = async (): Promise<void> => {
  try {
    const config = {
      token: Constants.expoConfig?.extra?.mixpanelToken || '',
      enableDebug: __DEV__, // Enable debug mode in development
    };

    if (!config.token) {
      console.warn('🔬 Analytics: Mixpanel token not configured - tracking disabled');
      return;
    }

    console.log('🔬 Analytics: Initializing with token:', config.token.substring(0, 8) + '...');
    await analytics.initialize(config);
    console.log('✅ Analytics: Successfully initialized');

  } catch (error) {
    console.error('❌ Analytics: Initialization failed:', error);
  }
};