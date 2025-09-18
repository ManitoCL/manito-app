-- =====================================================================================
-- STEP 4: DATABASE FUNCTIONS FOR VERIFICATION LOGIC
-- Run this AFTER Steps 1-3 complete successfully
-- =====================================================================================

-- Function 1: Get Provider Verification Status
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
    -- Get provider profile
    SELECT * INTO profile_record FROM provider_profiles WHERE id = p_provider_id;

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

    -- Determine next steps
    IF array_length(missing_docs, 1) > 0 THEN
        next_steps := ARRAY['Upload missing documents: ' || array_to_string(missing_docs, ', ')];
    ELSIF profile_record.verification_status = 'pending' THEN
        next_steps := ARRAY['Wait for document review'];
    ELSIF profile_record.verification_status = 'in_review' THEN
        next_steps := ARRAY['Under review by our team'];
    ELSIF profile_record.verification_status = 'approved' THEN
        next_steps := ARRAY['Verification complete! You can start accepting jobs'];
    ELSIF profile_record.verification_status = 'rejected' THEN
        next_steps := ARRAY['Please resubmit your documents'];
    ELSE
        next_steps := ARRAY['Contact support for assistance'];
    END IF;

    -- Build result
    SELECT json_build_object(
        'verification_status', profile_record.verification_status,
        'verification_score', profile_record.verification_score,
        'documents_uploaded', doc_count,
        'missing_documents', missing_docs,
        'next_steps', next_steps,
        'is_identity_verified', profile_record.is_identity_verified,
        'is_background_checked', profile_record.is_background_checked
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Calculate Verification Score
CREATE OR REPLACE FUNCTION calculate_verification_score(p_provider_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    doc_count INTEGER;
    profile_record RECORD;
BEGIN
    -- Get provider profile
    SELECT * INTO profile_record FROM provider_profiles WHERE id = p_provider_id;

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
    IF profile_record.is_identity_verified THEN
        score := score + 10;
    END IF;

    -- Points for background check (10 points)
    IF profile_record.is_background_checked THEN
        score := score + 10;
    END IF;

    -- Cap at 100
    IF score > 100 THEN
        score := 100;
    END IF;

    RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Update Provider Score Automatically
CREATE OR REPLACE FUNCTION update_provider_verification_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate score whenever documents or profile changes
    UPDATE provider_profiles
    SET verification_score = calculate_verification_score(
        CASE
            WHEN TG_TABLE_NAME = 'provider_profiles' THEN NEW.id
            WHEN TG_TABLE_NAME = 'verification_documents' THEN NEW.provider_id
            ELSE OLD.provider_id
        END
    )
    WHERE id = CASE
        WHEN TG_TABLE_NAME = 'provider_profiles' THEN NEW.id
        WHEN TG_TABLE_NAME = 'verification_documents' THEN NEW.provider_id
        ELSE OLD.provider_id
    END;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update scores
CREATE TRIGGER trigger_update_profile_score
    AFTER INSERT OR UPDATE ON provider_profiles
    FOR EACH ROW EXECUTE FUNCTION update_provider_verification_score();

CREATE TRIGGER trigger_update_document_score
    AFTER INSERT OR UPDATE OR DELETE ON verification_documents
    FOR EACH ROW EXECUTE FUNCTION update_provider_verification_score();

RAISE NOTICE '✅ Database functions and triggers created successfully!';