-- Create essential search tables for Manito
-- This is a simplified version of the full migration

-- Enable full-text search extension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Add new enum types
DO $$ BEGIN
    CREATE TYPE complexity_level AS ENUM ('simple', 'medium', 'complex');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_category AS ENUM ('interior', 'exterior', 'electrical', 'plumbing', 'maintenance', 'cleaning', 'construction');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM ('normal', 'urgente', 'emergencia');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enhanced service categories table
CREATE TABLE IF NOT EXISTS service_categories (
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
CREATE TABLE IF NOT EXISTS project_types (
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
CREATE TABLE IF NOT EXISTS project_services (
  project_id TEXT REFERENCES project_types(id) ON DELETE CASCADE,
  service_id TEXT REFERENCES service_categories(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (project_id, service_id)
);

-- Set up RLS policies
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_services ENABLE ROW LEVEL SECURITY;

-- Anyone can view active service categories
CREATE POLICY IF NOT EXISTS "Anyone can view active service categories" ON service_categories
  FOR SELECT USING (is_active = TRUE);

-- Anyone can view active project types
CREATE POLICY IF NOT EXISTS "Anyone can view active project types" ON project_types
  FOR SELECT USING (is_active = TRUE);

-- Anyone can view project-service relationships
CREATE POLICY IF NOT EXISTS "Anyone can view project services" ON project_services
  FOR SELECT USING (true);

-- Insert initial service categories with Chilean market data
INSERT INTO service_categories (id, name, icon, description, avg_price_min, avg_price_max, urgency_levels, color, sort_order) VALUES
  ('electricista', 'Electricista', '⚡', 'Instalación y reparación eléctrica', 25000, 80000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#f59e0b', 1),
  ('plomero', 'Plomero', '🔧', 'Reparación de cañerías y grifos', 20000, 70000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#3b82f6', 2),
  ('gasfiter', 'Gasfiter', '🚿', 'Instalación y reparación de gas y agua', 30000, 90000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#2563eb', 3),
  ('limpieza', 'Limpieza', '🧽', 'Limpieza de hogar y oficinas', 15000, 50000, ARRAY['normal', 'urgente']::urgency_level[], '#10b981', 4),
  ('jardineria', 'Jardinería', '🌱', 'Cuidado de jardines y plantas', 18000, 60000, ARRAY['normal']::urgency_level[], '#059669', 5),
  ('pintura', 'Pintura', '🎨', 'Pintura interior y exterior', 200, 800, ARRAY['normal']::urgency_level[], '#8b5cf6', 6),
  ('carpintero', 'Carpintero', '🔨', 'Muebles y reparaciones de madera', 25000, 100000, ARRAY['normal']::urgency_level[], '#6b7280', 7),
  ('tecnico', 'Técnico', '📱', 'Reparación de electrodomésticos', 20000, 75000, ARRAY['normal', 'urgente']::urgency_level[], '#2563eb', 8),
  ('construccion', 'Construcción', '🏗️', 'Obras menores y remodelación', 50000, 200000, ARRAY['normal']::urgency_level[], '#374151', 9),
  ('cerrajero', 'Cerrajero', '🔐', 'Cerraduras y seguridad del hogar', 15000, 60000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#4b5563', 10)
ON CONFLICT (id) DO NOTHING;

-- Insert initial project types
INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, sort_order) VALUES
  ('bathroom-repair', 'Reparar Baño', 'Reparación de problemas en el baño (filtraciones, grifería, etc.)', '1-3 días', 40000, 150000, 'medium', '🚿', 'interior', 1),
  ('kitchen-renovation', 'Renovar Cocina', 'Renovación completa o parcial de cocina', '1-2 semanas', 300000, 1500000, 'complex', '🍳', 'interior', 2),
  ('wall-painting', 'Pintar Paredes', 'Pintura de paredes interiores o exteriores', '1-3 días', 200, 800, 'simple', '🎨', 'interior', 3),
  ('floor-installation', 'Instalar Piso', 'Instalación de pisos laminados, flotantes o cerámicos', '2-5 días', 8000, 25000, 'medium', '🏠', 'interior', 4),
  ('light-fixture', 'Instalar Luminarias', 'Instalación de lámparas, focos y sistemas de iluminación', '2-4 horas', 15000, 50000, 'simple', '💡', 'electrical', 5),
  ('electrical-repair', 'Reparar Instalación Eléctrica', 'Reparación de problemas eléctricos y cableado', '4-8 horas', 25000, 80000, 'medium', '⚡', 'electrical', 6),
  ('leak-repair', 'Reparar Filtración', 'Reparación de filtraciones de agua en cañerías', '2-6 horas', 20000, 70000, 'medium', '💧', 'plumbing', 7),
  ('toilet-repair', 'Reparar WC', 'Reparación o reemplazo de inodoro', '2-4 horas', 15000, 45000, 'simple', '🚽', 'plumbing', 8),
  ('garden-maintenance', 'Mantener Jardín', 'Mantenimiento regular de jardín y áreas verdes', '2-6 horas', 15000, 40000, 'simple', '🌿', 'exterior', 9),
  ('exterior-painting', 'Pintar Exterior', 'Pintura de fachadas y exteriores de la casa', '3-7 días', 300, 600, 'medium', '🏠', 'exterior', 10),
  ('deep-cleaning', 'Limpieza Profunda', 'Limpieza completa y profunda del hogar', '4-8 horas', 25000, 60000, 'simple', '✨', 'cleaning', 11),
  ('appliance-repair', 'Reparar Electrodoméstico', 'Reparación de lavadoras, refrigeradores y otros electrodomésticos', '1-3 horas', 20000, 75000, 'medium', '🔧', 'maintenance', 12),
  ('lock-installation', 'Instalar Cerraduras', 'Instalación de cerraduras y sistemas de seguridad', '1-2 horas', 15000, 45000, 'simple', '🔐', 'maintenance', 13)
ON CONFLICT (id) DO NOTHING;

-- Insert project-service relationships
INSERT INTO project_services (project_id, service_id, is_required) VALUES
  ('bathroom-repair', 'plomero', true),
  ('bathroom-repair', 'gasfiter', false),
  ('bathroom-repair', 'electricista', false),
  ('bathroom-repair', 'pintura', false),
  ('kitchen-renovation', 'carpintero', true),
  ('kitchen-renovation', 'plomero', false),
  ('kitchen-renovation', 'electricista', false),
  ('kitchen-renovation', 'pintura', false),
  ('kitchen-renovation', 'construccion', false),
  ('wall-painting', 'pintura', true),
  ('floor-installation', 'carpintero', true),
  ('floor-installation', 'construccion', false),
  ('light-fixture', 'electricista', true),
  ('electrical-repair', 'electricista', true),
  ('leak-repair', 'plomero', true),
  ('leak-repair', 'gasfiter', false),
  ('toilet-repair', 'plomero', true),
  ('garden-maintenance', 'jardineria', true),
  ('exterior-painting', 'pintura', true),
  ('exterior-painting', 'construccion', false),
  ('deep-cleaning', 'limpieza', true),
  ('appliance-repair', 'tecnico', true),
  ('appliance-repair', 'electricista', false),
  ('lock-installation', 'cerrajero', true)
ON CONFLICT (project_id, service_id) DO NOTHING;