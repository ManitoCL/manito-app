-- Fix Service Categories and Add Missing Project Types
-- November 17, 2025

-- ============================================================================
-- 1. FIX TERMINOLOGY: Electrodomésticos → Línea Blanca
-- ============================================================================

-- FIRST: Update all foreign key references in project_services
UPDATE project_services
SET service_id = 'linea_blanca'
WHERE service_id = 'electrodomesticos';

-- SECOND: Update all foreign key references in project_types
UPDATE project_types
SET category = 'linea_blanca'
WHERE category = 'electrodomesticos';

-- THIRD: Now we can safely update the service category itself
UPDATE service_categories
SET
  id = 'linea_blanca',
  name = 'Línea Blanca',
  description = 'Reparación e instalación de línea blanca (lavadora, refrigerador, lavavajillas, secadora)'
WHERE id = 'electrodomesticos';

-- ============================================================================
-- 2. ADD MISSING SERVICE CATEGORY: Piscinas
-- ============================================================================

INSERT INTO service_categories (id, name, icon, description, avg_price_min, avg_price_max, urgency_levels, color, is_active, sort_order) VALUES
('piscinas', 'Piscinas & Spa', '🏊', 'Construcción, mantención, limpieza y reparación de piscinas y spa', 40000, 300000, ARRAY['normal', 'urgente']::urgency_level[], '#0ea5e9', true, 27)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. MOVE POOL/SPA PROJECTS TO PISCINAS CATEGORY
-- ============================================================================

UPDATE project_types
SET category = 'piscinas'
WHERE id IN (
  'construccion_piscina',
  'mantencion_piscina',
  'limpieza_profunda_piscina',
  'reparacion_piscina',
  'sistema_filtracion_piscina',
  'instalacion_jacuzzi',
  'mantencion_jacuzzi',
  'reparacion_spa'
);

-- ============================================================================
-- 4. MOVE CURTAIN PROJECTS TO TOLDOS_COBERTURAS
-- ============================================================================

UPDATE project_types
SET category = 'toldos_coberturas'
WHERE id IN (
  'cortinas_blackout',
  'cortinas_motorizadas',
  'instalar_cortinas',
  'persianas_roller',
  'persianas_venecianas'
);

-- ============================================================================
-- 5. MOVE PHYSICAL TECH INSTALLATION TO ELECTRICIDAD
-- ============================================================================

-- These require physical installation (drilling, wiring, cable runs)
UPDATE project_types
SET category = 'electricidad'
WHERE id IN (
  'montar_tv_pared',
  'instalacion_home_theater',
  'cableado_red_domestica',
  'instalacion_antena_tv'
);

-- Keep these in otros_servicios (software/config, not physical work):
-- - configuracion_smart_tv
-- - instalacion_internet_wifi
-- - instalacion_tv_cable
-- - reparacion_internet_domestico

-- ============================================================================
-- 6. ADD MISSING PROJECT TYPES: Gas SEC Certification (LEGALLY REQUIRED)
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES
('certificacion_sec_gas', 'Certificación SEC Gas', 'Inspección y certificación SEC para instalaciones de gas (legalmente requerida)', '2-4 horas', 40000, 120000, 'medium', '📋', 'gasfiteria_gas', true, 20),
('revision_anual_gas', 'Revisión Anual Instalación Gas', 'Revisión preventiva anual de instalación de gas (recomendada)', '1-2 horas', 30000, 80000, 'simple', '🔍', 'gasfiteria_gas', true, 21)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. ADD MISSING PROJECT TYPES: Construction/Finishing (Popular in Chile)
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES
('enchape_piedra', 'Enchape de Piedra', 'Revestimiento de muros con piedra natural o sintética', '2-5 días', 120000, 500000, 'complex', '🪨', 'construccion_obras', true, 2800),
('instalacion_porcelanato', 'Instalación Porcelanato', 'Instalación de porcelanato de gran formato (técnica especializada)', '2-4 días', 12000, 40000, 'complex', '🔲', 'ceramica_pisos', true, 1104),
('cobertizo_bodega', 'Construcción Cobertizo/Bodega', 'Construcción de cobertizos y bodegas para almacenamiento', '1-2 semanas', 300000, 1200000, 'complex', '🏚️', 'construccion_obras', true, 2900)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. ADD MISSING PROJECT TYPES: Electrical & Metal Work
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES
('reparacion_generador', 'Reparación Generador', 'Diagnóstico y reparación de generadores eléctricos', '2-6 horas', 80000, 300000, 'complex', '⚡', 'electricidad', true, 105),
('pergola_metalica', 'Pérgola Metálica', 'Construcción de pérgolas de estructura metálica', '3-7 días', 250000, 900000, 'complex', '🏗️', 'herreria_soldadura', true, 211)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 9. UPDATE PROJECT-SERVICE RELATIONSHIPS
-- ============================================================================

-- Add relationships for piscinas projects
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('construccion_piscina', 'piscinas', true),
('construccion_piscina', 'construccion_obras', true),
('mantencion_piscina', 'piscinas', true),
('limpieza_profunda_piscina', 'piscinas', true),
('reparacion_piscina', 'piscinas', true),
('sistema_filtracion_piscina', 'piscinas', true),
('sistema_filtracion_piscina', 'electricidad', false),
('instalacion_jacuzzi', 'piscinas', true),
('instalacion_jacuzzi', 'electricidad', false),
('mantencion_jacuzzi', 'piscinas', true),
('reparacion_spa', 'piscinas', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for gas certification projects
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('certificacion_sec_gas', 'gasfiteria_gas', true),
('revision_anual_gas', 'gasfiteria_gas', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for construction/finishing projects
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('enchape_piedra', 'construccion_obras', true),
('instalacion_porcelanato', 'ceramica_pisos', true),
('cobertizo_bodega', 'construccion_obras', true),
('cobertizo_bodega', 'carpinteria_muebles', false)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for electrical & metal work
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('reparacion_generador', 'electricidad', true),
('pergola_metalica', 'herreria_soldadura', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for tech projects moved to electricidad
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('montar_tv_pared', 'electricidad', true),
('instalacion_home_theater', 'electricidad', true),
('cableado_red_domestica', 'electricidad', true),
('instalacion_antena_tv', 'electricidad', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for curtain projects moved to toldos_coberturas
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('cortinas_blackout', 'toldos_coberturas', true),
('cortinas_motorizadas', 'toldos_coberturas', true),
('cortinas_motorizadas', 'electricidad', false),
('instalar_cortinas', 'toldos_coberturas', true),
('persianas_roller', 'toldos_coberturas', true),
('persianas_venecianas', 'toldos_coberturas', true)
ON CONFLICT (project_id, service_id) DO NOTHING;
