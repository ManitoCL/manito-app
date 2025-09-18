import { supabase } from './supabaseClient';
import { Database } from '../../types';

type Tables = Database['public']['Tables'];
type ProviderProfile = Tables['provider_profiles']['Row'];
type ProviderProfileInsert = Tables['provider_profiles']['Insert'];
type ProviderProfileUpdate = Tables['provider_profiles']['Update'];
type VerificationDocument = Tables['verification_documents']['Row'];
type VerificationDocumentInsert = Tables['verification_documents']['Insert'];
type VerificationWorkflow = Tables['verification_workflows']['Row'];
type VerificationWorkflowInsert = Tables['verification_workflows']['Insert'];

export class VerificationService {
  // Provider Profile Management
  async createProviderProfile(profileData: ProviderProfileInsert): Promise<ProviderProfile> {
    const { data, error } = await supabase
      .from('provider_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create provider profile: ${error.message}`);
    }

    return data;
  }

  async getProviderProfile(userId: string): Promise<ProviderProfile | null> {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      throw new Error(`Failed to get provider profile: ${error.message}`);
    }

    return data;
  }

  async updateProviderProfile(
    userId: string,
    updates: ProviderProfileUpdate
  ): Promise<ProviderProfile> {
    const { data, error } = await supabase
      .from('provider_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update provider profile: ${error.message}`);
    }

    return data;
  }

  // Document Management
  async uploadDocument(documentData: VerificationDocumentInsert): Promise<VerificationDocument> {
    const { data, error } = await supabase
      .from('verification_documents')
      .insert(documentData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    return data;
  }

  async getProviderDocuments(providerId: string): Promise<VerificationDocument[]> {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get provider documents: ${error.message}`);
    }

    return data || [];
  }

  async updateDocumentStatus(
    documentId: string,
    status: VerificationDocument['upload_status'],
    verificationResult?: any
  ): Promise<VerificationDocument> {
    const { data, error } = await supabase
      .from('verification_documents')
      .update({
        upload_status: status,
        verification_result: verificationResult,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update document status: ${error.message}`);
    }

    return data;
  }

  // Workflow Management
  async createWorkflowStep(workflowData: VerificationWorkflowInsert): Promise<VerificationWorkflow> {
    const { data, error } = await supabase
      .from('verification_workflows')
      .insert(workflowData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create workflow step: ${error.message}`);
    }

    return data;
  }

  async getProviderWorkflow(providerId: string): Promise<VerificationWorkflow[]> {
    const { data, error } = await supabase
      .from('verification_workflows')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get provider workflow: ${error.message}`);
    }

    return data || [];
  }

  async updateWorkflowStep(
    workflowId: string,
    status: VerificationWorkflow['status'],
    errorMessage?: string,
    metadata?: any
  ): Promise<VerificationWorkflow> {
    const updates: Partial<VerificationWorkflow> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    if (metadata) {
      updates.metadata = metadata;
    }

    const { data, error } = await supabase
      .from('verification_workflows')
      .update(updates)
      .eq('id', workflowId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update workflow step: ${error.message}`);
    }

    return data;
  }

  // Verification Status
  async getVerificationStatus(providerId: string) {
    const { data, error } = await supabase
      .rpc('get_provider_verification_status', {
        provider_id: providerId
      });

    if (error) {
      throw new Error(`Failed to get verification status: ${error.message}`);
    }

    return data;
  }

  async calculateVerificationScore(providerId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_verification_score', {
        provider_id: providerId
      });

    if (error) {
      throw new Error(`Failed to calculate verification score: ${error.message}`);
    }

    return data || 0;
  }

  // Comprehensive Verification Overview
  async getProviderVerificationOverview(userId: string) {
    try {
      // Get provider profile
      const profile = await this.getProviderProfile(userId);
      if (!profile) {
        throw new Error('Provider profile not found');
      }

      // Get documents
      const documents = await this.getProviderDocuments(profile.id);

      // Get workflow steps
      const workflowSteps = await this.getProviderWorkflow(profile.id);

      // Get verification status
      const status = await this.getVerificationStatus(profile.id);

      // Calculate completion percentage
      const requiredDocuments = ['cedula_front', 'cedula_back', 'selfie'];
      const uploadedDocuments = documents.filter(doc =>
        requiredDocuments.includes(doc.document_type) &&
        doc.upload_status === 'uploaded'
      );
      const completionPercentage = Math.round((uploadedDocuments.length / requiredDocuments.length) * 100);

      return {
        profile,
        documents,
        workflowSteps,
        status,
        completionPercentage,
        isComplete: completionPercentage === 100,
        nextStep: this.determineNextStep(documents, workflowSteps, profile),
      };
    } catch (error) {
      console.error('Error getting verification overview:', error);
      throw error;
    }
  }

  private determineNextStep(
    documents: VerificationDocument[],
    workflowSteps: VerificationWorkflow[],
    profile: ProviderProfile
  ): string {
    const requiredDocs = ['cedula_front', 'cedula_back', 'selfie'];
    const uploadedDocs = documents.filter(doc =>
      requiredDocs.includes(doc.document_type) &&
      doc.upload_status === 'uploaded'
    );

    // Check if documents are missing
    const missingDocs = requiredDocs.filter(docType =>
      !uploadedDocs.some(doc => doc.document_type === docType)
    );

    if (missingDocs.length > 0) {
      return 'upload_documents';
    }

    // Check verification status
    switch (profile.verification_status) {
      case 'pending':
        return 'wait_review';
      case 'in_review':
        return 'under_review';
      case 'approved':
        return 'completed';
      case 'rejected':
        return 'resubmit_documents';
      default:
        return 'upload_documents';
    }
  }
}

// Export singleton instance
export const verificationService = new VerificationService();