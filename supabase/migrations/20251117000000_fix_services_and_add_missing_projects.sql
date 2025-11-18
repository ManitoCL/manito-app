-- Fix Service Categories and Add Missing Project Types
-- November 17, 2025

-- ============================================================================
-- 1. FIX TERMINOLOGY: Electrodomésticos → Línea Blanca
-- ============================================================================

UPDATE service_categories
SET
  id = 'linea_blanca',
  name = 'Línea Blanca',
  description = 'Reparación e instalación de línea blanca (lavadora, refrigerador, lavavajillas, secadora)'
WHERE id = 'electrodomesticos';

-- Update project_types that reference old category
UPDATE project_types
SET category = 'linea_blanca'
WHERE category = 'electrodomesticos';

-- ============================================================================
-- 2. ADD MISSING SERVICE CATEGORY: Piscinas
-- ============================================================================

INSERT INTO service_categories (id, name, icon, description, avg_price_min, avg_price_max, urgency_levels, color, is_active, sort_order) VALUES
('piscinas', 'Piscinas', '🏊', 'Mantención, limpieza y reparación de piscinas', 40000, 300000, ARRAY['normal', 'urgente']::urgency_level[], '#0ea5e9', true, 27);

-- ============================================================================
-- 3. MOVE POOL PROJECT TO PISCINAS CATEGORY
-- ============================================================================

UPDATE project_types
SET category = 'piscinas'
WHERE id = 'construccion_piscina';

-- ============================================================================
-- 4. MOVE CURTAIN PROJECTS TO TOLDOS_COBERTURAS
-- ============================================================================

UPDATE project_types
SET category = 'toldos_coberturas'
WHERE id IN ('cortinas_blackout', 'cortinas_motorizadas', 'instalar_cortinas');

-- ============================================================================
-- 5. MOVE TECH PROJECTS TO ELECTRICIDAD (from otros_servicios)
-- ============================================================================

UPDATE project_types
SET category = 'electricidad'
WHERE id IN ('configuracion_smart_tv', 'cableado_red_domestica', 'instalacion_antena_tv');

-- ============================================================================
-- 6. ADD MISSING PROJECT TYPES: Línea Blanca
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES

-- Appliance Repairs (CRITICAL GAP - category existed but no projects!)
('reparar_lavadora', 'Reparar Lavadora', 'Diagnóstico y reparación de lavadoras automáticas', '1-3 horas', 35000, 120000, 'medium', '🧺', 'linea_blanca', true, 1500),
('reparar_refrigerador', 'Reparar Refrigerador', 'Reparación de refrigeradores y congeladores', '1-3 horas', 40000, 150000, 'medium', '🧊', 'linea_blanca', true, 1501),
('reparar_lavavajillas', 'Reparar Lavavajillas', 'Reparación de lavavajillas automático', '1-3 horas', 35000, 120000, 'medium', '🍽️', 'linea_blanca', true, 1502),
('reparar_secadora', 'Reparar Secadora', 'Reparación de secadoras de ropa', '1-3 horas', 35000, 120000, 'medium', '👔', 'linea_blanca', true, 1503),
('instalar_lavavajillas', 'Instalar Lavavajillas', 'Instalación de lavavajillas con conexiones de agua y desagüe', '2-4 horas', 60000, 180000, 'medium', '🍽️', 'linea_blanca', true, 1504),
('reparar_campana', 'Reparar Campana Extractora', 'Reparación de campanas extractoras de cocina', '1-2 horas', 30000, 90000, 'simple', '💨', 'linea_blanca', true, 1505),
('instalar_campana', 'Instalar Campana Extractora', 'Instalación de campana extractora con ducto', '2-4 horas', 50000, 150000, 'medium', '💨', 'linea_blanca', true, 1506);

-- ============================================================================
-- 7. ADD MISSING PROJECT TYPES: Piscinas
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES

