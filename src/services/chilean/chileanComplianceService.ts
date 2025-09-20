/**
 * Chilean Compliance Service
 *
 * Comprehensive service for managing Chilean legal compliance, tax documents,
 * trust scoring, and regulatory requirements for the Manito marketplace.
 */

import { supabase } from '../database/supabaseClient';
import {
  chileanRutValidationService,
  performComprehensiveValidation,
  RutValidationResponse,
  BackgroundCheckResponse
} from './rutValidationApi';

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface TrustScoreResult {
  success: boolean;
  user_id: string;
  trust_score: number;
  trust_level: 'unverified' | 'basic' | 'verified' | 'premium' | 'elite';
  score_breakdown: {
    rut_verification: number;
    background_check: number;
    document_verification: number;
    profile_completion: number;
    review_history: number;
    certifications: number;
  };
  calculated_at: string;
}

export type VerificationStage =
  | 'document_upload'
  | 'rut_verification'
  | 'background_check'
  | 'sii_validation'
  | 'manual_review'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type ChileanDocumentType =
  | 'boleta_honorarios'
  | 'boleta_servicios'
  | 'factura_electronica'
  | 'factura_exenta'
  | 'nota_credito'
  | 'nota_debito';

// ========================================
// CHILEAN COMPLIANCE SERVICE
// ========================================

class ChileanComplianceService {

  /**
   * Initialize Chilean compliance for a user
   */
  async initializeCompliance(rutNumber?: string): Promise<{
    success: boolean;
    message: string;
    next_steps?: string[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('initialize_chilean_compliance', {
          rut_number: rutNumber
        });

      if (error) {
        console.error('Error initializing compliance:', error);
        return {
          success: false,
          message: 'Failed to initialize compliance',
          error: error.message
        };
      }

      return data;
    } catch (error) {
      console.error('Compliance initialization error:', error);
      return {
        success: false,
        message: 'Failed to initialize compliance',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate trust score for user
   */
  async calculateTrustScore(userId?: string): Promise<TrustScoreResult> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_trust_score', {
          target_user_id: userId
        });

      if (error) {
        console.error('Error calculating trust score:', error);
        return {
          success: false,
          user_id: userId || '',
          trust_score: 0,
          trust_level: 'unverified',
          score_breakdown: {
            rut_verification: 0,
            background_check: 0,
            document_verification: 0,
            profile_completion: 0,
            review_history: 0,
            certifications: 0
          },
          calculated_at: new Date().toISOString()
        };
      }

      return data;
    } catch (error) {
      console.error('Trust score calculation error:', error);
      return {
        success: false,
        user_id: userId || '',
        trust_score: 0,
        trust_level: 'unverified',
        score_breakdown: {
          rut_verification: 0,
          background_check: 0,
          document_verification: 0,
          profile_completion: 0,
          review_history: 0,
          certifications: 0
        },
        calculated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Check if current date is a Chilean holiday
   */
  async isChileanHoliday(date: Date): Promise<{
    is_holiday: boolean;
    holiday_name?: string;
    affects_service_delivery?: boolean;
    premium_rate_multiplier?: number;
  }> {
    try {
      const dateString = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('chilean_holidays')
        .select('holiday_name, affects_service_delivery, premium_rate_multiplier')
        .eq('holiday_date', dateString)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        console.error('Error checking Chilean holiday:', error);
        return { is_holiday: false };
      }

      if (data) {
        return {
          is_holiday: true,
          holiday_name: data.holiday_name,
          affects_service_delivery: data.affects_service_delivery,
          premium_rate_multiplier: data.premium_rate_multiplier
        };
      }

      return { is_holiday: false };
    } catch (error) {
      console.error('Holiday check error:', error);
      return { is_holiday: false };
    }
  }
}

// Export singleton instance
export const chileanComplianceService = new ChileanComplianceService();

// Helper functions for easy integration
export const initializeChileanCompliance = (rutNumber?: string) =>
  chileanComplianceService.initializeCompliance(rutNumber);

export const calculateUserTrustScore = (userId?: string) =>
  chileanComplianceService.calculateTrustScore(userId);

export const checkChileanHoliday = (date: Date) =>
  chileanComplianceService.isChileanHoliday(date);