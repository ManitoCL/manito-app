-- Comprehensive Chilean Home Services - Service Categories and Project Types
-- Based on Angi structure but adapted for Chilean market

-- Clear existing data to avoid conflicts
DELETE FROM project_services;
DELETE FROM project_types;
DELETE FROM service_categories;

-- ============================================================================
-- SERVICE CATEGORIES (Chilean Market Adapted)
-- ============================================================================

INSERT INTO service_categories (id, name, icon, description, avg_price_min, avg_price_max, urgency_levels, color, sort_order) VALUES
-- ELECTRICAL SERVICES
('electricista', 'Electricista', '⚡', 'Instalación, reparación y mantención eléctrica residencial', 25000, 80000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#f59e0b', 1),
('electricista_comercial', 'Electricista Comercial', '🏢', 'Instalaciones eléctricas comerciales e industriales', 50000, 150000, ARRAY['normal', 'urgente']::urgency_level[], '#f59e0b', 2),

-- PLUMBING SERVICES
('gasfiter', 'Gasfiter', '🚿', 'Instalación y reparación de cañerías, grifos y sistemas de agua', 30000, 90000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#3b82f6', 3),
('plomero', 'Plomero Especializado', '🔧', 'Trabajos complejos de plomería y sistemas hidráulicos', 35000, 100000, ARRAY['normal', 'urgente']::urgency_level[], '#2563eb', 4),

-- HVAC & CLIMATE CONTROL
('climatizacion', 'Climatización', '❄️', 'Instalación y mantención de aire acondicionado y calefacción', 40000, 120000, ARRAY['normal', 'urgente']::urgency_level[], '#06b6d4', 5),
('calefactor', 'Técnico en Calefacción', '🔥', 'Instalación y reparación de sistemas de calefacción', 30000, 85000, ARRAY['normal', 'urgente']::urgency_level[], '#dc2626', 6),

-- CLEANING SERVICES
('limpieza_hogar', 'Limpieza del Hogar', '🧽', 'Limpieza residencial regular y profunda', 15000, 50000, ARRAY['normal', 'urgente']::urgency_level[], '#10b981', 7),
('limpieza_oficina', 'Limpieza de Oficinas', '🏢', 'Servicios de limpieza comercial y oficinas', 25000, 75000, ARRAY['normal']::urgency_level[], '#059669', 8),
('limpieza_construccion', 'Limpieza Post-Construcción', '🚧', 'Limpieza especializada después de obras', 35000, 100000, ARRAY['normal']::urgency_level[], '#047857', 9),

-- LANDSCAPING & GARDEN
('jardineria', 'Jardinería', '🌱', 'Cuidado de jardines, poda y mantención de áreas verdes', 18000, 60000, ARRAY['normal']::urgency_level[], '#059669', 10),
('paisajismo', 'Paisajismo', '🌺', 'Diseño y construcción de jardines y paisajes', 50000, 200000, ARRAY['normal']::urgency_level[], '#10b981', 11),
('poda_arboles', 'Poda de Árboles', '🌳', 'Poda profesional y mantención de árboles', 25000, 80000, ARRAY['normal', 'urgente']::urgency_level[], '#16a34a', 12),

-- PAINTING & FINISHES
('pintor_interior', 'Pintor Interior', '🎨', 'Pintura de interiores residenciales y comerciales', 200, 800, ARRAY['normal']::urgency_level[], '#8b5cf6', 13),
('pintor_exterior', 'Pintor Exterior', '🏠', 'Pintura de fachadas y exteriores', 300, 900, ARRAY['normal']::urgency_level[], '#7c3aed', 14),
('empapelado', 'Empapelado', '📜', 'Instalación de papel mural y revestimientos', 8000, 25000, ARRAY['normal']::urgency_level[], '#a855f7', 15),

-- CARPENTRY & WOODWORK
('carpintero', 'Carpintero', '🔨', 'Fabricación y reparación de muebles y estructuras de madera', 25000, 100000, ARRAY['normal']::urgency_level[], '#6b7280', 16),
('carpintero_muebles', 'Carpintero de Muebles', '🪑', 'Fabricación de muebles a medida', 40000, 150000, ARRAY['normal']::urgency_level[], '#4b5563', 17),
('parquet', 'Especialista en Parquet', '🪵', 'Instalación y reparación de pisos de madera', 12000, 35000, ARRAY['normal']::urgency_level[], '#92400e', 18),

-- FLOORING SERVICES
('piso_flotante', 'Piso Flotante', '📐', 'Instalación de pisos laminados y flotantes', 8000, 25000, ARRAY['normal']::urgency_level[], '#a3a3a3', 19),
('ceramica', 'Ceramista', '🔲', 'Instalación de cerámicos y porcelanatos', 10000, 30000, ARRAY['normal']::urgency_level[], '#737373', 20),
('alfombra', 'Instalación de Alfombras', '🏠', 'Instalación y mantención de alfombras', 6000, 20000, ARRAY['normal']::urgency_level[], '#525252', 21),

-- CONSTRUCTION & RENOVATION
('constructor', 'Constructor', '🏗️', 'Construcción de obras menores y ampliaciones', 100000, 500000, ARRAY['normal']::urgency_level[], '#374151', 22),
('albanil', 'Albañil', '🧱', 'Trabajos de albañilería y construcción', 30000, 100000, ARRAY['normal']::urgency_level[], '#4b5563', 23),
('remodelacion', 'Remodelación', '🔄', 'Remodelaciones integrales de espacios', 150000, 800000, ARRAY['normal']::urgency_level[], '#1f2937', 24),

-- ROOFING & EXTERIORS
('techista', 'Techista', '🏠', 'Reparación e instalación de techos', 40000, 150000, ARRAY['normal', 'urgente']::urgency_level[], '#7f1d1d', 25),
('canal', 'Canaleta y Bajada', '🌧️', 'Instalación y limpieza de canaletas', 20000, 60000, ARRAY['normal', 'urgente']::urgency_level[], '#991b1b', 26),
('fachada', 'Especialista en Fachadas', '🏢', 'Reparación y mantención de fachadas', 50000, 200000, ARRAY['normal']::urgency_level[], '#b91c1c', 27),

-- APPLIANCE & TECH REPAIR
('tecnico_electrodomesticos', 'Técnico en Electrodomésticos', '📱', 'Reparación de lavadoras, refrigeradores y electrodomésticos', 20000, 75000, ARRAY['normal', 'urgente']::urgency_level[], '#2563eb', 28),
('tecnico_tv', 'Técnico en TV y Audio', '📺', 'Reparación de televisores y equipos de audio', 25000, 80000, ARRAY['normal']::urgency_level[], '#1d4ed8', 29),
('aire_acondicionado', 'Técnico A/A', '❄️', 'Instalación y reparación de aires acondicionados', 35000, 120000, ARRAY['normal', 'urgente']::urgency_level[], '#0284c7', 30),

-- SECURITY & LOCKSMITH
('cerrajero', 'Cerrajero', '🔐', 'Instalación y reparación de cerraduras y sistemas de seguridad', 15000, 60000, ARRAY['normal', 'urgente', 'emergencia']::urgency_level[], '#4b5563', 31),
('alarmas', 'Sistemas de Alarma', '🚨', 'Instalación de sistemas de seguridad y alarmas', 80000, 300000, ARRAY['normal']::urgency_level[], '#dc2626', 32),
('camaras', 'Cámaras de Seguridad', '📹', 'Instalación de sistemas de videovigilancia', 100000, 400000, ARRAY['normal']::urgency_level[], '#7f1d1d', 33),

-- PEST CONTROL & MAINTENANCE
('fumigacion', 'Fumigación', '🐛', 'Control de plagas y fumigación', 25000, 80000, ARRAY['normal', 'urgente']::urgency_level[], '#16a34a', 34),
('control_plagas', 'Control de Plagas', '🕷️', 'Eliminación de insectos y roedores', 20000, 70000, ARRAY['normal', 'urgente']::urgency_level[], '#15803d', 35),

-- MOVING & TRANSPORT
('fletes', 'Fletes y Mudanzas', '🚛', 'Servicios de mudanza y transporte', 30000, 150000, ARRAY['normal', 'urgente']::urgency_level[], '#ea580c', 36),
('bodegaje', 'Bodegaje', '📦', 'Servicios de almacenamiento temporal', 15000, 60000, ARRAY['normal']::urgency_level[], '#c2410c', 37),

-- SPECIALIZED SERVICES
('soldador', 'Soldador', '⚡', 'Trabajos de soldadura y metalurgia', 30000, 100000, ARRAY['normal']::urgency_level[], '#eab308', 38),
('vidrieria', 'Vidriería', '🪟', 'Instalación y reparación de vidrios', 15000, 60000, ARRAY['normal', 'urgente']::urgency_level[], '#0ea5e9', 39),
('tapiceria', 'Tapicería', '🛋️', 'Tapizado de muebles y reparaciones', 25000, 80000, ARRAY['normal']::urgency_level[], '#be185d', 40);

-- ============================================================================
-- PROJECT TYPES (Chilean Market Focused)
-- ============================================================================

INSERT INTO project_types (id, name, description, estimated_duration, avg_price_min, avg_price_max, complexity, icon, category, sort_order) VALUES
-- BATHROOM PROJECTS
('reparar_bano', 'Reparar Baño', 'Reparación de problemas en el baño: filtraciones, grifería, cerámicos', '1-3 días', 40000, 150000, 'medium', '🚿', 'interior', 1),
('renovar_bano', 'Renovar Baño Completo', 'Renovación integral de baño con nuevos sanitarios y terminaciones', '1-2 semanas', 800000, 3000000, 'complex', '🛁', 'interior', 2),
('cambiar_wc', 'Cambiar WC', 'Reemplazo de inodoro y conexiones', '2-4 horas', 80000, 200000, 'simple', '🚽', 'plumbing', 3),

-- KITCHEN PROJECTS
('renovar_cocina', 'Renovar Cocina', 'Renovación completa o parcial de cocina con muebles y electrodomésticos', '1-3 semanas', 1200000, 5000000, 'complex', '🍳', 'interior', 4),
('muebles_cocina', 'Muebles de Cocina', 'Fabricación e instalación de muebles de cocina a medida', '1-2 semanas', 600000, 2500000, 'medium', '🗄️', 'interior', 5),
('mesada_cocina', 'Mesada de Cocina', 'Instalación de mesada de granito, cuarzo o mármol', '1-2 días', 200000, 800000, 'medium', '🍽️', 'interior', 6),

-- PAINTING PROJECTS
('pintar_casa', 'Pintar Casa Completa', 'Pintura interior y exterior de vivienda completa', '1-2 semanas', 300000, 1200000, 'medium', '🏠', 'interior', 7),
('pintar_interior', 'Pintar Interior', 'Pintura de paredes interiores de una o más habitaciones', '2-5 días', 150000, 600000, 'simple', '🎨', 'interior', 8),
('pintar_fachada', 'Pintar Fachada', 'Pintura exterior de fachada con preparación de superficie', '3-7 días', 400000, 1000000, 'medium', '🏢', 'exterior', 9),

-- FLOORING PROJECTS
('instalar_piso', 'Instalar Piso', 'Instalación de piso flotante, laminado o cerámico', '2-5 días', 250000, 800000, 'medium', '📐', 'interior', 10),
('cambiar_alfombra', 'Cambiar Alfombra', 'Instalación de alfombra en dormitorios o living', '1 día', 80000, 300000, 'simple', '🏠', 'interior', 11),
('pulir_parquet', 'Pulir Parquet', 'Lijado, sellado y encerado de piso de parquet', '2-3 días', 180000, 500000, 'medium', '🪵', 'interior', 12),

-- ELECTRICAL PROJECTS
('instalar_luces', 'Instalar Luminarias', 'Instalación de lámparas, focos LED y sistemas de iluminación', '2-6 horas', 25000, 100000, 'simple', '💡', 'electrical', 13),
('cambiar_tablero', 'Cambiar Tablero Eléctrico', 'Reemplazo de tablero eléctrico y automáticos', '4-8 horas', 150000, 400000, 'medium', '⚡', 'electrical', 14),
('instalar_enchufe', 'Instalar Enchufes', 'Instalación de nuevos puntos de electricidad', '1-3 horas', 15000, 50000, 'simple', '🔌', 'electrical', 15),

-- PLUMBING PROJECTS
('reparar_filtracion', 'Reparar Filtración', 'Detección y reparación de filtraciones de agua', '2-8 horas', 30000, 120000, 'medium', '💧', 'plumbing', 16),
('cambiar_cañerias', 'Cambiar Cañerías', 'Reemplazo de cañerías de agua y desagüe', '3-7 días', 200000, 800000, 'complex', '🔧', 'plumbing', 17),
('instalar_calefont', 'Instalar Calefont', 'Instalación de calentador de agua a gas', '3-5 horas', 80000, 200000, 'medium', '🔥', 'plumbing', 18),

-- GARDEN & LANDSCAPING
('disenar_jardin', 'Diseñar Jardín', 'Diseño paisajístico y construcción de jardín', '1-3 semanas', 300000, 1500000, 'complex', '🌺', 'exterior', 19),
('mantener_jardin', 'Mantención de Jardín', 'Poda, riego y cuidado regular del jardín', '2-6 horas', 20000, 60000, 'simple', '🌱', 'exterior', 20),
('podar_arboles', 'Podar Árboles', 'Poda profesional de árboles grandes', '3-8 horas', 40000, 150000, 'medium', '🌳', 'exterior', 21),

-- ROOFING PROJECTS
('reparar_techo', 'Reparar Techo', 'Reparación de goteras y daños en techumbre', '1-3 días', 80000, 300000, 'medium', '🏠', 'exterior', 22),
('cambiar_tejas', 'Cambiar Tejas', 'Reemplazo de tejas dañadas o deterioradas', '2-5 días', 150000, 500000, 'medium', '🔴', 'exterior', 23),
('impermeabilizar', 'Impermeabilizar Techo', 'Aplicación de impermeabilizante en techos planos', '1-2 días', 100000, 300000, 'medium', '🛡️', 'exterior', 24),

-- CLEANING PROJECTS
('limpieza_profunda', 'Limpieza Profunda', 'Limpieza completa y detallada de toda la casa', '4-8 horas', 40000, 100000, 'simple', '✨', 'cleaning', 25),
('limpieza_mudanza', 'Limpieza de Mudanza', 'Limpieza especializada para entrega de casa', '6-10 horas', 60000, 150000, 'simple', '📦', 'cleaning', 26),
('limpieza_oficina', 'Limpieza de Oficina', 'Limpieza regular o profunda de espacios comerciales', '2-6 horas', 30000, 80000, 'simple', '🏢', 'cleaning', 27),

-- SECURITY PROJECTS
('instalar_alarma', 'Instalar Alarma', 'Instalación de sistema de alarma residencial', '4-8 horas', 150000, 500000, 'medium', '🚨', 'maintenance', 28),
('cambiar_cerraduras', 'Cambiar Cerraduras', 'Reemplazo de cerraduras de puertas principales', '1-3 horas', 30000, 100000, 'simple', '🔐', 'maintenance', 29),
('camaras_seguridad', 'Cámaras de Seguridad', 'Instalación de sistema de videovigilancia', '1 día', 200000, 800000, 'medium', '📹', 'maintenance', 30),

-- APPLIANCE PROJECTS
('reparar_lavadora', 'Reparar Lavadora', 'Diagnóstico y reparación de lavadoras', '1-3 horas', 30000, 100000, 'medium', '🧺', 'maintenance', 31),
('instalar_aire', 'Instalar Aire Acondicionado', 'Instalación de equipo de aire acondicionado', '4-8 horas', 200000, 600000, 'medium', '❄️', 'maintenance', 32),
('reparar_refrigerador', 'Reparar Refrigerador', 'Reparación de refrigeradores y congeladores', '1-3 horas', 35000, 120000, 'medium', '🧊', 'maintenance', 33),

-- CONSTRUCTION PROJECTS
('ampliar_casa', 'Ampliar Casa', 'Ampliación de vivienda con nuevas habitaciones', '2-8 semanas', 2000000, 10000000, 'complex', '🏗️', 'construction', 34),
('construir_quincho', 'Construir Quincho', 'Construcción de quincho o área de parrilla', '1-3 semanas', 800000, 3000000, 'complex', '🍖', 'construction', 35),
('rejas_ventanas', 'Instalar Rejas', 'Fabricación e instalación de rejas de seguridad', '1-2 días', 80000, 300000, 'medium', '🔒', 'construction', 36);

-- ============================================================================
-- PROJECT-SERVICE RELATIONSHIPS
-- ============================================================================

-- Bathroom Projects
INSERT INTO project_services (project_id, service_id, is_required) VALUES
('reparar_bano', 'gasfiter', true),
('reparar_bano', 'ceramica', false),
('reparar_bano', 'electricista', false),
('renovar_bano', 'gasfiter', true),
('renovar_bano', 'electricista', true),
('renovar_bano', 'ceramica', true),
('renovar_bano', 'pintor_interior', false),
('cambiar_wc', 'gasfiter', true),

-- Kitchen Projects
('renovar_cocina', 'carpintero_muebles', true),
('renovar_cocina', 'electricista', true),
('renovar_cocina', 'gasfiter', false),
('renovar_cocina', 'ceramica', false),
('muebles_cocina', 'carpintero_muebles', true),
('mesada_cocina', 'constructor', true),

-- Painting Projects
('pintar_casa', 'pintor_interior', true),
('pintar_casa', 'pintor_exterior', true),
('pintar_interior', 'pintor_interior', true),
('pintar_fachada', 'pintor_exterior', true),

-- Flooring Projects
('instalar_piso', 'piso_flotante', true),
('cambiar_alfombra', 'alfombra', true),
('pulir_parquet', 'parquet', true),

-- Electrical Projects
('instalar_luces', 'electricista', true),
('cambiar_tablero', 'electricista', true),
('instalar_enchufe', 'electricista', true),

-- Plumbing Projects
('reparar_filtracion', 'gasfiter', true),
('cambiar_cañerias', 'gasfiter', true),
('instalar_calefont', 'gasfiter', true),

-- Garden Projects
('disenar_jardin', 'paisajismo', true),
('mantener_jardin', 'jardineria', true),
('podar_arboles', 'poda_arboles', true),

-- Roofing Projects
('reparar_techo', 'techista', true),
('cambiar_tejas', 'techista', true),
('impermeabilizar', 'techista', true),

-- Cleaning Projects
('limpieza_profunda', 'limpieza_hogar', true),
('limpieza_mudanza', 'limpieza_construccion', true),
('limpieza_oficina', 'limpieza_oficina', true),

-- Security Projects
('instalar_alarma', 'alarmas', true),
('cambiar_cerraduras', 'cerrajero', true),
('camaras_seguridad', 'camaras', true),

-- Appliance Projects
('reparar_lavadora', 'tecnico_electrodomesticos', true),
('instalar_aire', 'aire_acondicionado', true),
('reparar_refrigerador', 'tecnico_electrodomesticos', true),

-- Construction Projects
('ampliar_casa', 'constructor', true),
('ampliar_casa', 'electricista', false),
('ampliar_casa', 'gasfiter', false),
('construir_quincho', 'constructor', true),
('rejas_ventanas', 'soldador', true);