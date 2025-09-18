/**
 * Chilean RUT Validation API Integration
 *
 * Integrates with Chilean government APIs for RUT validation and background checks
 * Per user stories: "automatically validate RUT and check antecedentes"
 */

import { validateRut } from '../../utils/chilean/rutValidation';

export interface RutValidationResponse {
  success: boolean;
  isValid: boolean;
  rut: string;
  data?: {
    name?: string;
    status?: 'active' | 'inactive' | 'blocked';
    type?: 'natural' | 'juridica';
    registrationDate?: string;
    lastUpdate?: string;
  };
  error?: string;
  source: 'registro_civil' | 'sii' | 'local_validation';
  timestamp: string;
}

export interface BackgroundCheckResponse {
  success: boolean;
  rut: string;
  status: 'clean' | 'flagged' | 'criminal_record' | 'pending' | 'error';
  data?: {
    criminalRecord?: boolean;
    civilRecord?: boolean;
    commercialRecord?: boolean;
    details?: string[];
    lastCheckDate?: string;
    validUntil?: string;
  };
  error?: string;
  source: 'registro_civil' | 'poder_judicial' | 'mock';
  timestamp: string;
}

/**
 * Chilean RUT Validation Service
 * Integrates with official Chilean government APIs
 */
class ChileanRutValidationService {
  private readonly REGISTRO_CIVIL_BASE_URL = 'https://api.registrocivil.cl'; // Mock URL
  private readonly SII_BASE_URL = 'https://api.sii.cl'; // Mock URL
  private readonly PODER_JUDICIAL_BASE_URL = 'https://api.pjud.cl'; // Mock URL

  private apiKey: string | undefined;
  private timeout: number = 30000; // 30 seconds

  constructor() {
    // In production, these would come from environment variables
    this.apiKey = process.env.EXPO_PUBLIC_CHILEAN_API_KEY;
  }

