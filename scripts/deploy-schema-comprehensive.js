/**
 * Comprehensive Schema Deployment for Supabase
 *
 * This script tries multiple deployment methods in order of reliability:
 * 1. Manual instructions for Supabase Dashboard (most reliable)
 * 2. Supabase CLI (requires setup but very reliable)
 * 3. Admin API (experimental)
 * 4. Direct PostgreSQL connection (requires database password)
 *
 * Usage: node scripts/deploy-schema-comprehensive.js
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

function printManualInstructions() {
  const projectRef = getProjectRef(SUPABASE_URL);
  const migrationPath = path.join(__dirname, 'migrate-verification-schema.sql');

  console.log('\n🎯 RECOMMENDED: Manual Deployment via Supabase Dashboard');
  console.log('================================================================');
  console.log('This is the most reliable method for DDL operations.');
  console.log('');
  console.log('📝 Steps:');
  console.log(`1. Open Supabase Dashboard: https://supabase.com/dashboard/project/${projectRef}`);
  console.log('2. Go to "SQL Editor" in the left sidebar');
  console.log('3. Click "New Query"');
  console.log('4. Copy and paste the SQL from the migration file:');
  console.log(`   ${migrationPath}`);
  console.log('5. Click "Run" to execute the migration');
  console.log('');
  console.log('✅ This method supports all DDL operations and handles transactions properly.');
  console.log('');

  if (fs.existsSync(migrationPath)) {
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    const lineCount = migrationSQL.split('\n').length;
    const sizeKB = Math.round(migrationSQL.length / 1024);

    console.log(`📄 Migration file details:`);
    console.log(`   File: ${migrationPath}`);
    console.log(`   Size: ${sizeKB}KB (${lineCount} lines)`);
    console.log('');

    // Show first few lines as preview
    const lines = migrationSQL.split('\n');
    console.log('📖 Migration preview (first 10 lines):');
    console.log('---');
    lines.slice(0, 10).forEach((line, index) => {
      console.log(`${(index + 1).toString().padStart(3)}: ${line}`);
    });
    if (lines.length > 10) {
      console.log(`... (${lines.length - 10} more lines)`);
    }
    console.log('---\n');
  }
}

async function trySupabaseCLI() {
  console.log('🔧 OPTION 2: Supabase CLI Deployment');
  console.log('====================================');

  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Check if CLI is available
    await execAsync('supabase --version');
    console.log('✅ Supabase CLI is installed');

    // Check project status
    const { stdout } = await execAsync('supabase status');

    if (stdout.includes('Project not linked')) {
      console.log('⚠️  Project not linked to CLI');
      console.log(`🔗 Run: supabase link --project-ref ${getProjectRef(SUPABASE_URL)}`);
      return false;
    }

    console.log('✅ Project is linked to CLI');
    console.log('🚀 You can run: node scripts/deploy-via-supabase-cli.js');
    return true;

  } catch (error) {
    console.log('❌ Supabase CLI not available');
    console.log('📥 Install with: npm install -g supabase');
    console.log('🔗 Then run: supabase auth login');
    console.log(`🔗 Then run: supabase link --project-ref ${getProjectRef(SUPABASE_URL)}`);
    return false;
  }
}

async function tryAdminAPI() {
  console.log('\n🧪 OPTION 3: Admin API Deployment (Experimental)');
  console.log('=================================================');

  try {
    // Test a simple query first
    const projectRef = getProjectRef(SUPABASE_URL);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pg_backend_pid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({})
    });

    if (response.ok) {
      console.log('✅ Basic API connection works');
      console.log('🚀 You can try: node scripts/deploy-via-admin-api.js');
      console.log('⚠️  Note: This method may not support all DDL operations');
      return true;
    } else {
      console.log('❌ API connection failed');
      return false;
    }

  } catch (error) {
    console.log('❌ API test failed:', error.message);
    return false;
  }
}

async function checkDatabasePassword() {
  console.log('\n🔑 OPTION 4: Direct PostgreSQL Connection');
  console.log('==========================================');

  if (process.env.SUPABASE_DB_PASSWORD) {
    console.log('✅ Database password found in environment');
    console.log('🚀 You can run: node scripts/deploy-schema-postgres.js');
    return true;
  } else {
    console.log('❌ Database password not found');
    console.log('🔧 Get your database password from Supabase Dashboard:');
    console.log(`   1. Go to: https://supabase.com/dashboard/project/${getProjectRef(SUPABASE_URL)}/settings/database`);
    console.log('   2. Copy the database password');
    console.log('   3. Add SUPABASE_DB_PASSWORD=your-password to your .env file');
    return false;
  }
}

function printSummary() {
  console.log('\n📋 DEPLOYMENT OPTIONS SUMMARY');
  console.log('=============================');
  console.log('');
  console.log('🥇 RECOMMENDED: Manual Dashboard (always works)');
  console.log('   → Copy SQL to Supabase Dashboard SQL Editor');
  console.log('');
  console.log('🥈 ALTERNATIVE: Supabase CLI (requires setup)');
  console.log('   → node scripts/deploy-via-supabase-cli.js');
  console.log('');
  console.log('🥉 EXPERIMENTAL: Admin API (may have limitations)');
  console.log('   → node scripts/deploy-via-admin-api.js');
  console.log('');
  console.log('🔧 ADVANCED: Direct PostgreSQL (requires DB password)');
  console.log('   → node scripts/deploy-schema-postgres.js');
  console.log('');
  console.log('💡 TIP: The manual dashboard method is fastest and most reliable!');
}

async function main() {
  console.log('🚀 Supabase Schema Deployment Assistant');
  console.log('========================================');
  console.log('');
  console.log(`📊 Project: ${getProjectRef(SUPABASE_URL)}`);
  console.log(`🌐 URL: ${SUPABASE_URL}`);
  console.log('');

  // Always show manual instructions first (most reliable)
  printManualInstructions();

  // Check other options
  await trySupabaseCLI();
  await tryAdminAPI();
  await checkDatabasePassword();

  // Print summary
  printSummary();

  console.log('\n✨ Choose the method that works best for your setup!');
}

// Auto-deploy option
async function autoDeploy() {
  console.log('🤖 Attempting automatic deployment...');

  const methods = [
    { name: 'Supabase CLI', script: './deploy-via-supabase-cli.js' },
    { name: 'Admin API', script: './deploy-via-admin-api.js' },
    { name: 'Direct PostgreSQL', script: './deploy-schema-postgres.js' },
  ];

  for (const method of methods) {
    try {
      console.log(`\n🔄 Trying ${method.name}...`);

      const deployModule = require(method.script);
      if (deployModule.deploySchema) {
        await deployModule.deploySchema();
        console.log(`✅ Success with ${method.name}!`);
        return;
      }
    } catch (error) {
      console.log(`❌ ${method.name} failed: ${error.message}`);
    }
  }

  console.log('\n❌ All automatic methods failed.');
  console.log('📝 Please use the manual dashboard method shown above.');
}

// Run based on arguments
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--auto') || args.includes('--deploy')) {
    autoDeploy();
  } else {
    main();
  }
}

module.exports = { main, autoDeploy };