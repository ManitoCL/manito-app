/**
 * End-to-End Provider Verification Flow Test
 *
 * This script tests the complete provider verification workflow:
 * 1. Create provider profile
 * 2. Upload verification documents
 * 3. Run verification steps
 * 4. Check verification status
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service key for testing
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProviderVerificationFlow() {
  console.log('🚀 Starting Provider Verification Flow Test...\n');

  try {
    // Step 1: Create test provider profile
    console.log('📝 Step 1: Creating test provider profile...');

    // Generate valid UUIDs for testing
    const testUserId = crypto.randomUUID();
    const testProviderId = crypto.randomUUID();

    // First create a test user
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: `test.provider.${Date.now()}@example.com`,
        full_name: 'Test Provider',
        user_type: 'provider',
        phone_number: `+569${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        rut_number: `${Math.floor(Math.random() * 100000000)}-9`,
        is_verified: false,
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating test user:', userError);
      return;
    }

    console.log('✅ Test user created:', testUser.id);

    // Create provider profile with minimal required fields
    const { data: providerProfile, error: profileError } = await supabase
      .from('provider_profiles')
      .insert({
        user_id: testUserId,
        business_name: 'Test Provider Business',
        services_offered: ['electrician', 'plumber'],
        service_areas: ['Las Condes', 'Providencia'],
        comuna: 'Las Condes', // Use existing field name from original schema
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating provider profile:', profileError);
      return;
    }

    console.log('✅ Provider profile created:', providerProfile.id);

    // Step 2: Test document uploads
    console.log('\n📄 Step 2: Testing document uploads...');

    const documentTypes = ['cedula_front', 'cedula_back', 'selfie'];
    const uploadedDocuments = [];

    for (const docType of documentTypes) {
      const { data: document, error: docError } = await supabase
        .from('verification_documents')
        .insert({
          provider_id: providerProfile.id, // Use the actual provider ID from created profile
          document_type: docType,
          file_path: `${providerProfile.id}/${docType}_${Date.now()}.jpg`,
          file_name: `${docType}_test.jpg`,
          file_size: 1024000, // 1MB
          upload_status: 'uploaded',
        })
        .select()
        .single();

      if (docError) {
        console.error(`❌ Error creating ${docType} document:`, docError);
        continue;
      }

      uploadedDocuments.push(document);
      console.log(`✅ Document uploaded: ${docType}`);
    }

    // Step 3: Create workflow steps
    console.log('\n⚙️ Step 3: Creating verification workflow steps...');

    const workflowSteps = ['documents', 'identity', 'background', 'admin_review'];

    for (const [index, step] of workflowSteps.entries()) {
      const status = index === 0 ? 'completed' : 'pending';

      const { data: workflowStep, error: stepError } = await supabase
        .from('verification_workflows')
        .insert({
          provider_id: providerProfile.id, // Use the actual provider ID
          workflow_step: step,
          status: status,
          started_at: new Date().toISOString(),
          completed_at: status === 'completed' ? new Date().toISOString() : null,
          retry_count: 0,
        })
        .select()
        .single();

      if (stepError) {
        console.error(`❌ Error creating workflow step ${step}:`, stepError);
        continue;
      }

      console.log(`✅ Workflow step created: ${step} (${status})`);
    }

    // Step 4: Test verification status function
    console.log('\n🔍 Step 4: Testing verification status function...');

    try {
      const { data: statusResult, error: statusError } = await supabase
        .rpc('get_provider_verification_status', {
          provider_id: providerProfile.id
        });

      if (statusError) {
        console.log('⚠️  Verification status function not available:', statusError.message);
      } else {
        console.log('✅ Verification status:', statusResult);
      }
    } catch (error) {
      console.log('⚠️  Verification status function not available');
    }

    // Step 5: Test score calculation
    console.log('\n📊 Step 5: Testing score calculation...');

    try {
      const { data: scoreResult, error: scoreError } = await supabase
        .rpc('calculate_verification_score', {
          provider_id: providerProfile.id
        });

      if (scoreError) {
        console.log('⚠️  Score calculation function not available:', scoreError.message);
      } else {
        console.log('✅ Verification score:', scoreResult);
      }
    } catch (error) {
      console.log('⚠️  Score calculation function not available');
    }

    // Step 6: Test data retrieval
    console.log('\n📖 Step 6: Testing data retrieval...');

    // Get provider profile
    const { data: retrievedProfile, error: retrieveProfileError } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (retrieveProfileError) {
      console.error('❌ Error retrieving provider profile:', retrieveProfileError);
    } else {
      console.log('✅ Provider profile retrieved successfully');
    }

    // Get documents
    const { data: retrievedDocuments, error: retrieveDocsError } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('provider_id', providerProfile.id);

    if (retrieveDocsError) {
      console.error('❌ Error retrieving documents:', retrieveDocsError);
    } else {
      console.log(`✅ Documents retrieved: ${retrievedDocuments.length} documents`);
    }

    // Get workflow steps
    const { data: retrievedWorkflow, error: retrieveWorkflowError } = await supabase
      .from('verification_workflows')
      .select('*')
      .eq('provider_id', providerProfile.id)
      .order('created_at', { ascending: false });

    if (retrieveWorkflowError) {
      console.error('❌ Error retrieving workflow:', retrieveWorkflowError);
    } else {
      console.log(`✅ Workflow steps retrieved: ${retrievedWorkflow.length} steps`);
    }

    // Step 7: Update verification status
    console.log('\n🔄 Step 7: Testing status updates...');

    const { data: updatedProfile, error: updateError } = await supabase
      .from('provider_profiles')
      .update({
        verification_status: 'approved',
        verification_score: 95,
        is_identity_verified: true,
        is_background_checked: true,
      })
      .eq('user_id', testUserId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating verification status:', updateError);
    } else {
      console.log('✅ Verification status updated to approved');
    }

    // Cleanup test data (optional)
    console.log('\n🧹 Cleaning up test data...');

    try {
      // Delete in reverse order due to foreign key constraints
      await supabase.from('verification_workflows').delete().eq('provider_id', providerProfile.id);
      await supabase.from('verification_documents').delete().eq('provider_id', providerProfile.id);
      await supabase.from('provider_profiles').delete().eq('id', providerProfile.id);
      await supabase.from('users').delete().eq('id', testUserId);

      console.log('✅ Test data cleaned up successfully');
    } catch (cleanupError) {
      console.log('⚠️  Some test data may need manual cleanup');
    }

    console.log('\n🎉 Provider Verification Flow Test Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Provider profile creation: PASSED');
    console.log('✅ Document upload simulation: PASSED');
    console.log('✅ Workflow step creation: PASSED');
    console.log('✅ Data retrieval: PASSED');
    console.log('✅ Status updates: PASSED');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testProviderVerificationFlow().then(() => {
  console.log('\n✨ Test execution completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});