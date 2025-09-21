/**
 * Enterprise Analytics Service - Mixpanel Integration
 * Tracks user behavior across signup funnel and app usage
 * Optimized for Chilean market and marketplace metrics
 */

import { Mixpanel } from 'mixpanel-react-native';

interface AnalyticsConfig {
  token: string;
  enableDebug: boolean;
}

interface UserProperties {
  user_id?: string;
  email?: string;
  user_type?: 'customer' | 'provider' | 'admin';
  full_name?: string;
  phone_number?: string;
  is_verified?: boolean;
  signup_method?: string;
  device_type?: 'ios' | 'android' | 'web';
  app_version?: string;
}

interface EventProperties {
  [key: string]: string | number | boolean | null;
}

class AnalyticsService {
  private mixpanel: any = null;
  private isInitialized = false;
  private eventQueue: Array<{ event: string; properties: EventProperties }> = [];

  /**
   * Initialize analytics with Mixpanel
   */
  async initialize(config: AnalyticsConfig): Promise<void> {
    try {
      if (this.isInitialized) return;

      console.log('🔬 Analytics: Initializing Mixpanel...');

      this.mixpanel = new Mixpanel(config.token, config.enableDebug);
      await this.mixpanel.init();

      this.isInitialized = true;
      console.log('✅ Analytics: Mixpanel initialized successfully');

      // Process queued events
      if (this.eventQueue.length > 0) {
        console.log(`📊 Analytics: Processing ${this.eventQueue.length} queued events`);
        for (const queuedEvent of this.eventQueue) {
          await this.track(queuedEvent.event, queuedEvent.properties);
        }
        this.eventQueue = [];
      }

    } catch (error) {
      console.error('❌ Analytics: Initialization failed:', error);
    }
  }

  /**
   * Track an event with properties
   */
  async track(event: string, properties: EventProperties = {}): Promise<void> {
    try {
      if (!this.isInitialized) {
        // Queue events before initialization
        this.eventQueue.push({ event, properties });
        console.log(`📊 Analytics: Queued event "${event}" (not initialized yet)`);
        return;
      }

      const enrichedProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: 'mobile',
        app_version: '1.0.0', // TODO: Get from package.json
      };

      await this.mixpanel.track(event, enrichedProperties);
      console.log(`📊 Analytics: Tracked "${event}"`, enrichedProperties);

    } catch (error) {
      console.error(`❌ Analytics: Failed to track "${event}":`, error);
    }
  }

  /**
   * Identify user with properties
   */
  async identify(userId: string, userProperties: UserProperties = {}): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.warn('🔬 Analytics: Cannot identify user - not initialized');
        return;
      }

      await this.mixpanel.identify(userId);
      await this.mixpanel.getPeople().set(userProperties);

      console.log(`👤 Analytics: Identified user ${userId}`, userProperties);

    } catch (error) {
      console.error('❌ Analytics: Failed to identify user:', error);
    }
  }

  /**
   * Update user properties
   */
  async setUserProperties(properties: UserProperties): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.warn('🔬 Analytics: Cannot set user properties - not initialized');
        return;
      }

      await this.mixpanel.getPeople().set(properties);
      console.log('👤 Analytics: Updated user properties', properties);

    } catch (error) {
      console.error('❌ Analytics: Failed to set user properties:', error);
    }
  }

  /**
   * Reset user identity (for logout)
   */
  async reset(): Promise<void> {
    try {
      if (!this.isInitialized) return;

      await this.mixpanel.reset();
      console.log('🔄 Analytics: User identity reset');

    } catch (error) {
      console.error('❌ Analytics: Failed to reset:', error);
    }
  }

  // ============================================================================
  // SIGNUP FUNNEL TRACKING METHODS
  // ============================================================================

  /**
   * Track signup flow started
   */
  async trackSignupStarted(userType: 'customer' | 'provider'): Promise<void> {
    await this.track('signup_started', {
      user_type: userType,
      flow: 'enterprise_signup',
    });
  }

  /**
   * Track email availability check
   */
  async trackEmailAvailabilityChecked(email: string, available: boolean, responseTime: number): Promise<void> {
    await this.track('email_availability_checked', {
      email_domain: email.split('@')[1],
      is_available: available,
      response_time_ms: responseTime,
    });
  }

  /**
   * Track form validation errors
   */
  async trackValidationError(field: string, error: string, userType: string): Promise<void> {
    await this.track('validation_error', {
      field,
      error_type: error,
      user_type: userType,
    });
  }

  /**
   * Track verification email sent
   */
  async trackVerificationEmailSent(email: string, userType: string): Promise<void> {
    await this.track('verification_email_sent', {
      email_domain: email.split('@')[1],
      user_type: userType,
    });
  }

  /**
   * Track verification email resent
   */
  async trackVerificationEmailResent(email: string, attempt: number): Promise<void> {
    await this.track('verification_email_resent', {
      email_domain: email.split('@')[1],
      resend_attempt: attempt,
    });
  }

  /**
   * Track verification polling started
   */
  async trackVerificationPollingStarted(email: string): Promise<void> {
    await this.track('verification_polling_started', {
      email_domain: email.split('@')[1],
    });
  }

  /**
   * Track verification completed
   */
  async trackVerificationCompleted(email: string, timeToComplete: number): Promise<void> {
    await this.track('verification_completed', {
      email_domain: email.split('@')[1],
      time_to_complete_seconds: timeToComplete,
    });
  }

  /**
   * Track user successfully signed in after verification
   */
  async trackSignupCompleted(userId: string, userType: string, timeFromStart: number): Promise<void> {
    await this.track('signup_completed', {
      user_id: userId,
      user_type: userType,
      total_time_seconds: timeFromStart,
      success: true,
    });
  }

  /**
   * Track signup abandonment
   */
  async trackSignupAbandoned(step: string, reason?: string): Promise<void> {
    await this.track('signup_abandoned', {
      abandonment_step: step,
      reason: reason || 'unknown',
    });
  }

  // ============================================================================
  // CHILEAN MARKET SPECIFIC TRACKING
  // ============================================================================

  /**
   * Track RUT validation attempts
   */
  async trackRutValidation(isValid: boolean, errorType?: string): Promise<void> {
    await this.track('rut_validation', {
      is_valid: isValid,
      error_type: errorType,
      market: 'chile',
    });
  }

  /**
   * Track comuna selection
   */
  async trackComunaSelected(comunaCode: string, region: string): Promise<void> {
    await this.track('comuna_selected', {
      comuna_code: comunaCode,
      region,
      market: 'chile',
    });
  }

  /**
   * Track Chilean phone validation
   */
  async trackPhoneValidation(isValid: boolean, phoneType: string): Promise<void> {
    await this.track('phone_validation', {
      is_valid: isValid,
      phone_type: phoneType,
      market: 'chile',
    });
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Export types for use in components
export type { UserProperties, EventProperties };