-- Check the exact parameter names for our functions
SELECT
    routine_name,
    parameter_name,
    data_type,
    parameter_mode
FROM information_schema.parameters
WHERE specific_schema = 'public'
AND routine_name IN ('get_provider_verification_status', 'calculate_verification_score')
ORDER BY routine_name, ordinal_position;