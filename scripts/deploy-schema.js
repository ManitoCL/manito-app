/**
 * Deploy Provider Verification Schema to Supabase
 *
 * Run this script to deploy the database schema to your Supabase project
 * Usage: node scripts/deploy-schema.js
 */

const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure you have EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

async function deploySchema() {
  try {
    console.log('🚀 Starting schema deployment to Supabase...');

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'docs', 'provider-verification-schema.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Schema file loaded successfully');

    // Split into individual statements (basic approach)
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.length === 0) continue;

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}`);

        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            sql: statement + ';'
          })
        });

        if (response.ok) {
          successCount++;
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } else {
          errorCount++;
          const errorText = await response.text();
          console.log(`❌ Statement ${i + 1} failed: ${errorText}`);
        }

        // Add small delay between statements
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errorCount++;
        console.log(`❌ Statement ${i + 1} error:`, error.message);
      }
    }

    console.log('\n📊 Deployment Summary:');
    console.log(`✅ Successful: ${successCount} statements`);
    console.log(`❌ Failed: ${errorCount} statements`);

    if (errorCount === 0) {
      console.log('\n🎉 Schema deployment completed successfully!');
      console.log('You can now verify the tables in your Supabase dashboard.');
    } else {
      console.log('\n⚠️  Schema deployment completed with some errors.');
      console.log('Please check the errors above and fix any issues.');
    }

  } catch (error) {
    console.error('💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

// Simple SQL execution function using Supabase REST API
async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return await response.json();
}

// Run the deployment
if (require.main === module) {
  deploySchema();
}

module.exports = { deploySchema };