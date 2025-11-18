-- Add Missing Chilean Home Services
-- Critical services identified for Chilean market completeness
-- Date: November 17, 2025

-- ============================================================================
-- FIX EXISTING SERVICE PRICING
-- ============================================================================

-- Fix pintor_interior pricing (missing unit - should be per m²)
UPDATE service_categories
SET description = 'Pintura de interiores residenciales y comerciales (precio por m²)'
WHERE id = 'pintor_interior';

-- ============================================================================
-- ADD MISSING CRITICAL SERVICES
-- ============================================================================

INSERT INTO service_categories (id, name, icon, description, avg_price_min, avg_price_max, urgency_levels, color, sort_order) VALUES

-- WINTER/HEATING SERVICES (Critical gap - mentioned in seasonal calendar but not offered!)
('deshollinador', 'Deshollinador', '🧹', 'Limpieza de chimeneas, estufas a leña y calefactores', 25000, 80000, ARRAY['normal', 'urgente']::urgency_level[], '#dc2626', 41),
('aislacion_termica', 'Aislación Térmica', '🏠', 'Instalación de aislación térmica en techos y paredes', 50000, 200000, ARRAY['normal']::urgency_level[], '#f97316', 42),
('termopanel', 'Instalación de Termopanel', '🪟', 'Instalación de ventanas de termopanel (doble vidrio hermético)', 80000, 300000, ARRAY['normal']::urgency_level[], '#0ea5e9', 43),

-- SECURITY SERVICES (70%+ of Chilean homes have these!)
('rejas_seguridad', 'Rejas de Seguridad', '🔒', 'Fabricación e instalación de rejas para ventanas y puertas', 40000, 200000, ARRAY['normal']::urgency_level[], '#374151', 44),
('porton_automatico', 'Portón Automático', '🚪', 'Instalación y reparación de portones automáticos', 150000, 600000, ARRAY['normal', 'urgente']::urgency_level[], '#1f2937', 45),
('citofono', 'Citófono e Intercomunicadores', '📞', 'Instalación y reparación de sistemas de citófono', 30000, 150000, ARRAY['normal', 'urgente']::urgency_level[], '#6b7280', 46),

-- INFRASTRUCTURE SERVICES (In calendar but not offered!)
('estanque_agua', 'Estanque de Agua', '💧', 'Instalación, reparación y limpieza de estanques de agua', 50000, 250000, ARRAY['normal', 'urgente']::urgency_level[], '#0284c7', 47),
('fosa_septica', 'Fosa Séptica', '🚽', 'Instalación, mantención y limpieza de fosas sépticas', 80000, 400000, ARRAY['normal', 'urgente']::urgency_level[], '#92400e', 48),

-- MOISTURE/HUMIDITY SPECIALISTS (Common Chilean issue)
('especialista_humedad', 'Especialista en Humedad', '💨', 'Diagnóstico y solución de problemas de humedad y filtraciones', 40000, 200000, ARRAY['normal', 'urgente']::urgency_level[], '#0ea5e9', 49),

-- INTERIOR FINISHING (Common service missing)
('cortinas_persianas', 'Cortinas y Persianas', '🪟', 'Instalación de cortinas, persianas y sistemas de control solar', 25000, 150000, ARRAY['normal']::urgency_level[], '#a855f7', 50),

-- MODERN/ECO SERVICES (Growing Chilean market)
('paneles_solares', 'Paneles Solares', '☀️', 'Instalación de sistemas de energía solar fotovoltaica', 500000, 3000000, ARRAY['normal']::urgency_level[], '#eab308', 51),
('domotica', 'Domótica', '🏡', 'Automatización del hogar e instalación de sistemas inteligentes', 100000, 500000, ARRAY['normal']::urgency_level[], '#3b82f6', 52);

-- ============================================================================
-- ADD NEW PROJECT TYPES FOR MISSING SERVICES
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, sort_order) VALUES

-- WINTER/HEATING PROJECTS
('limpiar_chimenea', 'Limpieza de Chimenea', 'Deshollinado y limpieza de chimenea o estufa a leña', '2-4 horas', 30000, 80000, 'simple', '🧹', 'maintenance', 37),
('instalar_aislacion', 'Instalar Aislación Térmica', 'Instalación de aislación en techo, paredes o entretecho', '2-5 días', 200000, 800000, 'medium', '🏠', 'construction', 38),
('cambiar_termopanel', 'Instalar Termopanel', 'Reemplazo de ventanas por termopanel doble vidrio hermético', '1-3 días', 150000, 600000, 'medium', '🪟', 'construction', 39),

