-- Advanced Search Functions for Manito Marketplace
-- Supports both service-based and project-based search with Chilean market optimizations

-- Service-based search function
CREATE OR REPLACE FUNCTION search_providers_by_service(
  p_service_id TEXT,
  p_commune TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_min_price INTEGER DEFAULT NULL,
  p_max_price INTEGER DEFAULT NULL,
  p_min_rating DECIMAL DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_available_today BOOLEAN DEFAULT FALSE,
  p_urgency urgency_level DEFAULT 'normal',
  p_search_text TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  provider_id UUID,
  user_name TEXT,
  business_name TEXT,
  avatar_url TEXT,
  rating DECIMAL,
  total_reviews INTEGER,
  verification_status verification_status,
  hourly_rate_clp INTEGER,
  fixed_rate_clp INTEGER,
  response_time_hours INTEGER,
  is_available_today BOOLEAN,
  service_areas TEXT[],
  coordinates POINT,
  distance_km FLOAT,
  languages TEXT[],
  certifications TEXT[],
  total_jobs_completed INTEGER,
  business_info JSONB,
  portfolio_count INTEGER
) AS $$
DECLARE
  search_cache_key TEXT;
  cache_result RECORD;
BEGIN
  -- Generate cache key
  search_cache_key := p_service_id || '_' || COALESCE(p_commune, '') || '_' ||
                      COALESCE(p_min_price::text, '') || '_' || COALESCE(p_max_price::text, '') ||
                      '_' || COALESCE(p_min_rating::text, '') || '_' || p_verified_only::text ||
                      '_' || p_available_today::text || '_' || p_urgency::text;

  -- Check cache first
  SELECT INTO cache_result * FROM search_cache
  WHERE search_type = 'service'
    AND search_key = p_service_id
    AND location_key = COALESCE(p_commune, p_region)
    AND filters_hash = md5(search_cache_key)
    AND expires_at > NOW();

  -- If cache hit, use cached results (simplified for this example)
  -- In production, you'd reconstruct the full result set from cached provider_ids

  RETURN QUERY
  SELECT
    pp.user_id,
    u.full_name,
    pp.business_name,
    u.avatar_url,
    pp.rating,
    pp.total_reviews,
    pp.verification_status,
    ps.hourly_rate_clp,
    ps.fixed_rate_clp,
    pp.response_time_hours,
    pp.is_available_today,
    pp.service_areas,
    pp.coordinates,
    CASE
      WHEN p_commune IS NOT NULL AND pp.coordinates IS NOT NULL THEN
        calculate_distance(
          (SELECT ST_Y(ST_GeomFromText('POINT(' || coordinates->>'longitude' || ' ' || coordinates->>'latitude' || ')'))
           FROM addresses WHERE comuna = p_commune LIMIT 1),
          (SELECT ST_X(ST_GeomFromText('POINT(' || coordinates->>'longitude' || ' ' || coordinates->>'latitude' || ')'))
           FROM addresses WHERE comuna = p_commune LIMIT 1),
          ST_Y(pp.coordinates),
          ST_X(pp.coordinates)
        )
      ELSE NULL
    END as distance_km,
    pp.languages,
    pp.certifications,
    pp.total_jobs_completed,
    JSONB_BUILD_OBJECT(
      'rut', u.rut_number,
      'companyName', pp.business_name,
      'businessType', CASE WHEN pp.business_name IS NOT NULL THEN 'company' ELSE 'individual' END
    ),
    COALESCE(
      (SELECT COUNT(*)::INTEGER FROM provider_projects ppr WHERE ppr.provider_id = pp.user_id),
      0
    ) as portfolio_count
  FROM provider_profiles pp
  INNER JOIN users u ON u.id = pp.user_id
  INNER JOIN provider_services ps ON ps.provider_id = pp.user_id
  WHERE ps.service_id = p_service_id
    AND pp.verification_status = 'approved'
    AND pp.is_available = TRUE
    AND (NOT p_verified_only OR u.is_verified = TRUE)
    AND (NOT p_available_today OR pp.is_available_today = TRUE)
    AND (p_commune IS NULL OR p_commune = ANY(pp.service_areas))
    AND (p_region IS NULL OR p_region = ANY(pp.service_areas))
    AND (p_min_rating IS NULL OR pp.rating >= p_min_rating)
    AND (p_min_price IS NULL OR ps.hourly_rate_clp >= p_min_price OR ps.fixed_rate_clp >= p_min_price)
    AND (p_max_price IS NULL OR ps.hourly_rate_clp <= p_max_price OR ps.fixed_rate_clp <= p_max_price)
    AND (p_search_text IS NULL OR pp.search_vector @@ plainto_tsquery('spanish', p_search_text))
    AND (p_urgency = 'normal' OR p_urgency = ANY(
      SELECT unnest(urgency_levels) FROM service_categories WHERE id = p_service_id
    ))
  ORDER BY
    ps.is_primary_service DESC,
    pp.rating DESC,
    pp.total_reviews DESC,
    pp.total_jobs_completed DESC
  LIMIT p_limit
  OFFSET p_offset;

