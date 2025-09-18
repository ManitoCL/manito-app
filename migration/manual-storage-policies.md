# Manual Storage Policy Setup

After running the SQL script, you need to set up storage policies manually through the Supabase Dashboard:

## Steps:

1. **Go to Supabase Dashboard** → Storage → verification-documents → Policies
2. **Click "New Policy"**
3. **Create these 4 policies:**

### Policy 1: Upload Documents
- **Name**: `Users can upload their own verification documents`
- **Allowed Operation**: `INSERT`
- **Target Roles**: `authenticated`
- **USING Expression**:
```sql
(bucket_id = 'verification-documents') AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

### Policy 2: View Documents
- **Name**: `Users can view their own verification documents`
- **Allowed Operation**: `SELECT`
- **Target Roles**: `authenticated`
- **USING Expression**:
```sql
(bucket_id = 'verification-documents') AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

### Policy 3: Update Documents
- **Name**: `Users can update their own verification documents`
- **Allowed Operation**: `UPDATE`
- **Target Roles**: `authenticated`
- **USING Expression**:
```sql
(bucket_id = 'verification-documents') AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

### Policy 4: Delete Documents
- **Name**: `Users can delete their own verification documents`
- **Allowed Operation**: `DELETE`
- **Target Roles**: `authenticated`
- **USING Expression**:
```sql
(bucket_id = 'verification-documents') AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

## What This Does:
- Users can only upload/view/edit files in folders named with their user ID
- Example: User `abc-123` can only access `verification-documents/abc-123/` folder
- Prevents users from seeing other users' documents