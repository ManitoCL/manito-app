-- Enhanced Search Schema for Manito Marketplace
-- Supports dual search approach: project-based and service-based

-- Enable full-text search extension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Add new enum types
CREATE TYPE complexity_level AS ENUM ('simple', 'medium', 'complex');
CREATE TYPE project_category AS ENUM ('interior', 'exterior', 'electrical', 'plumbing', 'maintenance', 'cleaning', 'construction');
CREATE TYPE urgency_level AS ENUM ('normal', 'urgente', 'emergencia');

-- Enhanced service categories table (replaces basic services table)
CREATE TABLE service_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  avg_price_min INTEGER, -- CLP
  avg_price_max INTEGER, -- CLP
  urgency_levels urgency_level[] DEFAULT '{}',
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project types table for project-based search
CREATE TABLE project_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  estimated_duration TEXT,
  avg_price_min INTEGER, -- CLP
  avg_price_max INTEGER, -- CLP
  complexity complexity_level DEFAULT 'medium',
  icon TEXT,
  category project_category NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for project-service relationships
CREATE TABLE project_services (
  project_id TEXT REFERENCES project_types(id) ON DELETE CASCADE,
  service_id TEXT REFERENCES service_categories(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (project_id, service_id)
);

-- Enhanced provider profiles with search optimization
ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS business_name_search TEXT,
ADD COLUMN IF NOT EXISTS description_search TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS has_callout_fee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS callout_fee_clp INTEGER,
ADD COLUMN IF NOT EXISTS min_job_value_clp INTEGER,
ADD COLUMN IF NOT EXISTS max_travel_distance_km INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{"Español"}',
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_available_today BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00"}',
ADD COLUMN IF NOT EXISTS coordinates POINT,
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Provider service specializations (many-to-many with pricing)
CREATE TABLE provider_services (
  provider_id UUID REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
  service_id TEXT REFERENCES service_categories(id) ON DELETE CASCADE,
  hourly_rate_clp INTEGER,
  fixed_rate_clp INTEGER,
  experience_years INTEGER DEFAULT 0,
  is_primary_service BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (provider_id, service_id)
);

-- Provider project capabilities
CREATE TABLE provider_projects (
  provider_id UUID REFERENCES provider_profiles(user_id) ON DELETE CASCADE,
  project_id TEXT REFERENCES project_types(id) ON DELETE CASCADE,
  base_price_clp INTEGER,
  can_provide_estimate BOOLEAN DEFAULT TRUE,
  portfolio_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (provider_id, project_id)
);

-- Search performance table for caching popular searches
CREATE TABLE search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_type TEXT NOT NULL, -- 'project' or 'service'
  search_key TEXT NOT NULL,  -- service_id or project_id
  location_key TEXT,         -- commune or region
  filters_hash TEXT,         -- hash of other filters
  provider_ids UUID[],       -- cached provider results
  result_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

-- Indexes for search performance
CREATE INDEX idx_service_categories_active ON service_categories(is_active, sort_order);
CREATE INDEX idx_project_types_active ON project_types(is_active, category, sort_order);
CREATE INDEX idx_project_types_category ON project_types(category);
CREATE INDEX idx_project_services_project ON project_services(project_id);
CREATE INDEX idx_project_services_service ON project_services(service_id);

-- Provider search indexes
CREATE INDEX idx_provider_profiles_available ON provider_profiles(is_available, verification_status);
CREATE INDEX idx_provider_profiles_rating_reviews ON provider_profiles(rating DESC, total_reviews DESC);
CREATE INDEX idx_provider_profiles_location ON provider_profiles USING GIST(coordinates);
CREATE INDEX idx_provider_profiles_service_areas_gin ON provider_profiles USING GIN(service_areas);
CREATE INDEX idx_provider_profiles_search_vector ON provider_profiles USING GIN(search_vector);
CREATE INDEX idx_provider_profiles_business_name_trgm ON provider_profiles USING GIN(business_name_search gin_trgm_ops);

-- Provider services indexes
CREATE INDEX idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX idx_provider_services_service ON provider_services(service_id);
CREATE INDEX idx_provider_services_primary ON provider_services(is_primary_service, provider_id);
CREATE INDEX idx_provider_services_rates ON provider_services(hourly_rate_clp, fixed_rate_clp);

-- Provider projects indexes
CREATE INDEX idx_provider_projects_provider ON provider_projects(provider_id);
CREATE INDEX idx_provider_projects_project ON provider_projects(project_id);
CREATE INDEX idx_provider_projects_price ON provider_projects(base_price_clp);

-- Search cache indexes
CREATE INDEX idx_search_cache_lookup ON search_cache(search_type, search_key, location_key, filters_hash);
CREATE INDEX idx_search_cache_expires ON search_cache(expires_at);

-- Functions for search optimization

-- Update search vector for full-text search
CREATE OR REPLACE FUNCTION update_provider_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.business_name_search := LOWER(COALESCE(NEW.business_name, ''));
  NEW.description_search := LOWER(COALESCE(NEW.description, ''));
  NEW.search_vector :=
    setweight(to_tsvector('spanish', COALESCE(NEW.business_name, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('spanish', array_to_string(NEW.services, ' ')), 'C') ||
    setweight(to_tsvector('spanish', array_to_string(NEW.specialties, ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_search_vector_trigger
  BEFORE INSERT OR UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_provider_search_vector();

-- Calculate distance between two points (in km)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 FLOAT, lng1 FLOAT, lat2 FLOAT, lng2 FLOAT)
RETURNS FLOAT AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lng2) - radians(lng1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Clean expired search cache
CREATE OR REPLACE FUNCTION clean_expired_search_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM search_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for new tables
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog tables
CREATE POLICY "Anyone can view active service categories" ON service_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view active project types" ON project_types
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view project services" ON project_services
  FOR SELECT USING (TRUE);

-- Provider access policies
CREATE POLICY "Providers can manage their services" ON provider_services
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Anyone can view approved provider services" ON provider_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = provider_id
      AND pp.verification_status = 'approved'
    )
  );

CREATE POLICY "Providers can manage their projects" ON provider_projects
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Anyone can view approved provider projects" ON provider_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = provider_id
      AND pp.verification_status = 'approved'
    )
  );

-- Search cache policies (public read for performance)
CREATE POLICY "Anyone can read search cache" ON search_cache
  FOR SELECT USING (expires_at > NOW());

-- Insert initial data
INSERT INTO service_categories (id, name, icon, description, avg_price_min, avg_price_max, urgency_levels, color) VALUES
  ('electricista', 'Electricista', '⚡', 'Instalación y reparación eléctrica', 25000, 80000, '{"normal","urgente","emergencia"}', '#f59e0b'),
  ('plomero', 'Plomero', '🔧', 'Reparación de cañerías y grifos', 20000, 70000, '{"normal","urgente","emergencia"}', '#3b82f6'),
  ('gasfiter', 'Gasfiter', '🚿', 'Instalación y reparación de gas y agua', 30000, 90000, '{"normal","urgente","emergencia"}', '#2563eb'),
  ('limpieza', 'Limpieza', '🧽', 'Limpieza de hogar y oficinas', 15000, 50000, '{"normal","urgente"}', '#10b981'),
  ('jardineria', 'Jardinería', '🌱', 'Cuidado de jardines y plantas', 18000, 60000, '{"normal"}', '#059669'),
  ('pintura', 'Pintura', '🎨', 'Pintura interior y exterior', 200, 800, '{"normal"}', '#8b5cf6'),
  ('carpintero', 'Carpintero', '🔨', 'Muebles y reparaciones de madera', 25000, 100000, '{"normal"}', '#374151'),
  ('tecnico', 'Técnico', '📱', 'Reparación de electrodomésticos', 20000, 75000, '{"normal","urgente"}', '#2563eb'),
  ('construccion', 'Construcción', '🏗️', 'Obras menores y remodelación', 50000, 200000, '{"normal"}', '#1f2937'),
  ('cerrajero', 'Cerrajero', '🔐', 'Cerraduras y seguridad del hogar', 15000, 60000, '{"normal","urgente","emergencia"}', '#4b5563');

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category) VALUES
  ('bathroom-repair', 'Reparar Baño', 'Reparación de problemas en el baño (filtraciones, grifería, etc.)', '1-3 días', 40000, 150000, 'medium', '🚿', 'interior'),
  ('kitchen-renovation', 'Renovar Cocina', 'Renovación completa o parcial de cocina', '1-2 semanas', 300000, 1500000, 'complex', '🍳', 'interior'),
  ('wall-painting', 'Pintar Paredes', 'Pintura de paredes interiores o exteriores', '1-3 días', 200, 800, 'simple', '🎨', 'interior'),
  ('floor-installation', 'Instalar Piso', 'Instalación de pisos laminados, flotantes o cerámicos', '2-5 días', 8000, 25000, 'medium', '🏠', 'interior'),
  ('light-fixture', 'Instalar Luminarias', 'Instalación de lámparas, focos y sistemas de iluminación', '2-4 horas', 15000, 50000, 'simple', '💡', 'electrical'),
  ('electrical-repair', 'Reparar Instalación Eléctrica', 'Reparación de problemas eléctricos y cableado', '4-8 horas', 25000, 80000, 'medium', '⚡', 'electrical'),
  ('leak-repair', 'Reparar Filtración', 'Reparación de filtraciones de agua en cañerías', '2-6 horas', 20000, 70000, 'medium', '💧', 'plumbing'),
  ('toilet-repair', 'Reparar WC', 'Reparación o reemplazo de inodoro', '2-4 horas', 15000, 45000, 'simple', '🚽', 'plumbing'),
  ('garden-maintenance', 'Mantener Jardín', 'Mantenimiento regular de jardín y áreas verdes', '2-6 horas', 15000, 40000, 'simple', '🌿', 'exterior'),
  ('exterior-painting', 'Pintar Exterior', 'Pintura de fachadas y exteriores de la casa', '3-7 días', 300, 600, 'medium', '🏠', 'exterior'),
  ('deep-cleaning', 'Limpieza Profunda', 'Limpieza completa y profunda del hogar', '4-8 horas', 25000, 60000, 'simple', '✨', 'cleaning'),
  ('appliance-repair', 'Reparar Electrodoméstico', 'Reparación de lavadoras, refrigeradores y otros electrodomésticos', '1-3 horas', 20000, 75000, 'medium', '🔧', 'maintenance'),
  ('lock-installation', 'Instalar Cerraduras', 'Instalación de cerraduras y sistemas de seguridad', '1-2 horas', 15000, 45000, 'simple', '🔐', 'maintenance');