('mantencion_piscina', 'Mantención de Piscina', 'Mantención regular: limpieza, químicos, filtros', '2-4 horas', 40000, 100000, 'simple', '🏊', 'piscinas', true, 2700),
('limpieza_piscina', 'Limpieza Profunda Piscina', 'Limpieza completa de piscina y aspirado', '3-6 horas', 60000, 150000, 'medium', '✨', 'piscinas', true, 2701),
('reparar_filtro_piscina', 'Reparar Filtro de Piscina', 'Reparación de sistema de filtración', '2-4 horas', 50000, 200000, 'medium', '🔧', 'piscinas', true, 2702),
('calefaccion_piscina', 'Calefacción de Piscina', 'Instalación de calentadores para piscina', '1-2 días', 300000, 1200000, 'complex', '🔥', 'piscinas', true, 2703),
('reparar_bomba_piscina', 'Reparar Bomba de Piscina', 'Reparación de bomba de circulación', '2-4 horas', 60000, 200000, 'medium', '💧', 'piscinas', true, 2704);

-- ============================================================================
-- 8. ADD MISSING PROJECT TYPES: Gas SEC Certification (under gasfiteria_gas)
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES

('certificacion_sec_gas', 'Certificación SEC Gas', 'Inspección y certificación SEC para instalaciones de gas (legalmente requerida)', '2-4 horas', 40000, 120000, 'medium', '📋', 'gasfiteria_gas', true, 15),
('revision_anual_gas', 'Revisión Anual Instalación Gas', 'Revisión preventiva anual de instalación de gas', '1-2 horas', 30000, 80000, 'simple', '🔍', 'gasfiteria_gas', true, 16),
('mantencion_caldera', 'Mantención de Caldera', 'Mantención preventiva de calderas de gas', '2-4 horas', 60000, 180000, 'medium', '🔧', 'gasfiteria_gas', true, 17),
('mantencion_calefont', 'Mantención de Calefón', 'Limpieza y mantención de calefón', '1-2 horas', 30000, 80000, 'simple', '🔧', 'gasfiteria_gas', true, 18);

-- ============================================================================
-- 9. ADD MISSING PROJECT TYPES: Water Infrastructure
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES

('instalar_estanque_agua', 'Instalar Estanque de Agua', 'Instalación de estanque de agua (tinaco)', '4-8 horas', 150000, 500000, 'medium', '💧', 'gasfiteria_agua', true, 1400),
('limpiar_estanque_agua', 'Limpiar Estanque de Agua', 'Limpieza y desinfección de estanque de agua potable', '3-5 horas', 40000, 120000, 'simple', '✨', 'gasfiteria_agua', true, 1401),
('tratamiento_antisarro', 'Tratamiento Anti-Sarro', 'Instalación de sistema anti-sarro para cañerías', '2-4 horas', 80000, 250000, 'medium', '🔧', 'gasfiteria_agua', true, 1402);

-- ============================================================================
-- 10. ADD MISSING PROJECT TYPES: Carpintería/Pintura
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES

('pintura_muebles', 'Pintura de Muebles', 'Pintura y restauración de muebles de madera', '1-3 días', 40000, 150000, 'medium', '🎨', 'pintura_terminaciones', true, 40),
('restauracion_muebles', 'Restauración de Muebles', 'Restauración completa de muebles antiguos', '3-7 días', 80000, 300000, 'complex', '🪑', 'carpinteria_muebles', true, 1304),
('reparar_estructural_muebles', 'Reparación Estructural Muebles', 'Reparación de estructura de muebles dañados', '1-3 días', 50000, 200000, 'medium', '🔨', 'carpinteria_muebles', true, 1305);

-- ============================================================================
-- 11. ADD MISSING PROJECT TYPES: Construction/Maintenance
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES

('tratamiento_humedad', 'Tratamiento Humedad y Moho', 'Diagnóstico y tratamiento de problemas de humedad', '1-5 días', 100000, 500000, 'medium', '💨', 'construccion_obras', true, 60),
('reparar_goteras', 'Reparar Goteras', 'Detección y reparación de goteras en techo', '1-3 días', 60000, 250000, 'medium', '💧', 'techumbres', true, 1204),
('instalar_ventanas_pvc', 'Instalar Ventanas PVC', 'Instalación de ventanas de PVC', '1-2 días', 120000, 450000, 'medium', '🪟', 'vidrios_ventanas', true, 404),
('pintura_rejas_portones', 'Pintura Rejas y Portones', 'Pintura y mantenimiento de estructuras metálicas', '1-2 días', 50000, 200000, 'medium', '🎨', 'herreria_soldadura', true, 210),
('lustrado_pisos', 'Lustrado de Pisos', 'Pulido y lustrado de pisos de madera', '1-2 días', 80000, 250000, 'medium', '✨', 'ceramica_pisos', true, 1102),
('reparar_puertas', 'Reparar Puertas', 'Reparación de puertas dañadas o rotas', '2-6 horas', 30000, 120000, 'simple', '🚪', 'carpinteria_muebles', true, 1306);

