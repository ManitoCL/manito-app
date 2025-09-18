# Code Updates After Migration

After successfully running the SQL migration steps, you may need to update some code files to match the exact column names and structure deployed.

## Files That Reference Database Schema

### 1. **Database Types** (`src/types/index.ts`)
- Lines 370-551: Database interface definitions
- **Check**: Ensure column names match what was actually deployed
- **Common mismatches**: `comuna` vs `comuna_code`, `verification_status` enum values

### 2. **Verification Service** (`src/services/database/verificationService.ts`)
- Lines throughout: All database queries
- **Check**: Column names in INSERT/UPDATE/SELECT statements
- **Key functions**: `createProviderProfile`, `getProviderProfile`, `updateProviderProfile`

### 3. **Document Upload Service** (`src/services/storage/documentUploadService.ts`)
- Lines 101-120: Database record creation after file upload
- **Check**: Ensure `provider_id` foreign key relationships work

### 4. **React Native Components**
- `src/components/verification/DocumentUpload.tsx`: Line 202 - Uses `providerId`
- `src/screens/verification/ProviderVerificationScreen.tsx`: Line 450 - Passes provider ID

## Quick Test Checklist

After migration, test these flows:
1. **Provider Profile Creation**: Can create profile without errors
2. **Document Upload**: Can upload files to Supabase Storage
3. **Database Functions**: `get_provider_verification_status()` works
4. **RLS Security**: Users can only see their own data

## Common Issues and Fixes

### Issue: "Column does not exist"
**Fix**: Check the actual column name in Supabase Dashboard → Database → Tables

### Issue: "RLS policy blocks access"
**Fix**: Ensure user is authenticated and `auth.uid()` returns correct user ID

### Issue: "Storage upload fails"
**Fix**: Check that `verification-documents` bucket exists and has correct policies

### Issue: "Function not found"
**Fix**: Re-run Step 4 (database functions) in SQL Editor

## Verification Commands

```bash
# Test database connection
node migration/05-test-deployment.js

# Check React Native app (after successful migration)
cd manito-app && npm start
```