# TypeScript Updates Required

Your existing schema uses different column names and structure. Here are the updates needed:

## 1. Update Database Types (src/types/index.ts)

Replace the provider_profiles interface around line 411-453 with:

```typescript
provider_profiles: {
  Row: {
    user_id: string; // PRIMARY KEY (not id!)
    business_name: string | null;
    services: string[]; // NOT services_offered
    service_areas: string[];
    comuna: string | null; // Added by migration
    verification_status: 'pending' | 'in_review' | 'approved' | 'rejected';
    verification_score: number; // Added by migration
    is_identity_verified: boolean; // Added by migration
    is_background_checked: boolean; // Added by migration
    created_at: string;
    updated_at: string;
    // ... other existing fields from your schema
  };
  Insert: {
    user_id: string;
    business_name?: string | null;
    services?: string[];
    service_areas?: string[];
    comuna?: string | null;
    verification_status?: 'pending' | 'in_review' | 'approved' | 'rejected';
    verification_score?: number;
    is_identity_verified?: boolean;
    is_background_checked?: boolean;
  };
  Update: {
    business_name?: string | null;
    services?: string[];
    service_areas?: string[];
    comuna?: string | null;
    verification_status?: 'pending' | 'in_review' | 'approved' | 'rejected';
    verification_score?: number;
    is_identity_verified?: boolean;
    is_background_checked?: boolean;
  };
};
```

## 2. Update Verification Service (src/services/database/verificationService.ts)

Key changes needed:
- Line 19: Change `provider_id` to `user_id` in foreign key references
- Line 35: Use `user_id` instead of `id` for provider profile queries
- Line 78: Change `services_offered` to `services`

## 3. Update Document Upload Service (src/services/storage/documentUploadService.ts)

- Line 93: Change `provider_id` to `user_id` when creating document records

## 4. Update React Native Components

- `src/screens/verification/ProviderVerificationScreen.tsx`:
  - Line 95: Use `user_id` instead of `id`
  - Line 450: Pass `user_id` instead of `profile.id`