-- ============================================================================
-- 12. ADD MISSING PROJECT TYPES: Technology (under electricidad)
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, is_active, sort_order) VALUES

('instalar_tv_muro', 'Instalación TV en Muro', 'Montaje de televisor en pared con soportes', '1-2 horas', 30000, 80000, 'simple', '📺', 'electricidad', true, 28),
('instalar_home_theater', 'Instalación Home Theater', 'Instalación completa de sistema de cine en casa', '3-6 horas', 80000, 250000, 'medium', '🔊', 'electricidad', true, 29),
('instalar_fibra_optica', 'Instalación Fibra Óptica', 'Instalación interna de fibra óptica y router', '1-3 horas', 40000, 120000, 'simple', '📡', 'electricidad', true, 32);

-- ============================================================================
-- 13. UPDATE PROJECT-SERVICE RELATIONSHIPS
-- ============================================================================

-- Add relationships for new línea blanca projects
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('reparar_lavadora', 'linea_blanca', true),
('reparar_refrigerador', 'linea_blanca', true),
('reparar_lavavajillas', 'linea_blanca', true),
('reparar_secadora', 'linea_blanca', true),
('instalar_lavavajillas', 'linea_blanca', true),
('instalar_lavavajillas', 'gasfiteria_agua', true), -- needs water connection
('reparar_campana', 'linea_blanca', true),
('instalar_campana', 'linea_blanca', true),
('instalar_campana', 'electricidad', false) -- may need electrical
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for piscina projects
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('construccion_piscina', 'piscinas', true),
('construccion_piscina', 'construccion_obras', true),
('mantencion_piscina', 'piscinas', true),
('limpieza_piscina', 'piscinas', true),
('reparar_filtro_piscina', 'piscinas', true),
('calefaccion_piscina', 'piscinas', true),
('calefaccion_piscina', 'electricidad', false),
('reparar_bomba_piscina', 'piscinas', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for gas certification projects
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('certificacion_sec_gas', 'gasfiteria_gas', true),
('revision_anual_gas', 'gasfiteria_gas', true),
('mantencion_caldera', 'gasfiteria_gas', true),
('mantencion_calefont', 'gasfiteria_gas', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for water infrastructure
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('instalar_estanque_agua', 'gasfiteria_agua', true),
('limpiar_estanque_agua', 'gasfiteria_agua', true),
('tratamiento_antisarro', 'gasfiteria_agua', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for furniture projects
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('pintura_muebles', 'pintura_terminaciones', true),
('restauracion_muebles', 'carpinteria_muebles', true),
('restauracion_muebles', 'pintura_terminaciones', false),
('reparar_estructural_muebles', 'carpinteria_muebles', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for construction/maintenance
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('tratamiento_humedad', 'construccion_obras', true),
('reparar_goteras', 'techumbres', true),
('instalar_ventanas_pvc', 'vidrios_ventanas', true),
('pintura_rejas_portones', 'herreria_soldadura', true),
('pintura_rejas_portones', 'pintura_terminaciones', false),
('lustrado_pisos', 'ceramica_pisos', true),
('reparar_puertas', 'carpinteria_muebles', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for tech projects (now under electricidad)
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('instalar_tv_muro', 'electricidad', true),
('instalar_home_theater', 'electricidad', true),
('instalar_fibra_optica', 'electricidad', true),
('configuracion_smart_tv', 'electricidad', true),
('cableado_red_domestica', 'electricidad', true),
('instalacion_antena_tv', 'electricidad', true)
ON CONFLICT (project_id, service_id) DO NOTHING;

-- Add relationships for curtain projects (now under toldos_coberturas)
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('cortinas_blackout', 'toldos_coberturas', true),
('cortinas_motorizadas', 'toldos_coberturas', true),
('cortinas_motorizadas', 'electricidad', false), -- may need electrical
('instalar_cortinas', 'toldos_coberturas', true)
ON CONFLICT (project_id, service_id) DO NOTHING;
