/**
 * Deploy Provider Verification Schema to Supabase using Direct PostgreSQL Connection
 *
 * This script connects directly to the PostgreSQL database to execute DDL statements
 * which are not supported by the PostgREST API.
 *
 * Usage: node scripts/deploy-schema-postgres.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Read environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure you have EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Get possible Supabase connection configurations
function getSupabaseConnectionConfigs(supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split('.')[0];

    // Try multiple connection methods
    const configs = [
      // Method 1: Direct connection to database (requires database password)
      {
        name: 'Direct Database Connection',
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
      },
      // Method 2: Connection pooler (transaction mode)
      {
        name: 'Transaction Pooler',
        host: `aws-0-us-east-1.pooler.supabase.com`,
        port: 6543,
        database: 'postgres',
        user: `postgres.${projectRef}`,
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
      },
      // Method 3: Session pooler (for DDL operations)
      {
        name: 'Session Pooler',
        host: `aws-0-us-east-1.pooler.supabase.com`,
        port: 5432,
        database: 'postgres',
        user: `postgres.${projectRef}`,
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
      },
    ];

    // Filter out configs where password is not available
    return configs.filter(config => config.password);
  } catch (error) {
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
  }
}

async function testConnection(pool) {
  try {
    console.log('🔍 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as database');
    client.release();

    console.log('✅ Database connection successful!');
    console.log(`   Connected to: ${result.rows[0].database}`);
    console.log(`   Server time: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function deploySchema() {
  let pool = null;

  try {
    console.log('🚀 Starting schema deployment to Supabase PostgreSQL...');

    // Parse connection details
    const connectionConfig = parseSupabaseUrl(SUPABASE_URL);
    console.log(`📡 Connecting to: ${connectionConfig.host}:${connectionConfig.port}`);

    // Create connection pool
    pool = new Pool({
      ...connectionConfig,
      ssl: {
        rejectUnauthorized: false // Supabase requires SSL but with self-signed certs
      },
      max: 1, // Single connection for migration
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection first
    const connectionOk = await testConnection(pool);
    if (!connectionOk) {
      throw new Error('Failed to establish database connection');
    }

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrate-verification-schema.sql');

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded successfully');
    console.log(`📏 File size: ${Math.round(migrationSQL.length / 1024)}KB`);

    // Execute the entire migration as a single transaction
    console.log('⏳ Executing migration...');

    const client = await pool.connect();

    try {
      // Start transaction
      await client.query('BEGIN');
      console.log('🔄 Transaction started');

      // Execute the migration
      const result = await client.query(migrationSQL);
      console.log('✅ Migration SQL executed successfully');

      // Commit transaction
      await client.query('COMMIT');
      console.log('✅ Transaction committed');

      // Verify some key tables were created
      console.log('🔍 Verifying schema deployment...');

      const verificationQueries = [
        {
          name: 'provider_profiles table',
          query: `SELECT COUNT(*) as count FROM information_schema.tables
                  WHERE table_name = 'provider_profiles'`
        },
        {
          name: 'verification_documents table',
          query: `SELECT COUNT(*) as count FROM information_schema.tables
                  WHERE table_name = 'verification_documents'`
        },
        {
          name: 'verification_workflows table',
          query: `SELECT COUNT(*) as count FROM information_schema.tables
                  WHERE table_name = 'verification_workflows'`
        },
        {
          name: 'verification_history table',
          query: `SELECT COUNT(*) as count FROM information_schema.tables
                  WHERE table_name = 'verification_history'`
        }
      ];

      for (const check of verificationQueries) {
        try {
          const result = await client.query(check.query);
          const exists = result.rows[0].count > 0;
          console.log(`   ${exists ? '✅' : '❌'} ${check.name}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
        } catch (error) {
          console.log(`   ⚠️  ${check.name}: Error checking - ${error.message}`);
        }
      }

    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.log('🔄 Transaction rolled back due to error');
      throw error;
    } finally {
      client.release();
    }

    console.log('\n🎉 Schema deployment completed successfully!');
    console.log('📱 You can now verify the tables in your Supabase dashboard.');
    console.log('🔗 Dashboard: https://supabase.com/dashboard/project/' + SUPABASE_URL.split('.')[0].replace('https://', ''));

  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);

    if (error.code) {
      console.error(`   Database error code: ${error.code}`);
    }

    if (error.detail) {
      console.error(`   Error detail: ${error.detail}`);
    }

    if (error.hint) {
      console.error(`   Hint: ${error.hint}`);
    }

    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Verify your SUPABASE_SERVICE_ROLE_KEY is correct');
    console.error('   2. Check that your Supabase project allows direct database connections');
    console.error('   3. Ensure the migration SQL file is valid PostgreSQL syntax');

    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection pool closed');
    }
  }
}

// Connection test function (can be run separately)
async function testDatabaseConnection() {
  let pool = null;

  try {
    console.log('🧪 Testing Supabase PostgreSQL connection...');

    const connectionConfig = parseSupabaseUrl(SUPABASE_URL);
    console.log(`📡 Target: ${connectionConfig.host}:${connectionConfig.port}`);

    pool = new Pool({
      ...connectionConfig,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });

    const success = await testConnection(pool);

    if (success) {
      console.log('🎉 Connection test passed! Ready for migration.');
    } else {
      console.log('❌ Connection test failed. Check your credentials.');
    }

    return success;
  } catch (error) {
    console.error('💥 Connection test error:', error.message);
    return false;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run based on command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--test-connection')) {
    testDatabaseConnection();
  } else {
    deploySchema();
  }
}

module.exports = { deploySchema, testDatabaseConnection };