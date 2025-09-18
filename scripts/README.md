# Supabase Schema Deployment Scripts

This directory contains scripts to deploy the Provider Verification Schema to your Supabase database.

## Quick Start (Recommended Method)

The **fastest and most reliable** way to deploy the schema:

1. Run the deployment assistant:
   ```bash
   node scripts/deploy-schema-comprehensive.js
   ```

2. Follow the manual deployment instructions:
   - Open your Supabase Dashboard
   - Go to SQL Editor
   - Copy and paste the migration SQL
   - Click "Run"

## Available Scripts

### 🥇 Main Deployment Scripts

| Script | Description | Best For |
|--------|-------------|----------|
| `deploy-schema-comprehensive.js` | Shows all deployment options and instructions | **Start here** |
| `prepare-manual-deployment.js` | Prepares SQL for easy copy-paste to dashboard | Manual deployment |
| `verify-deployment.js` | Verifies that the schema was deployed correctly | After deployment |

### 🔧 Alternative Deployment Methods

| Script | Description | Requirements |
|--------|-------------|--------------|
| `deploy-via-supabase-cli.js` | Uses Supabase CLI for deployment | Supabase CLI installed and linked |
| `deploy-via-admin-api.js` | Uses Supabase Admin API | Service role key |
| `deploy-schema-postgres.js` | Direct PostgreSQL connection | Database password |

## Migration Files

- `migrate-verification-schema.sql` - Main migration file with all DDL statements
- `migration-for-dashboard.sql` - Cleaned version for dashboard (auto-generated)

## Usage Examples

### 1. Get Deployment Instructions
```bash
node scripts/deploy-schema-comprehensive.js
```

### 2. Prepare Manual Deployment
```bash
node scripts/prepare-manual-deployment.js
```
This will show you exactly what to copy and paste into the Supabase Dashboard.

### 3. Verify Deployment
```bash
node scripts/verify-deployment.js
```
Run this after deploying to make sure everything worked.

### 4. Try Automatic Deployment
```bash
node scripts/deploy-schema-comprehensive.js --auto
```
Attempts automatic deployment using available methods.

## Environment Variables Required

Make sure you have these in your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (for direct PostgreSQL connection):
SUPABASE_DB_PASSWORD=your-database-password
```

## Deployment Methods Comparison

| Method | Reliability | Setup Required | Supports DDL |
|--------|-------------|----------------|--------------|
| Manual Dashboard | ⭐⭐⭐⭐⭐ | None | ✅ Yes |
| Supabase CLI | ⭐⭐⭐⭐⭐ | CLI setup | ✅ Yes |
| Admin API | ⭐⭐⭐ | None | ⚠️ Limited |
| Direct PostgreSQL | ⭐⭐⭐⭐ | DB password | ✅ Yes |

## What Gets Deployed

The migration creates these database objects:

### Tables Created/Modified
- `provider_profiles` - Extended with verification fields
- `verification_documents` - Document uploads and processing
- `verification_workflows` - Verification process tracking
- `verification_history` - Audit trail
- `verification_notifications` - Notification management

### Security Features
- Row Level Security (RLS) policies
- Check constraints for data validation
- Unique constraints for data integrity

### Performance Features
- Indexes for common queries
- JSONB fields for flexible data
- Foreign key relationships

## Troubleshooting

### Common Issues

1. **"Table does not exist" errors**
   - Make sure you have a `provider_profiles` table first
   - Run the basic schema migration before this one

2. **Permission denied errors**
   - Verify your service role key is correct
   - Check that you have database write permissions

3. **DDL operations not supported**
   - Use the manual dashboard method
   - Avoid the PostgREST API for schema changes

### Getting Help

If you encounter issues:

1. Check the Supabase Dashboard SQL Editor for detailed error messages
2. Run the verification script to see what's missing
3. Try the manual deployment method as a fallback
4. Check your environment variables are correctly set

## Files Generated

The scripts may create these temporary files:

- `migration-for-dashboard.sql` - Cleaned SQL for dashboard
- `temp_*.sql` - Temporary files (auto-deleted)

## Next Steps

After successful deployment:

1. Run the verification script
2. Test the provider profile creation flow
3. Test document upload functionality
4. Set up storage buckets for file uploads
5. Configure authentication policies