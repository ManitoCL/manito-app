-- Search Performance Optimization for Manito Marketplace
-- Advanced indexing strategies, query optimization, and monitoring

-- 1. COMPOSITE INDEXES FOR COMPLEX QUERIES
-- These indexes support the most common search patterns

-- Service search performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_services_search_optimized
ON provider_services (service_id, provider_id)
INCLUDE (hourly_rate_clp, fixed_rate_clp, is_primary_service);

-- Project search performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_projects_search_optimized
ON provider_projects (project_id, provider_id)
INCLUDE (base_price_clp, can_provide_estimate, portfolio_count);

-- Provider filtering index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_profiles_search_filter
ON provider_profiles (verification_status, is_available, is_available_today)
INCLUDE (rating, total_reviews, total_jobs_completed, response_time_hours);

-- Location-based search index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_profiles_location_search
ON provider_profiles USING GIN (service_areas)
WHERE verification_status = 'approved' AND is_available = TRUE;

-- Multi-column index for rating and review filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_profiles_quality_metrics
ON provider_profiles (rating DESC, total_reviews DESC, total_jobs_completed DESC)
WHERE verification_status = 'approved' AND is_available = TRUE;

-- 2. PARTIAL INDEXES FOR ACTIVE DATA
-- These indexes only include active/relevant records to reduce size and improve performance

-- Active service categories only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_categories_active_search
ON service_categories (name, id) WHERE is_active = TRUE;

-- Active project types only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_types_active_search
ON project_types (name, category, id) WHERE is_active = TRUE;

-- Approved providers only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_approved_providers_search
ON provider_profiles (user_id, rating DESC, total_reviews DESC)
WHERE verification_status = 'approved' AND is_available = TRUE;

-- 3. SPECIALIZED INDEXES FOR PERFORMANCE FEATURES

-- Search cache lookup optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_cache_fast_lookup
ON search_cache (search_type, search_key, location_key, expires_at)
WHERE expires_at > NOW();

-- Text search optimization with trigram indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_categories_name_trgm
ON service_categories USING GIN (name gin_trgm_ops)
WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_types_name_trgm
ON project_types USING GIN (name gin_trgm_ops)
WHERE is_active = TRUE;

-- 4. STATISTICS AND QUERY PLANNING OPTIMIZATION

-- Update table statistics for better query planning
ANALYZE service_categories;
ANALYZE project_types;
ANALYZE project_services;
ANALYZE provider_profiles;
ANALYZE provider_services;
ANALYZE provider_projects;

-- Create extended statistics for correlated columns
CREATE STATISTICS IF NOT EXISTS provider_quality_stats
ON rating, total_reviews, total_jobs_completed
FROM provider_profiles;

CREATE STATISTICS IF NOT EXISTS provider_location_stats
ON service_areas, coordinates
FROM provider_profiles;

-- 5. MATERIALIZED VIEWS FOR HEAVY QUERIES

