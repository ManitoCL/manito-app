# Manual Database Schema Deployment

Since automated deployment requires service role key, follow these steps to manually deploy the verification schema:

## Steps:

1. **Access Supabase Dashboard**
   - Go to: https://rlxsytlesoqbcgbnhwhq.supabase.co
   - Navigate to SQL Editor

2. **Check Current Schema** (Optional)
   - Run `scripts/check-existing-schema.sql` first to see what tables already exist

3. **Deploy Migration**
   - Copy the entire contents of `scripts/migrate-verification-schema.sql`
   - Paste into SQL Editor
   - Click "Run" - this will safely add only missing tables/columns

4. **Verify Deployment**
   - Run `scripts/verify-schema.sql` to confirm all tables were created successfully

5. **Setup Storage** (Optional)
   - Run `scripts/setup-storage.sql` to create the verification documents bucket

## Expected Results:

After running the migration, you should have these tables:
- `provider_profiles` (with new verification columns added)
- `verification_documents`
- `verification_workflows`
- `verification_history`
- `verification_notifications`

## Next Steps:

Once deployed, you can:
- Test the verification flow in the React Native app
- Upload documents to Supabase Storage
- View verification data in the Supabase dashboard