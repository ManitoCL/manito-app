-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_type AS ENUM ('consumer', 'provider');
CREATE TYPE verification_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');
CREATE TYPE address_type AS ENUM ('home', 'work', 'other');

-- Users table (consumers and providers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  user_type user_type NOT NULL DEFAULT 'consumer',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  rut_number TEXT, -- Chilean RUT (Rol Único Tributario)
  rut_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_chilean_phone CHECK (phone_number IS NULL OR phone_number ~* '^\+56[0-9]{8,9}$'),
  CONSTRAINT valid_rut CHECK (rut_number IS NULL OR rut_number ~* '^[0-9]{7,8}-[0-9kK]{1}$')
);

-- Provider profiles (extends users table for providers)
CREATE TABLE provider_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  description TEXT,
  services TEXT[] DEFAULT '{}', -- Array of service types
  service_areas TEXT[] DEFAULT '{}', -- Array of Chilean comunas/regions
  hourly_rate_clp INTEGER, -- Chilean pesos
  verification_status verification_status DEFAULT 'pending',
  verification_documents JSONB DEFAULT '{}', -- Store document URLs and metadata
  background_check_status verification_status DEFAULT 'pending',
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  bank_account_info JSONB DEFAULT '{}', -- Encrypted bank details for payouts
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT valid_hourly_rate CHECK (hourly_rate_clp IS NULL OR hourly_rate_clp > 0)
);

-- Addresses table (for saved consumer addresses)
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_type address_type DEFAULT 'home',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  comuna TEXT NOT NULL, -- Chilean administrative division
  region TEXT NOT NULL, -- Chilean region
  postal_code TEXT,
  coordinates JSONB, -- {lat: number, lng: number}
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services catalog
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_provider_profiles_verification_status ON provider_profiles(verification_status);
CREATE INDEX idx_provider_profiles_services ON provider_profiles USING GIN(services);
CREATE INDEX idx_provider_profiles_service_areas ON provider_profiles USING GIN(service_areas);
CREATE INDEX idx_provider_profiles_rating ON provider_profiles(rating DESC);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_comuna ON addresses(comuna);
CREATE INDEX idx_services_category ON services(category);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view provider profiles (public info only)" ON users
  FOR SELECT USING (user_type = 'provider');

-- Provider profiles policies
CREATE POLICY "Providers can view their own profile" ON provider_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Providers can update their own profile" ON provider_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved provider profiles" ON provider_profiles
  FOR SELECT USING (verification_status = 'approved');

-- Addresses policies
CREATE POLICY "Users can manage their own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- Services policies (public read-only)
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = TRUE);

-- Functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create provider profile when user becomes provider
CREATE OR REPLACE FUNCTION create_provider_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_type = 'provider' AND OLD.user_type = 'consumer' THEN
    INSERT INTO provider_profiles (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_provider_profile_trigger AFTER UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION create_provider_profile();

-- Function to validate RUT (Chilean ID)
CREATE OR REPLACE FUNCTION validate_rut(rut TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  clean_rut TEXT;
  digits TEXT;
  check_digit TEXT;
  sum_val INTEGER := 0;
  multiplier INTEGER := 2;
  calculated_check TEXT;
BEGIN
  -- Clean and validate format
  clean_rut := UPPER(REPLACE(rut, '-', ''));
  IF LENGTH(clean_rut) < 8 OR LENGTH(clean_rut) > 9 THEN
    RETURN FALSE;
  END IF;
  
  digits := SUBSTRING(clean_rut FROM 1 FOR LENGTH(clean_rut) - 1);
  check_digit := RIGHT(clean_rut, 1);
  
  -- Calculate check digit
  FOR i IN REVERSE LENGTH(digits)..1 LOOP
    sum_val := sum_val + (SUBSTRING(digits FROM i FOR 1)::INTEGER * multiplier);
    multiplier := CASE WHEN multiplier = 7 THEN 2 ELSE multiplier + 1 END;
  END LOOP;
  
  calculated_check := CASE 
    WHEN (11 - (sum_val % 11)) = 11 THEN '0'
    WHEN (11 - (sum_val % 11)) = 10 THEN 'K'
    ELSE (11 - (sum_val % 11))::TEXT
  END;
  
  RETURN calculated_check = check_digit;
END;
$$ language 'plpgsql';

-- Insert initial service categories
INSERT INTO services (name, category, description) VALUES
  ('Electricista', 'Electricidad', 'Instalación y reparación eléctrica'),
  ('Gasfitero', 'Plomería', 'Reparación e instalación de cañerías'),
  ('Técnico en Refrigeración', 'Electrodomésticos', 'Reparación de refrigeradores y aires acondicionados'),
  ('Cerrajero', 'Seguridad', 'Instalación y reparación de cerraduras'),
  ('Jardinero', 'Jardín', 'Mantención y diseño de jardines'),
  ('Limpieza del Hogar', 'Limpieza', 'Servicio de limpieza doméstica'),
  ('Pintor', 'Pintura', 'Pintura interior y exterior'),
  ('Carpintero', 'Carpintería', 'Muebles y reparaciones de madera');

-- Add comments for documentation
COMMENT ON TABLE users IS 'Main users table supporting both consumers and service providers';
COMMENT ON TABLE provider_profiles IS 'Extended profile information for service providers';
COMMENT ON TABLE addresses IS 'Saved addresses for consumers';
COMMENT ON TABLE services IS 'Catalog of available home services';
COMMENT ON FUNCTION validate_rut(TEXT) IS 'Validates Chilean RUT format and check digit';