-- SECURITY PROJECTS
('instalar_rejas', 'Instalar Rejas de Seguridad', 'Fabricación e instalación de rejas para ventanas y puertas', '1-3 días', 80000, 350000, 'medium', '🔒', 'construction', 40),
('instalar_porton', 'Instalar Portón Automático', 'Instalación de portón automático con motor y control remoto', '1-2 días', 300000, 1200000, 'complex', '🚪', 'construction', 41),
('reparar_porton', 'Reparar Portón Automático', 'Reparación de motor, rieles o sistema eléctrico de portón', '2-6 horas', 50000, 200000, 'medium', '🔧', 'maintenance', 42),
('instalar_citofono', 'Instalar Citófono', 'Instalación de sistema de citófono o videoportero', '3-6 horas', 80000, 300000, 'medium', '📞', 'maintenance', 43),

-- INFRASTRUCTURE PROJECTS
('limpiar_estanque', 'Limpieza de Estanque de Agua', 'Limpieza y desinfección de estanque de agua potable', '3-5 horas', 40000, 120000, 'simple', '💧', 'maintenance', 44),
('instalar_estanque', 'Instalar Estanque de Agua', 'Instalación de estanque de agua nuevo', '4-8 horas', 150000, 500000, 'medium', '💧', 'plumbing', 45),
('limpiar_fosa', 'Limpieza de Fosa Séptica', 'Vaciado y limpieza de fosa séptica', '2-4 horas', 80000, 200000, 'simple', '🚽', 'maintenance', 46),
('reparar_fosa', 'Reparar Fosa Séptica', 'Reparación o renovación de sistema de fosa séptica', '1-3 días', 200000, 800000, 'complex', '🔧', 'plumbing', 47),

-- MOISTURE/HUMIDITY PROJECTS
('solucionar_humedad', 'Solucionar Problema de Humedad', 'Diagnóstico y solución de humedad, moho o filtraciones', '1-5 días', 100000, 500000, 'medium', '💨', 'maintenance', 48),
('impermeabilizar_muro', 'Impermeabilizar Muros', 'Aplicación de impermeabilizante en muros exteriores', '1-2 días', 80000, 300000, 'medium', '🛡️', 'exterior', 49),

-- INTERIOR FINISHING PROJECTS
('instalar_cortinas', 'Instalar Cortinas', 'Instalación de cortinas, rieles y accesorios', '2-4 horas', 30000, 120000, 'simple', '🪟', 'interior', 50),
('instalar_persianas', 'Instalar Persianas', 'Instalación de persianas roller, americanas o venecianas', '2-4 horas', 40000, 150000, 'simple', '🪟', 'interior', 51),

-- MODERN/ECO PROJECTS
('instalar_paneles', 'Instalar Paneles Solares', 'Instalación de sistema fotovoltaico residencial', '1-3 días', 1500000, 5000000, 'complex', '☀️', 'electrical', 52),
('automatizar_casa', 'Automatización del Hogar', 'Instalación de sistema domótico (iluminación, clima, seguridad)', '2-5 días', 300000, 1500000, 'complex', '🏡', 'maintenance', 53);

-- ============================================================================
-- PROJECT-SERVICE RELATIONSHIPS FOR NEW PROJECTS
-- ============================================================================

INSERT INTO project_services (project_id, service_id, is_required) VALUES

-- Winter/Heating Projects
('limpiar_chimenea', 'deshollinador', true),
('instalar_aislacion', 'aislacion_termica', true),
('instalar_aislacion', 'constructor', false),
('cambiar_termopanel', 'termopanel', true),
('cambiar_termopanel', 'vidrieria', false),

-- Security Projects
('instalar_rejas', 'rejas_seguridad', true),
('instalar_rejas', 'soldador', false),
('instalar_porton', 'porton_automatico', true),
('instalar_porton', 'electricista', false),
('reparar_porton', 'porton_automatico', true),
('instalar_citofono', 'citofono', true),
('instalar_citofono', 'electricista', false),

-- Infrastructure Projects
('limpiar_estanque', 'estanque_agua', true),
('instalar_estanque', 'estanque_agua', true),
('instalar_estanque', 'gasfiter', false),
('limpiar_fosa', 'fosa_septica', true),
('reparar_fosa', 'fosa_septica', true),
('reparar_fosa', 'constructor', false),

-- Moisture/Humidity Projects
('solucionar_humedad', 'especialista_humedad', true),
('solucionar_humedad', 'constructor', false),
('impermeabilizar_muro', 'especialista_humedad', true),
('impermeabilizar_muro', 'fachada', false),

-- Interior Finishing Projects
('instalar_cortinas', 'cortinas_persianas', true),
('instalar_persianas', 'cortinas_persianas', true),

-- Modern/Eco Projects
('instalar_paneles', 'paneles_solares', true),
('instalar_paneles', 'electricista', false),
('automatizar_casa', 'domotica', true),
('automatizar_casa', 'electricista', false);

-- ============================================================================
-- UPDATE EXISTING PROJECT TO USE NEW SERVICE
-- ============================================================================

-- Link existing 'rejas_ventanas' project to new 'rejas_seguridad' service
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('rejas_ventanas', 'rejas_seguridad', true)
ON CONFLICT (project_id, service_id) DO NOTHING;
