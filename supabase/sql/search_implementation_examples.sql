-- Manito Marketplace Search Implementation Examples
-- Complete SQL examples for frontend integration

-- ===================================================================
-- 1. SERVICE-BASED SEARCH EXAMPLES
-- ===================================================================

-- Example 1: Basic electrician search in Santiago
SELECT * FROM search_providers_by_service(
  p_service_id => 'electricista',
  p_commune => 'santiago',
  p_limit => 20
);

-- Example 2: Urgent plumber search with price range and rating filter
SELECT * FROM search_providers_by_service(
  p_service_id => 'plomero',
  p_commune => 'las-condes',
  p_min_price => 20000,
  p_max_price => 60000,
  p_min_rating => 4.0,
  p_urgency => 'urgente',
  p_available_today => TRUE,
  p_verified_only => TRUE,
  p_limit => 10
);

-- Example 3: Text search for specific provider skills
SELECT * FROM search_providers_by_service(
  p_service_id => 'electricista',
  p_region => 'Metropolitana',
  p_search_text => 'instalación industrial',
  p_limit => 15
);

-- ===================================================================
-- 2. PROJECT-BASED SEARCH EXAMPLES
-- ===================================================================

-- Example 1: Kitchen renovation providers
SELECT * FROM search_providers_by_project(
  p_project_id => 'kitchen-renovation',
  p_commune => 'providencia',
  p_limit => 20
);

-- Example 2: Simple bathroom repair with budget constraints
SELECT * FROM search_providers_by_project(
  p_project_id => 'bathroom-repair',
  p_commune => 'nunoa',
  p_max_price => 100000,
  p_complexity => 'simple',
  p_available_today => TRUE,
  p_limit => 10
);

-- Example 3: Emergency leak repair
SELECT * FROM search_providers_by_project(
  p_project_id => 'leak-repair',
  p_region => 'Metropolitana',
  p_min_rating => 4.5,
  p_verified_only => TRUE,
  p_limit => 5
);

-- ===================================================================
-- 3. AUTOCOMPLETE AND QUICK SEARCH EXAMPLES
-- ===================================================================

-- Example 1: General search autocomplete
SELECT * FROM quick_search('electr', 'all', 10);

-- Example 2: Service-only autocomplete
SELECT * FROM quick_search('pintura', 'services', 5);

-- Example 3: Project-only autocomplete
SELECT * FROM quick_search('baño', 'projects', 5);

-- Example 4: Provider search
SELECT * FROM quick_search('juan', 'providers', 8);

-- ===================================================================
-- 4. RELATED DATA QUERIES
-- ===================================================================

-- Get all services needed for a kitchen renovation
SELECT * FROM get_project_services('kitchen-renovation');

-- Get all projects that use electrician services
SELECT * FROM get_service_projects('electricista');

-- ===================================================================
-- 5. POPULAR CONTENT QUERIES (using materialized views)
-- ===================================================================

-- Get most popular services by provider count
SELECT * FROM mv_popular_services
ORDER BY provider_count DESC, avg_provider_rating DESC
LIMIT 10;

-- Get popular projects by complexity
SELECT * FROM mv_popular_projects
WHERE complexity = 'simple'
ORDER BY capable_provider_count DESC
LIMIT 10;

-- Get provider density by commune
SELECT * FROM mv_provider_density_by_commune
ORDER BY provider_count DESC
LIMIT 20;

-- ===================================================================
-- 6. COMPLEX FILTERING EXAMPLES
-- ===================================================================

-- Multi-service search: Find providers who can do both electrical and plumbing
WITH multi_service_providers AS (
  SELECT
    pp.user_id,
    COUNT(DISTINCT ps.service_id) as service_count
  FROM provider_profiles pp
  INNER JOIN provider_services ps ON ps.provider_id = pp.user_id
  WHERE ps.service_id IN ('electricista', 'plomero')
    AND pp.verification_status = 'approved'
    AND pp.is_available = TRUE
    AND 'santiago' = ANY(pp.service_areas)
  GROUP BY pp.user_id
  HAVING COUNT(DISTINCT ps.service_id) = 2
)
SELECT
  pp.user_id,
  u.full_name,
  pp.business_name,
  pp.rating,
  pp.total_reviews,
  ARRAY_AGG(ps.service_id) as services,
  AVG(ps.hourly_rate_clp) as avg_hourly_rate
FROM multi_service_providers msp
INNER JOIN provider_profiles pp ON pp.user_id = msp.user_id
INNER JOIN users u ON u.id = pp.user_id
INNER JOIN provider_services ps ON ps.provider_id = pp.user_id
WHERE ps.service_id IN ('electricista', 'plomero')
GROUP BY pp.user_id, u.full_name, pp.business_name, pp.rating, pp.total_reviews
ORDER BY pp.rating DESC, pp.total_reviews DESC;

-- Distance-based search (if coordinates are available)
WITH provider_distances AS (
  SELECT
    pp.user_id,
    u.full_name,
    pp.business_name,
    pp.rating,
    pp.coordinates,
    calculate_distance(
      -33.4489, -70.6693,  -- Santiago center coordinates
      ST_Y(pp.coordinates),
      ST_X(pp.coordinates)
    ) as distance_km
  FROM provider_profiles pp
  INNER JOIN users u ON u.id = pp.user_id
  INNER JOIN provider_services ps ON ps.provider_id = pp.user_id
  WHERE ps.service_id = 'limpieza'
    AND pp.verification_status = 'approved'
    AND pp.is_available = TRUE
    AND pp.coordinates IS NOT NULL
)
SELECT *
FROM provider_distances
WHERE distance_km <= 15  -- Within 15km
ORDER BY distance_km, rating DESC
LIMIT 20;