  /**
   * Validate RUT with Registro Civil
   * Primary validation against official government records
   */
  async validateRutWithRegistroCivil(rut: string): Promise<RutValidationResponse> {
    try {
      // First, validate RUT format locally
      const localValidation = validateRut(rut);
      if (!localValidation.isValid) {
        return {
          success: false,
          isValid: false,
          rut,
          error: localValidation.error,
          source: 'local_validation',
          timestamp: new Date().toISOString(),
        };
      }

      // In production, this would call the actual Registro Civil API
      if (process.env.NODE_ENV === 'production' && this.apiKey) {
        return await this.callRegistroCivilAPI(rut);
      } else {
        // Mock implementation for development
        return await this.mockRegistroCivilValidation(rut);
      }
    } catch (error) {
      console.error('RUT validation error:', error);
      return {
        success: false,
        isValid: false,
        rut,
        error: 'Error connecting to validation service',
        source: 'registro_civil',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Call actual Registro Civil API (production)
   */
  private async callRegistroCivilAPI(rut: string): Promise<RutValidationResponse> {
    const cleanRut = rut.replace(/[^0-9K]/g, '');

    const response = await fetch(`${this.REGISTRO_CIVIL_BASE_URL}/validate-rut`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Source': 'manito-marketplace',
      },
      body: JSON.stringify({
        rut: cleanRut,
        requestId: `manito_${Date.now()}`,
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      isValid: data.valid || false,
      rut,
      data: {
        name: data.name,
        status: data.status,
        type: data.type,
        registrationDate: data.registrationDate,
        lastUpdate: data.lastUpdate,
      },
      source: 'registro_civil',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Mock Registro Civil validation for development
   */
  private async mockRegistroCivilValidation(rut: string): Promise<RutValidationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const cleanRut = rut.replace(/[^0-9K]/g, '');

    // Mock some valid RUTs for testing
    const mockValidRuts = [
      '12345678-5',
      '98765432-1',
      '11111111-1',
      '22222222-2',
    ];

    const isKnownValid = mockValidRuts.some(validRut =>
      validRut.replace(/[^0-9K]/g, '') === cleanRut
    );

    // Simulate 90% success rate for properly formatted RUTs
    const isValid = isKnownValid || Math.random() > 0.1;

    if (isValid) {
      return {
        success: true,
        isValid: true,
        rut,
        data: {
          name: 'JUAN CARLOS PEREZ GONZALEZ', // Mock name
          status: 'active',
          type: 'natural',
          registrationDate: '1990-05-15',
          lastUpdate: new Date().toISOString().split('T')[0],
        },
        source: 'registro_civil',
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: true,
        isValid: false,
        rut,
        error: 'RUT not found in Registro Civil database',
        source: 'registro_civil',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check background/criminal records
   * Per user stories: "check antecedentes automatically"
   */
  async checkBackground(rut: string): Promise<BackgroundCheckResponse> {
    try {
      // In production, this would call Poder Judicial or other official APIs
      if (process.env.NODE_ENV === 'production' && this.apiKey) {
        return await this.callBackgroundCheckAPI(rut);
      } else {
        // Mock implementation for development
        return await this.mockBackgroundCheck(rut);
      }
    } catch (error) {
      console.error('Background check error:', error);
      return {
        success: false,
        rut,
        status: 'error',
        error: 'Error connecting to background check service',
        source: 'poder_judicial',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Call actual background check API (production)
   */
  private async callBackgroundCheckAPI(rut: string): Promise<BackgroundCheckResponse> {
    const cleanRut = rut.replace(/[^0-9K]/g, '');

    const response = await fetch(`${this.PODER_JUDICIAL_BASE_URL}/background-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Source': 'manito-marketplace',
      },
      body: JSON.stringify({
        rut: cleanRut,
        checkTypes: ['criminal', 'civil', 'commercial'],
        requestId: `manito_bg_${Date.now()}`,
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(`Background check API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      rut,
      status: data.status,
      data: {
        criminalRecord: data.criminalRecord,
        civilRecord: data.civilRecord,
        commercialRecord: data.commercialRecord,
        details: data.details,
        lastCheckDate: data.lastCheckDate,
        validUntil: data.validUntil,
      },
      source: 'poder_judicial',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Mock background check for development
   */
  private async mockBackgroundCheck(rut: string): Promise<BackgroundCheckResponse> {
    // Simulate longer processing time for background checks
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));

    // Simulate different outcomes
    const outcomes = ['clean', 'clean', 'clean', 'clean', 'flagged']; // 80% clean, 20% flagged
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)] as 'clean' | 'flagged';

    const baseResponse = {
      success: true,
      rut,
      status: randomOutcome,
      source: 'mock' as const,
      timestamp: new Date().toISOString(),
    };

    if (randomOutcome === 'clean') {
      return {
        ...baseResponse,
        data: {
          criminalRecord: false,
          civilRecord: false,
          commercialRecord: false,
          details: [],
          lastCheckDate: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
        },
      };
    } else {
      return {
        ...baseResponse,
        data: {
          criminalRecord: false,
          civilRecord: true,
          commercialRecord: false,
          details: ['Pending civil case - non-criminal'],
          lastCheckDate: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      };
    }
  }

  /**
   * Comprehensive RUT validation combining multiple sources
   */
  async comprehensiveRutValidation(rut: string): Promise<{
    rutValidation: RutValidationResponse;
    backgroundCheck: BackgroundCheckResponse;
    overallScore: number;
    recommendation: 'approve' | 'review' | 'reject';
  }> {
    console.log(`🔍 Starting comprehensive RUT validation for: ${rut}`);

    // Step 1: Validate RUT with Registro Civil
    const rutValidation = await this.validateRutWithRegistroCivil(rut);
    console.log('✅ RUT validation completed:', rutValidation.isValid);

    // Step 2: Background check (only if RUT is valid)
    let backgroundCheck: BackgroundCheckResponse;
    if (rutValidation.isValid) {
      backgroundCheck = await this.checkBackground(rut);
      console.log('✅ Background check completed:', backgroundCheck.status);
    } else {
      backgroundCheck = {
        success: false,
        rut,
        status: 'error',
        error: 'Skipped due to invalid RUT',
        source: 'mock',
        timestamp: new Date().toISOString(),
      };
    }

    // Step 3: Calculate overall score
    let score = 0;

    // RUT validation score (60% weight)
    if (rutValidation.isValid) {
      score += 0.6;
    }

    // Background check score (40% weight)
    if (backgroundCheck.status === 'clean') {
      score += 0.4;
    } else if (backgroundCheck.status === 'flagged') {
      score += 0.2; // Partial credit for non-criminal issues
    }

    // Step 4: Make recommendation
    let recommendation: 'approve' | 'review' | 'reject';
    if (score >= 0.8) {
      recommendation = 'approve';
    } else if (score >= 0.4) {
      recommendation = 'review';
    } else {
      recommendation = 'reject';
    }

    console.log(`📊 Overall score: ${score}, Recommendation: ${recommendation}`);

    return {
      rutValidation,
      backgroundCheck,
      overallScore: score,
      recommendation,
    };
  }
}

// Export singleton instance
export const chileanRutValidationService = new ChileanRutValidationService();

// Helper functions for easy integration
export const validateRutWithGovernment = (rut: string) =>
  chileanRutValidationService.validateRutWithRegistroCivil(rut);

export const checkChileanBackground = (rut: string) =>
  chileanRutValidationService.checkBackground(rut);

export const performComprehensiveValidation = (rut: string) =>
  chileanRutValidationService.comprehensiveRutValidation(rut);