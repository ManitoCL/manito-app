-- =====================================================================================
-- STEP 4: DATABASE FUNCTIONS FOR VERIFICATION LOGIC
-- Compatible with your existing schema structure
-- =====================================================================================

-- Function 1: Get Provider Verification Status (uses user_id as provider_id)
CREATE OR REPLACE FUNCTION get_provider_verification_status(p_provider_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    profile_record RECORD;
    doc_count INTEGER;
    required_docs TEXT[] := ARRAY['cedula_front', 'cedula_back', 'selfie'];
    missing_docs TEXT[];
    next_steps TEXT[];
BEGIN
    -- Get provider profile (using user_id as the key)
    SELECT * INTO profile_record FROM provider_profiles WHERE user_id = p_provider_id;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Provider profile not found');
    END IF;

    -- Count uploaded documents
    SELECT COUNT(*) INTO doc_count
    FROM verification_documents
    WHERE provider_id = p_provider_id
    AND upload_status IN ('uploaded', 'verified');

    -- Find missing documents
    SELECT ARRAY(
        SELECT unnest(required_docs)
        EXCEPT
        SELECT document_type FROM verification_documents
        WHERE provider_id = p_provider_id
        AND upload_status IN ('uploaded', 'verified')
    ) INTO missing_docs;

    -- Determine next steps based on current status
    IF array_length(missing_docs, 1) > 0 THEN
        next_steps := ARRAY['Upload missing documents: ' || array_to_string(missing_docs, ', ')];
    ELSIF profile_record.verification_status::text = 'pending' THEN
        next_steps := ARRAY['Wait for document review'];
    ELSIF profile_record.verification_status::text = 'in_review' THEN
        next_steps := ARRAY['Under review by our team'];
    ELSIF profile_record.verification_status::text = 'approved' THEN
        next_steps := ARRAY['Verification complete! You can start accepting jobs'];
    ELSIF profile_record.verification_status::text = 'rejected' THEN
        next_steps := ARRAY['Please resubmit your documents'];
    ELSE
        next_steps := ARRAY['Contact support for assistance'];
    END IF;

    -- Build result object
    SELECT json_build_object(
        'verification_status', profile_record.verification_status,
        'verification_score', COALESCE(profile_record.verification_score, 0),
        'documents_uploaded', doc_count,
        'missing_documents', missing_docs,
        'next_steps', next_steps,
        'is_identity_verified', COALESCE(profile_record.is_identity_verified, false),
        'is_background_checked', COALESCE(profile_record.is_background_checked, false),
        'business_name', profile_record.business_name,
        'comuna', profile_record.comuna
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Calculate Verification Score (uses user_id as provider_id)
CREATE OR REPLACE FUNCTION calculate_verification_score(p_provider_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    doc_count INTEGER;
    profile_record RECORD;
BEGIN
    -- Get provider profile
    SELECT * INTO profile_record FROM provider_profiles WHERE user_id = p_provider_id;

    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- Base score for profile completion (20 points)
    IF profile_record.business_name IS NOT NULL AND length(profile_record.business_name) > 0 THEN
        score := score + 20;
    END IF;

    -- Points for each uploaded document (20 points each, max 60)
    SELECT COUNT(*) INTO doc_count
    FROM verification_documents
    WHERE provider_id = p_provider_id
    AND upload_status IN ('uploaded', 'verified')
    AND document_type IN ('cedula_front', 'cedula_back', 'selfie');

    score := score + (doc_count * 20);

    -- Points for identity verification (10 points)
    IF COALESCE(profile_record.is_identity_verified, false) THEN
        score := score + 10;
    END IF;

    -- Points for background check (10 points)
    IF COALESCE(profile_record.is_background_checked, false) THEN
        score := score + 10;
    END IF;

    -- Cap at 100
    IF score > 100 THEN
        score := 100;
    END IF;

    RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Update Provider Score Automatically (trigger function)
CREATE OR REPLACE FUNCTION update_provider_verification_score()
RETURNS TRIGGER AS $$
DECLARE
    target_provider_id UUID;
BEGIN
    -- Determine the provider_id based on which table triggered this
    IF TG_TABLE_NAME = 'provider_profiles' THEN
        target_provider_id := COALESCE(NEW.user_id, OLD.user_id);
    ELSIF TG_TABLE_NAME = 'verification_documents' THEN
        target_provider_id := COALESCE(NEW.provider_id, OLD.provider_id);
    ELSE
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Update the verification score
    UPDATE provider_profiles
    SET verification_score = calculate_verification_score(target_provider_id),
        updated_at = now()
    WHERE user_id = target_provider_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update scores
DROP TRIGGER IF EXISTS trigger_update_profile_score ON provider_profiles;
CREATE TRIGGER trigger_update_profile_score
    AFTER INSERT OR UPDATE ON provider_profiles
    FOR EACH ROW EXECUTE FUNCTION update_provider_verification_score();

DROP TRIGGER IF EXISTS trigger_update_document_score ON verification_documents;
CREATE TRIGGER trigger_update_document_score
    AFTER INSERT OR UPDATE OR DELETE ON verification_documents
    FOR EACH ROW EXECUTE FUNCTION update_provider_verification_score();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database functions and triggers created successfully!';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - get_provider_verification_status(provider_id)';
    RAISE NOTICE '  - calculate_verification_score(provider_id)';
    RAISE NOTICE 'Triggers created:';
    RAISE NOTICE '  - Auto-update verification score when data changes';
    RAISE NOTICE '  - Compatible with existing schema (user_id as provider_id)';
END $$;