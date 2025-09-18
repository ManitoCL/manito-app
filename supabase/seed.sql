-- Seed data for Manito development and testing

-- Additional service categories for Chilean market
INSERT INTO services (name, category, description) VALUES
  ('Técnico en Lavadoras', 'Electrodomésticos', 'Reparación de lavadoras y secadoras'),
  ('Instalador de TV y Audio', 'Electrónica', 'Instalación de televisores y sistemas de audio'),
  ('Fumigador', 'Control de Plagas', 'Control y eliminación de plagas'),
  ('Técnico en Calefont', 'Gas y Calefacción', 'Reparación e instalación de calefont'),
  ('Soldador', 'Soldadura', 'Trabajos de soldadura y metalurgia'),
  ('Albañil', 'Construcción', 'Trabajos de albañilería y construcción menor'),
  ('Tapicero', 'Tapicería', 'Reparación y tapizado de muebles'),
  ('Técnico en Portones Automáticos', 'Automatización', 'Instalación y reparación de portones automáticos'),
  ('Instalador de Pisos', 'Pisos', 'Instalación de cerámicos, parquet y alfombras'),
  ('Técnico en Alarmas', 'Seguridad', 'Instalación y mantención de sistemas de alarma');

-- Test users for development (these should be removed in production)
-- Note: These users need to be created through Supabase Auth, this is just for reference
/*
Test Consumer User:
- Email: consumer@test.com
- Phone: +56912345678
- User Type: consumer

Test Provider User:
- Email: provider@test.com  
- Phone: +56987654321
- User Type: provider
- Services: Electricista, Gasfitero
- Service Areas: Las Condes, Providencia, Ñuñoa
*/