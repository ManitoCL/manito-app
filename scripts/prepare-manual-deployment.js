/**
 * Prepare Manual Deployment Helper
 *
 * This script prepares the migration SQL for easy copying to Supabase Dashboard
 * and provides step-by-step instructions.
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

function getProjectRef(supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    return url.hostname.split('.')[0];
  } catch (error) {
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
  }
}

function cleanSQLForDashboard(sql) {
  // Remove comments and empty lines for cleaner dashboard execution
  const lines = sql.split('\n');
  const cleanedLines = lines
    .map(line => {
      // Keep essential comments but remove verbose ones
      const trimmed = line.trim();
      if (trimmed.startsWith('-- =====') || trimmed.startsWith('-- -----')) {
        return '';
      }
      return line;
    })
    .filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0; // Remove empty lines
    });

  return cleanedLines.join('\n');
}

function main() {
  try {
    console.log('📋 Supabase Manual Deployment Helper');
    console.log('====================================');

    if (!SUPABASE_URL) {
      console.error('❌ EXPO_PUBLIC_SUPABASE_URL not found in .env file');
      process.exit(1);
    }

    const projectRef = getProjectRef(SUPABASE_URL);
    const migrationPath = path.join(__dirname, 'migrate-verification-schema.sql');

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const originalSQL = fs.readFileSync(migrationPath, 'utf8');
    const cleanedSQL = cleanSQLForDashboard(originalSQL);

    // Create a clean version for dashboard
    const cleanedPath = path.join(__dirname, 'migration-for-dashboard.sql');
    fs.writeFileSync(cleanedPath, cleanedSQL);

    console.log(`✅ Prepared clean migration file: ${cleanedPath}`);
    console.log(`📏 Original size: ${Math.round(originalSQL.length / 1024)}KB`);
    console.log(`📏 Cleaned size: ${Math.round(cleanedSQL.length / 1024)}KB`);
    console.log('');

    console.log('🎯 STEP-BY-STEP DEPLOYMENT INSTRUCTIONS');
    console.log('========================================');
    console.log('');
    console.log('1. 🌐 Open Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/${projectRef}`);
    console.log('');
    console.log('2. 📝 Navigate to SQL Editor:');
    console.log('   • Click "SQL Editor" in the left sidebar');
    console.log('   • Click "New Query" button');
    console.log('');
    console.log('3. 📄 Copy migration SQL:');
    console.log(`   • Open file: ${cleanedPath}`);
    console.log('   • Select All (Ctrl+A) and Copy (Ctrl+C)');
    console.log('   • Or use the content below:');
    console.log('');
    console.log('4. 📋 Paste and Execute:');
    console.log('   • Paste the SQL in the Supabase SQL Editor');
    console.log('   • Click "Run" button');
    console.log('   • Wait for execution to complete');
    console.log('');
    console.log('5. ✅ Verify Results:');
    console.log('   • Check that tables were created successfully');
    console.log('   • Look for any error messages');
    console.log('   • Go to "Table Editor" to see the new tables');
    console.log('');

    console.log('📄 MIGRATION SQL (ready to copy):');
    console.log('==================================');
    console.log('');
    console.log(cleanedSQL);
    console.log('');
    console.log('==================================');
    console.log('✨ Copy the SQL above and paste it into Supabase Dashboard!');

  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };