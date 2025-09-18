-- =====================================================================================
-- STEP 2: ROW LEVEL SECURITY POLICIES
-- Run this AFTER Step 1 completes successfully
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_workflows ENABLE ROW LEVEL SECURITY;

-- PROVIDER_PROFILES Policies
CREATE POLICY "Users can view their own provider profile" ON provider_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provider profile" ON provider_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider profile" ON provider_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- VERIFICATION_DOCUMENTS Policies
CREATE POLICY "Users can view their own verification documents" ON verification_documents
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_id
        )
    );

CREATE POLICY "Users can insert their own verification documents" ON verification_documents
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_id
        )
    );

CREATE POLICY "Users can update their own verification documents" ON verification_documents
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_id
        )
    );

-- VERIFICATION_WORKFLOWS Policies
CREATE POLICY "Users can view their own verification workflows" ON verification_workflows
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_id
        )
    );

CREATE POLICY "Users can insert their own verification workflows" ON verification_workflows
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_id
        )
    );

-- ADMIN Policies (admins can access all data)
CREATE POLICY "Admins can manage all provider profiles" ON provider_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can manage all verification documents" ON verification_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can manage all verification workflows" ON verification_workflows
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.user_type = 'admin'
        )
    );

RAISE NOTICE '✅ Security policies applied successfully!';