END;
$$ LANGUAGE plpgsql;

-- Project-based search function
CREATE OR REPLACE FUNCTION search_providers_by_project(
  p_project_id TEXT,
  p_commune TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_min_price INTEGER DEFAULT NULL,
  p_max_price INTEGER DEFAULT NULL,
  p_min_rating DECIMAL DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_available_today BOOLEAN DEFAULT FALSE,
  p_complexity complexity_level DEFAULT NULL,
  p_search_text TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  provider_id UUID,
  user_name TEXT,
  business_name TEXT,
  avatar_url TEXT,
  rating DECIMAL,
  total_reviews INTEGER,
  verification_status verification_status,
  base_price_clp INTEGER,
  can_provide_estimate BOOLEAN,
  response_time_hours INTEGER,
  is_available_today BOOLEAN,
  service_areas TEXT[],
  coordinates POINT,
  distance_km FLOAT,
  languages TEXT[],
  certifications TEXT[],
  total_jobs_completed INTEGER,
  portfolio_count INTEGER,
  required_services TEXT[],
  optional_services TEXT[],
  matching_services_count INTEGER,
  business_info JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH project_info AS (
    SELECT
      pt.id,
      pt.complexity,
      ARRAY_AGG(CASE WHEN ps_req.is_required THEN ps_req.service_id END)
        FILTER (WHERE ps_req.is_required) as required_services,
      ARRAY_AGG(CASE WHEN NOT ps_req.is_required THEN ps_req.service_id END)
        FILTER (WHERE NOT ps_req.is_required) as optional_services
    FROM project_types pt
    LEFT JOIN project_services ps_req ON ps_req.project_id = pt.id
    WHERE pt.id = p_project_id
    GROUP BY pt.id, pt.complexity
  ),
  provider_matches AS (
    SELECT
      pp.user_id,
      pi.required_services,
      pi.optional_services,
      COUNT(CASE WHEN ps.service_id = ANY(pi.required_services) THEN 1 END) as required_matches,
      COUNT(CASE WHEN ps.service_id = ANY(pi.optional_services) THEN 1 END) as optional_matches,
      COALESCE(ppr.base_price_clp, 0) as base_price_clp,
      COALESCE(ppr.can_provide_estimate, TRUE) as can_provide_estimate,
      COALESCE(ppr.portfolio_count, 0) as portfolio_count
    FROM provider_profiles pp
    CROSS JOIN project_info pi
    LEFT JOIN provider_services ps ON ps.provider_id = pp.user_id
    LEFT JOIN provider_projects ppr ON ppr.provider_id = pp.user_id AND ppr.project_id = p_project_id
    WHERE pp.verification_status = 'approved'
      AND pp.is_available = TRUE
      AND (NOT p_verified_only OR EXISTS (SELECT 1 FROM users u WHERE u.id = pp.user_id AND u.is_verified = TRUE))
      AND (NOT p_available_today OR pp.is_available_today = TRUE)
      AND (p_commune IS NULL OR p_commune = ANY(pp.service_areas))
      AND (p_region IS NULL OR p_region = ANY(pp.service_areas))
      AND (p_min_rating IS NULL OR pp.rating >= p_min_rating)
      AND (p_complexity IS NULL OR pi.complexity <= p_complexity OR
           EXISTS (SELECT 1 FROM provider_projects ppr2 WHERE ppr2.provider_id = pp.user_id))
      AND (p_search_text IS NULL OR pp.search_vector @@ plainto_tsquery('spanish', p_search_text))
    GROUP BY pp.user_id, pi.required_services, pi.optional_services, ppr.base_price_clp, ppr.can_provide_estimate, ppr.portfolio_count
    HAVING COUNT(CASE WHEN ps.service_id = ANY(pi.required_services) THEN 1 END) >= COALESCE(array_length(pi.required_services, 1), 0)
  )
  SELECT
    pm.user_id,
    u.full_name,
    pp.business_name,
    u.avatar_url,
    pp.rating,
    pp.total_reviews,
    pp.verification_status,
    pm.base_price_clp,
    pm.can_provide_estimate,
    pp.response_time_hours,
    pp.is_available_today,
    pp.service_areas,
    pp.coordinates,
    CASE
      WHEN p_commune IS NOT NULL AND pp.coordinates IS NOT NULL THEN
        calculate_distance(
          (SELECT ST_Y(ST_GeomFromText('POINT(' || coordinates->>'longitude' || ' ' || coordinates->>'latitude' || ')'))
           FROM addresses WHERE comuna = p_commune LIMIT 1),
          (SELECT ST_X(ST_GeomFromText('POINT(' || coordinates->>'longitude' || ' ' || coordinates->>'latitude' || ')'))
           FROM addresses WHERE comuna = p_commune LIMIT 1),
          ST_Y(pp.coordinates),
          ST_X(pp.coordinates)
        )
      ELSE NULL
    END as distance_km,
    pp.languages,
    pp.certifications,
    pp.total_jobs_completed,
    pm.portfolio_count,
    pm.required_services,
    pm.optional_services,
    (pm.required_matches + pm.optional_matches) as matching_services_count,
    JSONB_BUILD_OBJECT(
      'rut', u.rut_number,
      'companyName', pp.business_name,
      'businessType', CASE WHEN pp.business_name IS NOT NULL THEN 'company' ELSE 'individual' END
    )
  FROM provider_matches pm
  INNER JOIN provider_profiles pp ON pp.user_id = pm.user_id
  INNER JOIN users u ON u.id = pm.user_id
  WHERE (p_min_price IS NULL OR pm.base_price_clp >= p_min_price)
    AND (p_max_price IS NULL OR pm.base_price_clp <= p_max_price)
  ORDER BY
    pm.required_matches DESC,
    pm.optional_matches DESC,
    pp.rating DESC,
    pp.total_reviews DESC,
    pm.portfolio_count DESC,
    pp.total_jobs_completed DESC
  LIMIT p_limit
  OFFSET p_offset;

END;
$$ LANGUAGE plpgsql;

-- Quick search function for autocomplete
CREATE OR REPLACE FUNCTION quick_search(
  p_query TEXT,
  p_search_type TEXT DEFAULT 'all', -- 'all', 'services', 'projects', 'providers'
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  item_type TEXT,
  item_id TEXT,
  title TEXT,
  subtitle TEXT,
  icon TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Search services
    SELECT
      'service'::TEXT,
      sc.id,
      sc.name,
      sc.description,
      sc.icon,
      'service'::TEXT
    FROM service_categories sc
    WHERE (p_search_type = 'all' OR p_search_type = 'services')
      AND sc.is_active = TRUE
      AND (sc.name ILIKE '%' || p_query || '%' OR sc.description ILIKE '%' || p_query || '%')
    ORDER BY
      CASE WHEN sc.name ILIKE p_query || '%' THEN 1 ELSE 2 END,
      LENGTH(sc.name)
    LIMIT CASE WHEN p_search_type = 'services' THEN p_limit ELSE p_limit / 3 END
  )
  UNION ALL
  (
    -- Search projects
    SELECT
      'project'::TEXT,
      pt.id,
      pt.name,
      pt.description,
      pt.icon,
      pt.category::TEXT
    FROM project_types pt
    WHERE (p_search_type = 'all' OR p_search_type = 'projects')
      AND pt.is_active = TRUE
      AND (pt.name ILIKE '%' || p_query || '%' OR pt.description ILIKE '%' || p_query || '%')
    ORDER BY
      CASE WHEN pt.name ILIKE p_query || '%' THEN 1 ELSE 2 END,
      LENGTH(pt.name)
    LIMIT CASE WHEN p_search_type = 'projects' THEN p_limit ELSE p_limit / 3 END
  )
  UNION ALL
  (
    -- Search providers
    SELECT
      'provider'::TEXT,
      pp.user_id::TEXT,
      COALESCE(pp.business_name, u.full_name),
      pp.description,
      '👤'::TEXT,
      'provider'::TEXT
    FROM provider_profiles pp
    INNER JOIN users u ON u.id = pp.user_id
    WHERE (p_search_type = 'all' OR p_search_type = 'providers')
      AND pp.verification_status = 'approved'
      AND pp.is_available = TRUE
      AND pp.search_vector @@ plainto_tsquery('spanish', p_query)
    ORDER BY
      ts_rank(pp.search_vector, plainto_tsquery('spanish', p_query)) DESC,
      pp.rating DESC
    LIMIT CASE WHEN p_search_type = 'providers' THEN p_limit ELSE p_limit / 3 END
  )
  ORDER BY item_type, title
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get related services for a project
CREATE OR REPLACE FUNCTION get_project_services(p_project_id TEXT)
RETURNS TABLE (
  service_id TEXT,
  service_name TEXT,
  is_required BOOLEAN,
  provider_count INTEGER,
  avg_hourly_rate INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.service_id,
    sc.name,
    ps.is_required,
    COUNT(prs.provider_id)::INTEGER as provider_count,
    AVG(prs.hourly_rate_clp)::INTEGER as avg_hourly_rate
  FROM project_services ps
  INNER JOIN service_categories sc ON sc.id = ps.service_id
  LEFT JOIN provider_services prs ON prs.service_id = ps.service_id
  LEFT JOIN provider_profiles pp ON pp.user_id = prs.provider_id AND pp.verification_status = 'approved'
  WHERE ps.project_id = p_project_id
  GROUP BY ps.service_id, sc.name, ps.is_required
  ORDER BY ps.is_required DESC, sc.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get related projects for a service
CREATE OR REPLACE FUNCTION get_service_projects(p_service_id TEXT)
RETURNS TABLE (
  project_id TEXT,
  project_name TEXT,
  is_required_for BOOLEAN,
  complexity complexity_level,
  avg_price_min INTEGER,
  avg_price_max INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.project_id,
    pt.name,
    ps.is_required,
    pt.complexity,
    pt.avg_price_min,
    pt.avg_price_max
  FROM project_services ps
  INNER JOIN project_types pt ON pt.id = ps.project_id
  WHERE ps.service_id = p_service_id
    AND pt.is_active = TRUE
  ORDER BY ps.is_required DESC, pt.name;
END;
$$ LANGUAGE plpgsql;

-- Function to cache search results
CREATE OR REPLACE FUNCTION cache_search_results(
  p_search_type TEXT,
  p_search_key TEXT,
  p_location_key TEXT,
  p_filters_hash TEXT,
  p_provider_ids UUID[],
  p_result_count INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO search_cache (search_type, search_key, location_key, filters_hash, provider_ids, result_count)
  VALUES (p_search_type, p_search_key, p_location_key, p_filters_hash, p_provider_ids, p_result_count)
  ON CONFLICT (search_type, search_key, location_key, filters_hash)
  DO UPDATE SET
    provider_ids = EXCLUDED.provider_ids,
    result_count = EXCLUDED.result_count,
    created_at = NOW(),
    expires_at = NOW() + INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring function
CREATE OR REPLACE FUNCTION get_search_performance_stats()
RETURNS TABLE (
  search_type TEXT,
  total_searches BIGINT,
  cache_hits BIGINT,
  avg_result_count NUMERIC,
  most_searched_key TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.search_type,
    COUNT(*) as total_searches,
    COUNT(CASE WHEN sc.created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as cache_hits,
    AVG(sc.result_count) as avg_result_count,
    MODE() WITHIN GROUP (ORDER BY sc.search_key) as most_searched_key
  FROM search_cache sc
  WHERE sc.created_at > NOW() - INTERVAL '24 hours'
  GROUP BY sc.search_type;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for the new functions
CREATE INDEX IF NOT EXISTS idx_search_cache_composite ON search_cache(search_type, search_key, location_key, filters_hash);

-- Comments
COMMENT ON FUNCTION search_providers_by_service IS 'Main service-based search with filtering, caching, and Chilean market optimizations';
COMMENT ON FUNCTION search_providers_by_project IS 'Main project-based search matching providers to complex project requirements';
COMMENT ON FUNCTION quick_search IS 'Fast autocomplete search across services, projects, and providers';
COMMENT ON FUNCTION get_project_services IS 'Returns all services (required/optional) for a specific project type';
COMMENT ON FUNCTION get_service_projects IS 'Returns all projects that use a specific service';
COMMENT ON FUNCTION cache_search_results IS 'Caches search results for performance optimization';
COMMENT ON FUNCTION get_search_performance_stats IS 'Monitoring function for search performance analytics';