-- Insert project-service relationships
INSERT INTO project_services (project_id, service_id, is_required) VALUES
  -- Bathroom repair
  ('bathroom-repair', 'plomero', TRUE),
  ('bathroom-repair', 'gasfiter', FALSE),
  ('bathroom-repair', 'electricista', FALSE),
  ('bathroom-repair', 'pintura', FALSE),

  -- Kitchen renovation
  ('kitchen-renovation', 'carpintero', TRUE),
  ('kitchen-renovation', 'plomero', FALSE),
  ('kitchen-renovation', 'electricista', FALSE),
  ('kitchen-renovation', 'pintura', FALSE),
  ('kitchen-renovation', 'construccion', FALSE),

  -- Wall painting
  ('wall-painting', 'pintura', TRUE),

  -- Floor installation
  ('floor-installation', 'carpintero', TRUE),
  ('floor-installation', 'construccion', FALSE),

  -- Light fixture
  ('light-fixture', 'electricista', TRUE),

  -- Electrical repair
  ('electrical-repair', 'electricista', TRUE),

  -- Leak repair
  ('leak-repair', 'plomero', TRUE),
  ('leak-repair', 'gasfiter', FALSE),

  -- Toilet repair
  ('toilet-repair', 'plomero', TRUE),

  -- Garden maintenance
  ('garden-maintenance', 'jardineria', TRUE),

  -- Exterior painting
  ('exterior-painting', 'pintura', TRUE),
  ('exterior-painting', 'construccion', FALSE),

  -- Deep cleaning
  ('deep-cleaning', 'limpieza', TRUE),

  -- Appliance repair
  ('appliance-repair', 'tecnico', TRUE),
  ('appliance-repair', 'electricista', FALSE),

  -- Lock installation
  ('lock-installation', 'cerrajero', TRUE);

-- Create a scheduled job to clean expired cache (requires pg_cron extension)
-- SELECT cron.schedule('clean-search-cache', '0 */6 * * *', 'SELECT clean_expired_search_cache();');

-- Comments for documentation
COMMENT ON TABLE service_categories IS 'Enhanced service categories with Chilean market pricing and urgency levels';
COMMENT ON TABLE project_types IS 'Project-based search catalog with complexity and duration estimates';
COMMENT ON TABLE project_services IS 'Many-to-many relationship between projects and required/optional services';
COMMENT ON TABLE provider_services IS 'Provider service specializations with individual pricing';
COMMENT ON TABLE provider_projects IS 'Provider project capabilities with portfolio counts';
COMMENT ON TABLE search_cache IS 'Performance cache for popular search queries';
COMMENT ON FUNCTION update_provider_search_vector() IS 'Maintains full-text search vectors for provider profiles';
COMMENT ON FUNCTION calculate_distance(FLOAT, FLOAT, FLOAT, FLOAT) IS 'Calculates distance between coordinates in kilometers';
COMMENT ON FUNCTION clean_expired_search_cache() IS 'Removes expired search cache entries';