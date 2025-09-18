/**
 * Deploy Provider Verification Schema via Supabase CLI
 *
 * This script uses the Supabase CLI to execute SQL migrations,
 * which is the most reliable way to run DDL statements.
 *
 * Prerequisites:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login to Supabase: supabase auth login
 * 3. Link to your project: supabase projects list and supabase link --project-ref your-ref
 *
 * Usage: node scripts/deploy-via-supabase-cli.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Read environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

if (!SUPABASE_URL) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL environment variable!');
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

async function checkSupabaseCLI() {
  try {
    console.log('🔍 Checking Supabase CLI installation...');
    const { stdout } = await execAsync('supabase --version');
    console.log(`✅ Supabase CLI found: ${stdout.trim()}`);
    return true;
  } catch (error) {
    console.error('❌ Supabase CLI not found!');
    console.error('Install it with: npm install -g supabase');
    return false;
  }
}

async function checkProjectConnection() {
  try {
    console.log('🔍 Checking project connection...');
    const { stdout } = await execAsync('supabase status');

    if (stdout.includes('Local development setup is running')) {
      console.log('✅ Connected to local Supabase instance');
      return 'local';
    } else if (stdout.includes('Project not linked')) {
      console.error('❌ Project not linked!');
      console.error(`Link your project with: supabase link --project-ref ${getProjectRef(SUPABASE_URL)}`);
      return null;
    } else {
      console.log('✅ Connected to remote Supabase project');
      return 'remote';
    }
  } catch (error) {
    console.error('❌ Unable to check project status:', error.message);
    return null;
  }
}

async function deploySchema() {
  try {
    console.log('🚀 Starting schema deployment via Supabase CLI...');

    // Check CLI installation
    const cliAvailable = await checkSupabaseCLI();
    if (!cliAvailable) {
      throw new Error('Supabase CLI is required for this deployment method');
    }

    // Check project connection
    const connectionType = await checkProjectConnection();
    if (!connectionType) {
      throw new Error('Project connection failed');
    }

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrate-verification-schema.sql');

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at: ${migrationPath}`);
    }

    console.log('📄 Migration file found, executing via Supabase CLI...');

    // Create a temporary SQL file in the supabase migrations directory
    const supabaseDir = path.join(__dirname, '..', 'supabase');
    const migrationsDir = path.join(supabaseDir, 'migrations');

    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('📁 Created migrations directory');
    }

    // Copy migration file with timestamp
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const targetFile = path.join(migrationsDir, `${timestamp}_provider_verification_schema.sql`);

    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    fs.writeFileSync(targetFile, migrationContent);
    console.log(`📋 Created migration: ${path.basename(targetFile)}`);

    // Execute the migration
    console.log('⏳ Running migration...');

    try {
      const { stdout, stderr } = await execAsync('supabase db push');

      if (stderr && !stderr.includes('INFO')) {
        console.error('⚠️  Migration warnings:', stderr);
      }

      console.log('✅ Migration completed successfully!');

      if (stdout) {
        console.log('📊 Migration output:');
        console.log(stdout);
      }

      // Verify deployment
      console.log('🔍 Verifying schema deployment...');
      await verifyTables();

    } catch (error) {
      console.error('❌ Migration failed:', error.message);

      // Clean up the migration file on failure
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
        console.log('🧹 Cleaned up failed migration file');
      }

      throw error;
    }

    console.log('\n🎉 Schema deployment completed successfully!');
    console.log('📱 You can verify the tables in your Supabase dashboard.');

  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);

    console.error('\n🔧 Troubleshooting steps:');
    console.error('   1. Install Supabase CLI: npm install -g supabase');
    console.error('   2. Login: supabase auth login');
    console.error(`   3. Link project: supabase link --project-ref ${getProjectRef(SUPABASE_URL)}`);
    console.error('   4. Make sure you have write access to the Supabase project');

    process.exit(1);
  }
}

async function verifyTables() {
  try {
    const verificationSQL = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('provider_profiles', 'verification_documents', 'verification_workflows', 'verification_history')
      ORDER BY table_name;
    `;

    // Write verification query to temp file
    const tempFile = path.join(__dirname, 'temp_verify.sql');
    fs.writeFileSync(tempFile, verificationSQL);

    try {
      const { stdout } = await execAsync(`supabase db query --file ${tempFile}`);
      console.log('✅ Schema verification:');
      console.log(stdout);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }

  } catch (error) {
    console.log('⚠️  Could not verify tables:', error.message);
  }
}

// Alternative: Execute SQL directly via CLI
async function executeSQL(sqlContent) {
  const tempFile = path.join(__dirname, 'temp_migration.sql');

  try {
    fs.writeFileSync(tempFile, sqlContent);
    const { stdout, stderr } = await execAsync(`supabase db query --file ${tempFile}`);

    if (stderr) {
      console.error('SQL execution warnings:', stderr);
    }

    return stdout;
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

// Run the deployment
if (require.main === module) {
  deploySchema();
}

module.exports = { deploySchema, executeSQL };