/**
 * Fixed test for database functions with correct parameter names
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFunctions() {
  console.log('🧪 Testing Database Functions...\n');

  const testUserId = crypto.randomUUID();

  try {
    // Create test user and profile
    console.log('Creating test data...');

    await supabase.from('users').insert({
      id: testUserId,
      email: `test${Date.now()}@example.com`,
      full_name: 'Test User',
      user_type: 'provider'
    });

    await supabase.from('provider_profiles').insert({
      user_id: testUserId,
      business_name: 'Test Business',
      services: ['test'],
      service_areas: ['test'],
      comuna: 'Test Comuna'
    });

    // Test function with different parameter name formats
    console.log('Testing function calls...\n');

    // Try without parameter name (positional)
    try {
      const { data: result1, error: error1 } = await supabase.rpc('get_provider_verification_status', [testUserId]);
      if (!error1) {
        console.log('✅ Positional parameter works:', result1);
      } else {
        console.log('❌ Positional failed:', error1.message);
      }
    } catch (e) {
      console.log('❌ Positional failed:', e.message);
    }

    // Try with p_provider_id
    try {
      const { data: result2, error: error2 } = await supabase.rpc('get_provider_verification_status', { p_provider_id: testUserId });
      if (!error2) {
        console.log('✅ p_provider_id parameter works:', result2);
      } else {
        console.log('❌ p_provider_id failed:', error2.message);
      }
    } catch (e) {
      console.log('❌ p_provider_id failed:', e.message);
    }

    // Try with provider_id
    try {
      const { data: result3, error: error3 } = await supabase.rpc('get_provider_verification_status', { provider_id: testUserId });
      if (!error3) {
        console.log('✅ provider_id parameter works:', result3);
      } else {
        console.log('❌ provider_id failed:', error3.message);
      }
    } catch (e) {
      console.log('❌ provider_id failed:', e.message);
    }

    // Test score function
    try {
      const { data: scoreResult, error: scoreError } = await supabase.rpc('calculate_verification_score', { p_provider_id: testUserId });
      if (!scoreError) {
        console.log('✅ Score calculation works:', scoreResult);
      } else {
        console.log('❌ Score calculation failed:', scoreError.message);
      }
    } catch (e) {
      console.log('❌ Score calculation failed:', e.message);
    }

    // Cleanup
    await supabase.from('provider_profiles').delete().eq('user_id', testUserId);
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('\n✅ Test completed and cleaned up');

  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testFunctions();