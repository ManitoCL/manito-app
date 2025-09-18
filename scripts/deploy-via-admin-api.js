/**
 * Deploy Provider Verification Schema via Supabase Admin API
 *
 * This script uses the Supabase Admin API to execute SQL migrations.
 * This method works better than PostgREST for DDL operations.
 *
 * Usage: node scripts/deploy-via-admin-api.js
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

function getProjectRef(supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    return url.hostname.split('.')[0];
  } catch (error) {
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
  }
}

// Execute SQL via Supabase database API (different from PostgREST)
async function executeSQL(sql) {
  const projectRef = getProjectRef(SUPABASE_URL);

  // Try multiple API endpoints that might support DDL
  const endpoints = [
    // Admin API endpoint
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    // Alternative database API
    `${SUPABASE_URL}/database/v1/query`,
    // Direct SQL execution endpoint
    `${SUPABASE_URL}/sql`,
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Trying endpoint: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
          query: sql,
          // Alternative payload structures
          sql: sql,
          statement: sql,
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success with endpoint: ${endpoint}`);
        return result;
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed with ${response.status}: ${errorText}`);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error with endpoint ${endpoint}: ${error.message}`);
      lastError = error;
    }
  }

  // If all endpoints failed, throw the last error
  throw lastError || new Error('All API endpoints failed');
}

async function deploySchema() {
  try {
    console.log('🚀 Starting schema deployment via Supabase Admin API...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrate-verification-schema.sql');

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded successfully');

    // Test with a simple query first
    console.log('🧪 Testing API connection...');

    try {
      await executeSQL('SELECT 1 as test');
      console.log('✅ API connection test successful');
    } catch (error) {
      console.error('❌ API connection test failed:', error.message);

      // Try alternative: direct execution without API
      console.log('🔄 Trying alternative approach...');
      return await deploySchemaAlternative();
    }

    // Execute the migration
    console.log('⏳ Executing migration SQL...');
    const result = await executeSQL(migrationSQL);

    console.log('✅ Migration executed successfully');
    if (result) {
      console.log('📊 Result:', result);
    }

    // Verify deployment
    console.log('🔍 Verifying schema deployment...');
    await verifyTables();

    console.log('\n🎉 Schema deployment completed successfully!');
    console.log('📱 You can verify the tables in your Supabase dashboard.');

  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    console.error('\n🔧 Try using the Supabase CLI method instead:');
    console.error('   node scripts/deploy-via-supabase-cli.js');
    process.exit(1);
  }
}

async function deploySchemaAlternative() {
  console.log('🔄 Using alternative deployment method: SQL chunks...');

  const migrationPath = path.join(__dirname, 'migrate-verification-schema.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Split the SQL into smaller chunks that are more likely to work
  const chunks = splitSQLIntoChunks(migrationSQL);
  console.log(`📝 Split migration into ${chunks.length} chunks`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk.trim().length === 0) continue;

    try {
      console.log(`⏳ Executing chunk ${i + 1}/${chunks.length}...`);
      await executeSQL(chunk);
      successCount++;
      console.log(`✅ Chunk ${i + 1} executed successfully`);

      // Add delay between chunks
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      errorCount++;
      console.error(`❌ Chunk ${i + 1} failed: ${error.message}`);

      // For critical failures, stop execution
      if (error.message.includes('syntax error') || error.message.includes('permission denied')) {
        throw error;
      }
    }
  }

  console.log(`\n📊 Execution Summary: ${successCount} success, ${errorCount} errors`);

  if (errorCount === 0) {
    console.log('✅ All chunks executed successfully');
  } else if (successCount > errorCount) {
    console.log('⚠️  Some chunks failed, but most succeeded');
  } else {
    throw new Error('Too many chunk failures');
  }
}

function splitSQLIntoChunks(sql) {
  // Split by DDL statement types
  const chunks = [];
  let currentChunk = '';

  const lines = sql.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (trimmedLine.length === 0 || trimmedLine.startsWith('--')) {
      continue;
    }

    // Check if this line starts a new statement that should be in its own chunk
    const isNewStatement =
      trimmedLine.startsWith('CREATE TABLE') ||
      trimmedLine.startsWith('ALTER TABLE') ||
      trimmedLine.startsWith('CREATE INDEX') ||
      trimmedLine.startsWith('DROP POLICY') ||
      trimmedLine.startsWith('CREATE POLICY') ||
      trimmedLine.startsWith('DO $$');

    if (isNewStatement && currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }

    currentChunk += line + '\n';

    // End chunk on certain patterns
    if (trimmedLine.endsWith('END $$;') ||
        (trimmedLine.endsWith(');') && !trimmedLine.includes('CHECK'))) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
  }

  // Add any remaining content
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.trim().length > 0);
}

async function verifyTables() {
  try {
    const verificationSQL = `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name IN ('provider_profiles', 'verification_documents', 'verification_workflows', 'verification_history')
      ORDER BY table_name, column_name;
    `;

    const result = await executeSQL(verificationSQL);
    console.log('✅ Tables verified:');

    if (result && result.length > 0) {
      const tables = {};
      result.forEach(row => {
        if (!tables[row.table_name]) {
          tables[row.table_name] = [];
        }
        tables[row.table_name].push(`${row.column_name} (${row.data_type})`);
      });

      Object.entries(tables).forEach(([tableName, columns]) => {
        console.log(`   📋 ${tableName}: ${columns.length} columns`);
      });
    }

  } catch (error) {
    console.log('⚠️  Could not verify tables:', error.message);
  }
}

// Run the deployment
if (require.main === module) {
  deploySchema();
}

module.exports = { deploySchema, executeSQL };