/**
 * Analytics Initialization - App Startup Integration
 * Initializes Mixpanel when app starts
 */

import { analytics } from './analytics';

export const initializeAnalytics = async (): Promise<void> => {
  try {
    const config = {
      token: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || '',
      enableDebug: __DEV__, // Enable debug mode in development
    };

    if (!config.token) {
      console.warn('🔬 Analytics: Mixpanel token not configured - tracking disabled');
      return;
    }

    await analytics.initialize(config);
    console.log('✅ Analytics: Successfully initialized');

  } catch (error) {
    console.error('❌ Analytics: Initialization failed:', error);
  }
};