-- ===================================================================
-- 7. AGGREGATED SEARCH ANALYTICS
-- ===================================================================

-- Service demand analysis
SELECT
  sc.name as service_name,
  COUNT(DISTINCT ps.provider_id) as provider_count,
  AVG(ps.hourly_rate_clp) as avg_hourly_rate,
  MIN(ps.hourly_rate_clp) as min_hourly_rate,
  MAX(ps.hourly_rate_clp) as max_hourly_rate,
  COUNT(ppr.project_id) as related_projects_count
FROM service_categories sc
LEFT JOIN provider_services ps ON ps.service_id = sc.id
LEFT JOIN provider_profiles pp ON pp.user_id = ps.provider_id
  AND pp.verification_status = 'approved'
LEFT JOIN project_services psrv ON psrv.service_id = sc.id
LEFT JOIN provider_projects ppr ON ppr.project_id = psrv.project_id
WHERE sc.is_active = TRUE
GROUP BY sc.id, sc.name
ORDER BY provider_count DESC;

-- Project complexity analysis
SELECT
  pt.complexity,
  COUNT(*) as project_count,
  AVG(pt.avg_price_min) as avg_min_price,
  AVG(pt.avg_price_max) as avg_max_price,
  COUNT(DISTINCT ppr.provider_id) as capable_providers
FROM project_types pt
LEFT JOIN provider_projects ppr ON ppr.project_id = pt.id
WHERE pt.is_active = TRUE
GROUP BY pt.complexity
ORDER BY
  CASE pt.complexity
    WHEN 'simple' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'complex' THEN 3
  END;

-- ===================================================================
-- 8. PERFORMANCE TESTING QUERIES
-- ===================================================================

-- Benchmark service search performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM search_providers_by_service(
  p_service_id => 'electricista',
  p_commune => 'santiago',
  p_min_rating => 4.0,
  p_limit => 20
);

-- Benchmark project search performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM search_providers_by_project(
  p_project_id => 'kitchen-renovation',
  p_commune => 'las-condes',
  p_verified_only => TRUE,
  p_limit => 10
);

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN (
  'provider_profiles',
  'provider_services',
  'provider_projects',
  'service_categories',
  'project_types'
)
ORDER BY idx_scan DESC;

-- ===================================================================
-- 9. MAINTENANCE AND MONITORING QUERIES
-- ===================================================================

-- Monitor search cache performance
SELECT
  search_type,
  COUNT(*) as total_searches,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_cache,
  AVG(result_count) as avg_results,
  MIN(created_at) as oldest_entry,
  MAX(created_at) as newest_entry
FROM search_cache
GROUP BY search_type;

-- Clean up old search cache
DELETE FROM search_cache WHERE expires_at < NOW() - INTERVAL '1 day';

-- Update search statistics
SELECT analyze_search_performance(7);

-- Check materialized view freshness
SELECT
  'mv_popular_services' as view_name,
  pg_size_pretty(pg_total_relation_size('mv_popular_services')) as size,
  (SELECT COUNT(*) FROM mv_popular_services) as record_count
UNION ALL
SELECT
  'mv_popular_projects' as view_name,
  pg_size_pretty(pg_total_relation_size('mv_popular_projects')) as size,
  (SELECT COUNT(*) FROM mv_popular_projects) as record_count
UNION ALL
SELECT
  'mv_provider_density_by_commune' as view_name,
  pg_size_pretty(pg_total_relation_size('mv_provider_density_by_commune')) as size,
  (SELECT COUNT(*) FROM mv_provider_density_by_commune) as record_count;

-- ===================================================================
-- 10. DATA VALIDATION QUERIES
-- ===================================================================

-- Validate service-project relationships
SELECT
  ps.project_id,
  ps.service_id,
  pt.name as project_name,
  sc.name as service_name,
  ps.is_required
FROM project_services ps
INNER JOIN project_types pt ON pt.id = ps.project_id
INNER JOIN service_categories sc ON sc.id = ps.service_id
ORDER BY ps.project_id, ps.is_required DESC, ps.service_id;

-- Validate provider service coverage
SELECT
  pp.user_id,
  u.full_name,
  pp.business_name,
  ARRAY_AGG(ps.service_id ORDER BY ps.service_id) as services,
  COUNT(ps.service_id) as service_count
FROM provider_profiles pp
INNER JOIN users u ON u.id = pp.user_id
LEFT JOIN provider_services ps ON ps.provider_id = pp.user_id
WHERE pp.verification_status = 'approved'
GROUP BY pp.user_id, u.full_name, pp.business_name
HAVING COUNT(ps.service_id) = 0  -- Providers with no services defined
ORDER BY u.full_name;

-- Check for inconsistent pricing
SELECT
  ps.provider_id,
  ps.service_id,
  ps.hourly_rate_clp,
  pp.hourly_rate_clp as profile_hourly_rate,
  CASE
    WHEN ps.hourly_rate_clp != pp.hourly_rate_clp THEN 'MISMATCH'
    ELSE 'OK'
  END as price_consistency
FROM provider_services ps
INNER JOIN provider_profiles pp ON pp.user_id = ps.provider_id
WHERE ps.hourly_rate_clp IS NOT NULL
  AND pp.hourly_rate_clp IS NOT NULL
  AND ps.hourly_rate_clp != pp.hourly_rate_clp;

-- ===================================================================
-- END OF EXAMPLES
-- ===================================================================