-- Popular services with provider counts (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_popular_services AS
SELECT
  sc.id,
  sc.name,
  sc.icon,
  sc.description,
  sc.avg_price_min,
  sc.avg_price_max,
  COUNT(ps.provider_id) as provider_count,
  AVG(pp.rating) as avg_provider_rating,
  COUNT(CASE WHEN pp.is_available_today THEN 1 END) as available_today_count
FROM service_categories sc
LEFT JOIN provider_services ps ON ps.service_id = sc.id
LEFT JOIN provider_profiles pp ON pp.user_id = ps.provider_id
  AND pp.verification_status = 'approved'
  AND pp.is_available = TRUE
WHERE sc.is_active = TRUE
GROUP BY sc.id, sc.name, sc.icon, sc.description, sc.avg_price_min, sc.avg_price_max
ORDER BY provider_count DESC, avg_provider_rating DESC;

CREATE UNIQUE INDEX ON mv_popular_services (id);

-- Popular projects with complexity and pricing info
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_popular_projects AS
SELECT
  pt.id,
  pt.name,
  pt.icon,
  pt.description,
  pt.complexity,
  pt.category,
  pt.avg_price_min,
  pt.avg_price_max,
  COUNT(pp.provider_id) as capable_provider_count,
  AVG(pp.base_price_clp) as avg_quoted_price,
  COUNT(DISTINCT ps_req.service_id) as required_services_count,
  COUNT(DISTINCT ps_opt.service_id) as optional_services_count
FROM project_types pt
LEFT JOIN provider_projects pp ON pp.project_id = pt.id
LEFT JOIN project_services ps_req ON ps_req.project_id = pt.id AND ps_req.is_required = TRUE
LEFT JOIN project_services ps_opt ON ps_opt.project_id = pt.id AND ps_opt.is_required = FALSE
WHERE pt.is_active = TRUE
GROUP BY pt.id, pt.name, pt.icon, pt.description, pt.complexity, pt.category, pt.avg_price_min, pt.avg_price_max
ORDER BY capable_provider_count DESC;

CREATE UNIQUE INDEX ON mv_popular_projects (id);

-- Location-based provider density
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_provider_density_by_commune AS
SELECT
  commune,
  COUNT(*) as provider_count,
  AVG(rating) as avg_rating,
  COUNT(CASE WHEN is_available_today THEN 1 END) as available_today_count,
  ARRAY_AGG(DISTINCT unnest(services)) as available_services
FROM provider_profiles pp
CROSS JOIN LATERAL unnest(pp.service_areas) as commune
WHERE pp.verification_status = 'approved'
  AND pp.is_available = TRUE
GROUP BY commune
ORDER BY provider_count DESC;

CREATE INDEX ON mv_provider_density_by_commune (commune);

-- 6. PERFORMANCE MONITORING VIEWS

-- Search query performance monitoring
CREATE OR REPLACE VIEW v_search_performance AS
SELECT
  search_type,
  search_key,
  location_key,
  COUNT(*) as search_count,
  AVG(result_count) as avg_results,
  MAX(created_at) as last_searched,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_cache_entries
FROM search_cache
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY search_type, search_key, location_key
ORDER BY search_count DESC;

-- Provider search ranking analysis
CREATE OR REPLACE VIEW v_provider_search_rankings AS
SELECT
  pp.user_id,
  u.full_name,
  pp.business_name,
  pp.rating,
  pp.total_reviews,
  pp.total_jobs_completed,
  COUNT(ps.service_id) as service_count,
  COUNT(ppr.project_id) as project_count,
  ARRAY_AGG(DISTINCT ps.service_id) as services,
  ARRAY_AGG(DISTINCT pp_services.service_areas) as coverage_areas
FROM provider_profiles pp
INNER JOIN users u ON u.id = pp.user_id
LEFT JOIN provider_services ps ON ps.provider_id = pp.user_id
LEFT JOIN provider_projects ppr ON ppr.provider_id = pp.user_id
CROSS JOIN LATERAL unnest(pp.service_areas) as coverage_area
WHERE pp.verification_status = 'approved'
  AND pp.is_available = TRUE
GROUP BY pp.user_id, u.full_name, pp.business_name, pp.rating, pp.total_reviews, pp.total_jobs_completed
ORDER BY pp.rating DESC, pp.total_reviews DESC;

-- 7. AUTOMATED MAINTENANCE FUNCTIONS

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_search_materialized_views()
RETURNS TEXT AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
BEGIN
  start_time := NOW();

  REFRESH MATERIALIZED VIEW mv_popular_services;
  REFRESH MATERIALIZED VIEW mv_popular_projects;
  REFRESH MATERIALIZED VIEW mv_provider_density_by_commune;

  end_time := NOW();

  RETURN 'Materialized views refreshed in ' || EXTRACT(EPOCH FROM (end_time - start_time)) || ' seconds';
END;
$$ LANGUAGE plpgsql;

-- Function to analyze search performance
CREATE OR REPLACE FUNCTION analyze_search_performance(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  metric_unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'total_searches'::TEXT, COUNT(*)::NUMERIC, 'count'::TEXT
  FROM search_cache
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL

  UNION ALL

  SELECT 'avg_results_per_search'::TEXT, AVG(result_count)::NUMERIC, 'providers'::TEXT
  FROM search_cache
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL

  UNION ALL

  SELECT 'cache_hit_ratio'::TEXT,
    (COUNT(CASE WHEN expires_at > created_at + INTERVAL '5 minutes' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100)::NUMERIC,
    'percentage'::TEXT
  FROM search_cache
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL

  UNION ALL

  SELECT 'most_searched_service'::TEXT, 1::NUMERIC,
    (SELECT search_key FROM search_cache
     WHERE search_type = 'service' AND created_at >= NOW() - (days_back || ' days')::INTERVAL
     GROUP BY search_key ORDER BY COUNT(*) DESC LIMIT 1)::TEXT

  UNION ALL

  SELECT 'most_searched_project'::TEXT, 1::NUMERIC,
    (SELECT search_key FROM search_cache
     WHERE search_type = 'project' AND created_at >= NOW() - (days_back || ' days')::INTERVAL
     GROUP BY search_key ORDER BY COUNT(*) DESC LIMIT 1)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 8. QUERY OPTIMIZATION SETTINGS

-- Optimize PostgreSQL settings for search workloads
-- These would typically be set in postgresql.conf, but shown here for reference

/*
-- Search-optimized PostgreSQL configuration recommendations:

-- Memory settings
shared_buffers = '256MB'                    -- Increase for better caching
work_mem = '4MB'                           -- For complex search queries
maintenance_work_mem = '64MB'              -- For index maintenance

-- Query planner settings
random_page_cost = 1.1                     -- Assuming SSD storage
effective_cache_size = '1GB'               -- Available system cache
default_statistics_target = 100           -- Better query planning

-- Full-text search settings
default_text_search_config = 'spanish'    -- Chilean market
*/

-- 9. SCHEDULED MAINTENANCE JOBS

-- Create functions that should be run periodically
CREATE OR REPLACE FUNCTION maintenance_search_system()
RETURNS TEXT AS $$
DECLARE
  result TEXT := '';
  cache_cleaned INTEGER;
BEGIN
  -- Clean expired cache entries
  SELECT clean_expired_search_cache() INTO cache_cleaned;
  result := result || 'Cleaned ' || cache_cleaned || ' expired cache entries. ';

  -- Refresh materialized views
  result := result || refresh_search_materialized_views() || ' ';

  -- Update statistics
  ANALYZE service_categories;
  ANALYZE project_types;
  ANALYZE provider_profiles;
  ANALYZE provider_services;
  ANALYZE provider_projects;
  result := result || 'Statistics updated. ';

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring for slow queries
CREATE OR REPLACE FUNCTION log_slow_search_queries()
RETURNS TABLE (
  query_text TEXT,
  calls BIGINT,
  total_time NUMERIC,
  mean_time NUMERIC
) AS $$
BEGIN
  -- This would integrate with pg_stat_statements if available
  -- For now, return placeholder data
  RETURN QUERY
  SELECT
    'search_providers_by_service'::TEXT,
    0::BIGINT,
    0::NUMERIC,
    0::NUMERIC
  WHERE FALSE; -- Placeholder
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON INDEX idx_provider_services_search_optimized IS 'Optimized index for service-based provider search';
COMMENT ON INDEX idx_provider_projects_search_optimized IS 'Optimized index for project-based provider search';
COMMENT ON INDEX idx_provider_profiles_search_filter IS 'Multi-column index for provider filtering';
COMMENT ON MATERIALIZED VIEW mv_popular_services IS 'Cached popular services with provider counts and ratings';
COMMENT ON MATERIALIZED VIEW mv_popular_projects IS 'Cached popular projects with complexity and pricing data';
COMMENT ON FUNCTION refresh_search_materialized_views() IS 'Refreshes all search-related materialized views';
COMMENT ON FUNCTION analyze_search_performance(INTEGER) IS 'Analyzes search performance metrics over specified time period';
COMMENT ON FUNCTION maintenance_search_system() IS 'Comprehensive maintenance function for search system';

-- Grant appropriate permissions for the functions
GRANT EXECUTE ON FUNCTION refresh_search_materialized_views() TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_search_performance(INTEGER) TO authenticated;
GRANT SELECT ON mv_popular_services TO anon, authenticated;
GRANT SELECT ON mv_popular_projects TO anon, authenticated;
GRANT SELECT ON v_search_performance TO authenticated;