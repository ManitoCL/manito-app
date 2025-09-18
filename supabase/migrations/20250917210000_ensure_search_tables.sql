-- Ensure search tables exist and refresh schema cache
-- This migration will create tables if they don't exist and refresh PostgREST cache

-- Drop and recreate tables to ensure they exist with correct structure
DROP TABLE IF EXISTS project_services CASCADE;
DROP TABLE IF EXISTS project_types CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;

-- Recreate enum types
DROP TYPE IF EXISTS complexity_level CASCADE;
DROP TYPE IF EXISTS project_category CASCADE;
DROP TYPE IF EXISTS urgency_level CASCADE;

CREATE TYPE urgency_level AS ENUM ('normal', 'urgente', 'emergencia');
CREATE TYPE complexity_level AS ENUM ('simple', 'medium', 'complex');
CREATE TYPE project_category AS ENUM ('interior', 'exterior', 'electrical', 'plumbing', 'maintenance', 'cleaning', 'construction');

-- Service categories table
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

-- Project types table
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

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "Public read access" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON project_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON project_services FOR SELECT USING (true);

-- Insert essential Chilean services
INSERT INTO service_categories (id, name, icon, description, avg_price_min, avg_price_max, urgency_levels, color, sort_order) VALUES
('electricista', 'Electricista', '⚡', 'Instalación y reparación eléctrica residencial', 25000, 80000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#f59e0b', 1),
('gasfiter', 'Gasfiter', '🚿', 'Instalación y reparación de cañerías, grifos y sistemas de agua', 30000, 90000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#3b82f6', 2),
('limpieza_hogar', 'Limpieza del Hogar', '🧽', 'Limpieza residencial regular y profunda', 15000, 50000, ARRAY['normal', 'urgente']::urgency_level[], '#10b981', 3),
('jardineria', 'Jardinería', '🌱', 'Cuidado de jardines, poda y mantención de áreas verdes', 18000, 60000, ARRAY['normal']::urgency_level[], '#059669', 4),
('pintor_interior', 'Pintor Interior', '🎨', 'Pintura de interiores residenciales y comerciales', 200, 800, ARRAY['normal']::urgency_level[], '#8b5cf6', 5),
('carpintero', 'Carpintero', '🔨', 'Fabricación y reparación de muebles y estructuras de madera', 25000, 100000, ARRAY['normal']::urgency_level[], '#6b7280', 6),
('tecnico_electrodomesticos', 'Técnico en Electrodomésticos', '📱', 'Reparación de lavadoras, refrigeradores y electrodomésticos', 20000, 75000, ARRAY['normal', 'urgente']::urgency_level[], '#2563eb', 7),
('cerrajero', 'Cerrajero', '🔐', 'Instalación y reparación de cerraduras y sistemas de seguridad', 15000, 60000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#4b5563', 8),
('constructor', 'Constructor', '🏗️', 'Construcción de obras menores y ampliaciones', 100000, 500000, ARRAY['normal']::urgency_level[], '#374151', 9),
('climatizacion', 'Climatización', '❄️', 'Instalación y mantención de aire acondicionado y calefacción', 40000, 120000, ARRAY['normal', 'urgente']::urgency_level[], '#06b6d4', 10);

-- Insert essential Chilean projects
INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, sort_order) VALUES
('reparar_bano', 'Reparar Baño', 'Reparación de problemas en el baño: filtraciones, grifería, cerámicos', '1-3 días', 40000, 150000, 'medium', '🚿', 'interior', 1),
('renovar_cocina', 'Renovar Cocina', 'Renovación completa o parcial de cocina con muebles y electrodomésticos', '1-3 semanas', 1200000, 5000000, 'complex', '🍳', 'interior', 2),
('pintar_interior', 'Pintar Interior', 'Pintura de paredes interiores de una o más habitaciones', '2-5 días', 150000, 600000, 'simple', '🎨', 'interior', 3),
('instalar_piso', 'Instalar Piso', 'Instalación de piso flotante, laminado o cerámico', '2-5 días', 250000, 800000, 'medium', '📐', 'interior', 4),
('instalar_luces', 'Instalar Luminarias', 'Instalación de lámparas, focos LED y sistemas de iluminación', '2-6 horas', 25000, 100000, 'simple', '💡', 'electrical', 5),
('reparar_filtracion', 'Reparar Filtración', 'Detección y reparación de filtraciones de agua', '2-8 horas', 30000, 120000, 'medium', '💧', 'plumbing', 6),
('mantener_jardin', 'Mantención de Jardín', 'Poda, riego y cuidado regular del jardín', '2-6 horas', 20000, 60000, 'simple', '🌱', 'exterior', 7),
('limpieza_profunda', 'Limpieza Profunda', 'Limpieza completa y detallada de toda la casa', '4-8 horas', 40000, 100000, 'simple', '✨', 'cleaning', 8),
('reparar_lavadora', 'Reparar Lavadora', 'Diagnóstico y reparación de lavadoras', '1-3 horas', 30000, 100000, 'medium', '🧺', 'maintenance', 9),
('cambiar_cerraduras', 'Cambiar Cerraduras', 'Reemplazo de cerraduras de puertas principales', '1-3 horas', 30000, 100000, 'simple', '🔐', 'maintenance', 10);

-- Insert project-service relationships
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('reparar_bano', 'gasfiter', true),
('reparar_bano', 'electricista', false),
('renovar_cocina', 'carpintero', true),
('renovar_cocina', 'electricista', true),
('renovar_cocina', 'gasfiter', false),
('pintar_interior', 'pintor_interior', true),
('instalar_piso', 'carpintero', true),
('instalar_luces', 'electricista', true),
('reparar_filtracion', 'gasfiter', true),
('mantener_jardin', 'jardineria', true),
('limpieza_profunda', 'limpieza_hogar', true),
('reparar_lavadora', 'tecnico_electrodomesticos', true),
('cambiar_cerraduras', 'cerrajero', true);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';