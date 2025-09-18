-- ========================================
-- MANITO MARKETPLACE SCHEMA OPTIMIZATION
-- ========================================
-- This migration optimizes the Supabase schema for the Chilean home services marketplace
-- Addresses: missing tables, security, performance, Chilean compliance, data integrity

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- 1. CREATE NEW ENUM TYPES
-- ========================================

CREATE TYPE booking_status AS ENUM (
  'pending',           -- Customer created booking request
  'accepted',          -- Provider accepted the job
  'confirmed',         -- Payment escrowed, job confirmed
  'in_progress',       -- Provider started work
  'completed',         -- Work finished, awaiting customer confirmation
  'payment_released',  -- Payment released to provider
  'cancelled',         -- Booking cancelled
  'disputed'           -- In dispute resolution
);

CREATE TYPE payment_status AS ENUM (
  'pending',           -- Payment initiated
  'authorized',        -- Card authorized, funds held
  'captured',          -- Funds captured for escrow
  'released',          -- Released to provider
  'refunded',          -- Refunded to customer
  'failed'             -- Payment failed
);

CREATE TYPE payment_method AS ENUM (
  'credit_card',       -- Credit/debit card
  'bank_transfer',     -- Chilean bank transfer
  'transbank',         -- Transbank WebPay
  'mercadopago',       -- MercadoPago
  'klarna'             -- Buy now, pay later
);

CREATE TYPE notification_type AS ENUM (
  'booking_request',
  'booking_accepted',
  'booking_cancelled',
  'payment_received',
  'job_completed',
  'review_received',
  'message_received',
  'verification_approved',
  'verification_rejected',
  'dispute_opened'
);

CREATE TYPE dispute_status AS ENUM (
  'open',
  'investigating',
  'resolved',
  'closed'
);

-- ========================================
-- 2. CHILEAN REGIONS & COMUNAS REFERENCE
-- ========================================

CREATE TABLE chilean_regions (
  id SMALLINT PRIMARY KEY,
  name TEXT NOT NULL,
  roman_numeral TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  capital TEXT NOT NULL
);

CREATE TABLE chilean_comunas (
  id SMALLINT PRIMARY KEY,
  name TEXT NOT NULL,
  region_id SMALLINT NOT NULL REFERENCES chilean_regions(id),
  province TEXT NOT NULL
);

-- ========================================
-- 3. CORE MARKETPLACE TABLES
-- ========================================

-- Service requests/quotes table
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address_id UUID NOT NULL REFERENCES addresses(id),
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  budget_min_clp INTEGER,
  budget_max_clp INTEGER,
  is_urgent BOOLEAN DEFAULT FALSE,
  requires_materials BOOLEAN DEFAULT FALSE,
  photos TEXT[] DEFAULT '{}', -- Array of image URLs
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'quoted', 'booked', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_budget CHECK (budget_min_clp IS NULL OR budget_max_clp IS NULL OR budget_min_clp <= budget_max_clp),
  CONSTRAINT valid_time_range CHECK (preferred_time_start IS NULL OR preferred_time_end IS NULL OR preferred_time_start < preferred_time_end)
);

-- Provider quotes for service requests
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price_clp INTEGER NOT NULL,
  message TEXT,
  estimated_duration_hours DECIMAL(4,2),
  includes_materials BOOLEAN DEFAULT FALSE,
  materials_cost_clp INTEGER DEFAULT 0,
  availability_date DATE NOT NULL,
  availability_time_start TIME NOT NULL,
  availability_time_end TIME NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_price CHECK (price_clp > 0),
  CONSTRAINT valid_duration CHECK (estimated_duration_hours > 0),
  CONSTRAINT unique_provider_per_request UNIQUE (service_request_id, provider_id)
);

-- Main bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id),
  quote_id UUID REFERENCES quotes(id),
  service_request_id UUID REFERENCES service_requests(id),

  -- Booking details
  title TEXT NOT NULL,
  description TEXT,
  address_id UUID NOT NULL REFERENCES addresses(id),
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME NOT NULL,
  scheduled_time_end TIME NOT NULL,

  -- Pricing
  service_price_clp INTEGER NOT NULL,
  materials_cost_clp INTEGER DEFAULT 0,
  platform_fee_clp INTEGER NOT NULL,
  total_price_clp INTEGER NOT NULL,

  -- Status and metadata
  status booking_status DEFAULT 'pending',
  customer_notes TEXT,
  provider_notes TEXT,
  completion_photos TEXT[] DEFAULT '{}',

  -- Timestamps
  accepted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_total_price CHECK (total_price_clp = service_price_clp + materials_cost_clp + platform_fee_clp),
  CONSTRAINT valid_prices CHECK (service_price_clp > 0 AND platform_fee_clp >= 0),
  CONSTRAINT valid_time_range CHECK (scheduled_time_start < scheduled_time_end),
  CONSTRAINT valid_dates CHECK (scheduled_date >= CURRENT_DATE)
);

-- Payments and escrow table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Payment details
  amount_clp INTEGER NOT NULL,
  platform_fee_clp INTEGER NOT NULL,
  provider_amount_clp INTEGER NOT NULL, -- Amount after platform fee
  payment_method payment_method NOT NULL,

  -- External payment references
  external_payment_id TEXT, -- Transbank, MercadoPago transaction ID
  external_authorization_code TEXT,

  -- Status tracking
  status payment_status DEFAULT 'pending',
  authorized_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_amounts CHECK (
    amount_clp > 0 AND
    platform_fee_clp >= 0 AND
    provider_amount_clp > 0 AND
    amount_clp = provider_amount_clp + platform_fee_clp
  )
);

-- Reviews and ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Review content
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  photos TEXT[] DEFAULT '{}',

  -- Review aspects for providers
  quality_rating SMALLINT CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)),
  punctuality_rating SMALLINT CHECK (punctuality_rating IS NULL OR (punctuality_rating >= 1 AND punctuality_rating <= 5)),
  communication_rating SMALLINT CHECK (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 5)),
  value_rating SMALLINT CHECK (value_rating IS NULL OR (value_rating >= 1 AND value_rating <= 5)),

  -- Metadata
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_review_per_booking UNIQUE (booking_id, reviewer_id),
  CONSTRAINT no_self_review CHECK (reviewer_id != reviewee_id)
);

-- Messages for in-app chat
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Message content
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}', -- Image/document URLs
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'system')),

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT no_self_message CHECK (sender_id != recipient_id),
  CONSTRAINT valid_content CHECK (TRIM(content) != '' OR array_length(attachments, 1) > 0)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Related entities
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Delivery
  sent_push BOOLEAN DEFAULT FALSE,
  sent_email BOOLEAN DEFAULT FALSE,
  sent_sms BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Disputes
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  complainant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  respondent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Dispute details
  category TEXT NOT NULL CHECK (category IN (
    'payment_issue', 'service_quality', 'no_show', 'cancellation',
    'damage_claim', 'overcharge', 'other'
  )),
  description TEXT NOT NULL,
  evidence_files TEXT[] DEFAULT '{}',
  requested_resolution TEXT,

  -- Admin handling
  admin_id UUID REFERENCES users(id),
  admin_notes TEXT,
  resolution_notes TEXT,

  status dispute_status DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 4. OPTIMIZE EXISTING TABLES
-- ========================================

-- Add missing constraints to users table
ALTER TABLE users ADD CONSTRAINT unique_rut_number UNIQUE (rut_number)
  DEFERRABLE INITIALLY DEFERRED;

-- Add RUT validation as a constraint
ALTER TABLE users ADD CONSTRAINT valid_rut_format
  CHECK (rut_number IS NULL OR validate_rut(rut_number));

-- Fix provider_profiles constraints
ALTER TABLE provider_profiles
  ADD CONSTRAINT valid_services_array CHECK (
    array_length(services, 1) IS NULL OR array_length(services, 1) > 0
  ),
  ADD CONSTRAINT valid_service_areas CHECK (
    array_length(service_areas, 1) IS NULL OR array_length(service_areas, 1) > 0
  );

-- Add unique constraint for default addresses
CREATE UNIQUE INDEX unique_default_address_per_user
  ON addresses (user_id)
  WHERE is_default = true;

-- ========================================
-- 5. PERFORMANCE INDEXES
-- ========================================

-- Users table indexes (additional)
CREATE INDEX idx_users_rut_number ON users(rut_number) WHERE rut_number IS NOT NULL;
CREATE INDEX idx_users_is_verified ON users(is_verified);
CREATE INDEX idx_users_last_seen_at ON users(last_seen_at);

-- Provider profiles indexes (additional)
CREATE INDEX idx_provider_profiles_available_verified ON provider_profiles(is_available, verification_status)
  WHERE is_available = true AND verification_status = 'approved';
CREATE INDEX idx_provider_profiles_location ON provider_profiles USING GIN(service_areas);
CREATE INDEX idx_provider_profiles_jobs_rating ON provider_profiles(total_jobs_completed DESC, rating DESC);

-- Addresses geospatial index
-- Create coordinate index using btree instead of gist for better compatibility
CREATE INDEX idx_addresses_coordinates_lat ON addresses (((coordinates->>'lat')::float8));
CREATE INDEX idx_addresses_coordinates_lng ON addresses (((coordinates->>'lng')::float8));

-- Service requests indexes
CREATE INDEX idx_service_requests_status_date ON service_requests(status, created_at DESC);
CREATE INDEX idx_service_requests_service_location ON service_requests(service_id, address_id);
CREATE INDEX idx_service_requests_budget ON service_requests(budget_min_clp, budget_max_clp)
  WHERE status = 'open';
CREATE INDEX idx_service_requests_customer ON service_requests(customer_id, created_at DESC);

-- Quotes indexes
CREATE INDEX idx_quotes_request_status ON quotes(service_request_id, status);
CREATE INDEX idx_quotes_provider_date ON quotes(provider_id, created_at DESC);
CREATE INDEX idx_quotes_price ON quotes(price_clp);

-- Bookings indexes
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, status);
CREATE INDEX idx_bookings_provider_status ON bookings(provider_id, status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date, scheduled_time_start);
CREATE INDEX idx_bookings_status_updated ON bookings(status, updated_at);
CREATE INDEX idx_bookings_service_date ON bookings(service_id, scheduled_date);

-- Payments indexes
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_customer ON payments(customer_id, created_at DESC);
CREATE INDEX idx_payments_provider ON payments(provider_id, status);
CREATE INDEX idx_payments_external_id ON payments(external_payment_id) WHERE external_payment_id IS NOT NULL;

-- Reviews indexes
CREATE INDEX idx_reviews_reviewee_rating ON reviews(reviewee_id, rating DESC, created_at DESC);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_reviews_public_featured ON reviews(is_public, is_featured, created_at DESC)
  WHERE is_public = true;

-- Messages indexes
CREATE INDEX idx_messages_booking_created ON messages(booking_id, created_at);
CREATE INDEX idx_messages_recipient_unread ON messages(recipient_id, is_read, created_at DESC)
  WHERE is_read = false;
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type, created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_services_name_trgm ON services USING GIN (name gin_trgm_ops);
CREATE INDEX idx_service_requests_title_description_trgm ON service_requests
  USING GIN ((title || ' ' || description) gin_trgm_ops);

-- ========================================
-- 6. ENHANCED RLS POLICIES
-- ========================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view provider profiles (public info only)" ON users;

-- Create secure user policies
CREATE POLICY "Users can view public provider info only" ON users
  FOR SELECT USING (
    CASE
      WHEN auth.uid() = id THEN true  -- Own profile
      WHEN user_type = 'provider' THEN true  -- Public provider info
      ELSE false
    END
  );

-- Enhanced provider profiles policies
DROP POLICY IF EXISTS "Anyone can view approved provider profiles" ON provider_profiles;

CREATE POLICY "Public can view approved provider profiles" ON provider_profiles
  FOR SELECT USING (verification_status = 'approved');

CREATE POLICY "Providers can insert their own profile" ON provider_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service requests policies
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can manage their own service requests" ON service_requests
  FOR ALL USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view open service requests" ON service_requests
  FOR SELECT USING (status = 'open');

-- Quotes policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own quotes" ON quotes
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Customers can view quotes for their requests" ON quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = quotes.service_request_id
      AND sr.customer_id = auth.uid()
    )
  );

-- Bookings policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants can view and update" ON bookings
  FOR ALL USING (auth.uid() IN (customer_id, provider_id));

-- Payments policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payment participants can view" ON payments
  FOR SELECT USING (auth.uid() IN (customer_id, provider_id));

-- Reviews policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public reviews" ON reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own reviews" ON reviews
  FOR ALL USING (auth.uid() = reviewer_id);

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Message participants can manage messages" ON messages
  FOR ALL USING (auth.uid() IN (sender_id, recipient_id));

-- Notifications policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Disputes policies
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dispute participants can view" ON disputes
  FOR SELECT USING (auth.uid() IN (complainant_id, respondent_id));

CREATE POLICY "Users can create disputes for their bookings" ON disputes
  FOR INSERT WITH CHECK (
    auth.uid() = complainant_id AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id
      AND auth.uid() IN (b.customer_id, b.provider_id)
    )
  );

-- Reference tables (public read-only)
ALTER TABLE chilean_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chilean_comunas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view Chilean regions" ON chilean_regions FOR SELECT USING (true);
CREATE POLICY "Anyone can view Chilean comunas" ON chilean_comunas FOR SELECT USING (true);

-- ========================================
-- 7. TRIGGERS AND FUNCTIONS
-- ========================================

-- Update ratings when reviews are added/updated
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  provider_id UUID;
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  -- Get provider ID from the review
  IF TG_OP = 'DELETE' THEN
    provider_id := OLD.reviewee_id;
  ELSE
    provider_id := NEW.reviewee_id;
  END IF;

  -- Calculate new average rating and count
  SELECT
    COALESCE(AVG(rating), 0)::DECIMAL(3,2),
    COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE reviewee_id = provider_id
  AND is_public = true;

  -- Update provider profile
  UPDATE provider_profiles
  SET
    rating = avg_rating,
    total_reviews = review_count,
    updated_at = NOW()
  WHERE user_id = provider_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_provider_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- Update job completion count
CREATE OR REPLACE FUNCTION update_job_completion_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'payment_released' AND (OLD.status IS NULL OR OLD.status != 'payment_released') THEN
    UPDATE provider_profiles
    SET
      total_jobs_completed = total_jobs_completed + 1,
      updated_at = NOW()
    WHERE user_id = NEW.provider_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_completion
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_job_completion_count();

-- Create notification on booking events
CREATE OR REPLACE FUNCTION create_booking_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- New booking request
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, type, title, message, booking_id)
    VALUES (
      NEW.provider_id,
      'booking_request',
      'Nueva solicitud de servicio',
      'Tienes una nueva solicitud de servicio pendiente',
      NEW.id
    );
  -- Status changes
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'accepted' THEN
        INSERT INTO notifications (user_id, type, title, message, booking_id)
        VALUES (
          NEW.customer_id,
          'booking_accepted',
          'Servicio aceptado',
          'Tu solicitud de servicio ha sido aceptada',
          NEW.id
        );
      WHEN 'completed' THEN
        INSERT INTO notifications (user_id, type, title, message, booking_id)
        VALUES (
          NEW.customer_id,
          'job_completed',
          'Servicio completado',
          'El proveedor ha marcado el servicio como completado',
          NEW.id
        );
      WHEN 'cancelled' THEN
        INSERT INTO notifications (user_id, type, title, message, booking_id)
        VALUES (
          CASE WHEN OLD.status = 'pending' THEN NEW.provider_id ELSE NEW.customer_id END,
          'booking_cancelled',
          'Servicio cancelado',
          'El servicio ha sido cancelado',
          NEW.id
        );
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_booking_notifications
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION create_booking_notifications();

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. CHILEAN DATA
-- ========================================

-- Insert Chilean regions
INSERT INTO chilean_regions (id, name, roman_numeral, abbreviation, capital) VALUES
  (1, 'Tarapacá', 'I', 'TA', 'Iquique'),
  (2, 'Antofagasta', 'II', 'AN', 'Antofagasta'),
  (3, 'Atacama', 'III', 'AT', 'Copiapó'),
  (4, 'Coquimbo', 'IV', 'CO', 'La Serena'),
  (5, 'Valparaíso', 'V', 'VA', 'Valparaíso'),
  (6, 'Región del Libertador General Bernardo O''Higgins', 'VI', 'LI', 'Rancagua'),
  (7, 'Región del Maule', 'VII', 'ML', 'Talca'),
  (8, 'Región del Biobío', 'VIII', 'BI', 'Concepción'),
  (9, 'Región de la Araucanía', 'IX', 'AR', 'Temuco'),
  (10, 'Región de Los Lagos', 'X', 'LL', 'Puerto Montt'),
  (11, 'Región Aysén del General Carlos Ibáñez del Campo', 'XI', 'AI', 'Coihaique'),
  (12, 'Región de Magallanes y de la Antártica Chilena', 'XII', 'MA', 'Punta Arenas'),
  (13, 'Región Metropolitana de Santiago', 'RM', 'RM', 'Santiago'),
  (14, 'Región de Los Ríos', 'XIV', 'LR', 'Valdivia'),
  (15, 'Región de Arica y Parinacota', 'XV', 'AP', 'Arica'),
  (16, 'Región de Ñuble', 'XVI', 'NB', 'Chillán');

-- Insert key Chilean comunas (focusing on Santiago for MVP)
INSERT INTO chilean_comunas (id, name, region_id, province) VALUES
  -- Santiago Metropolitan Region (MVP focus)
  (13101, 'Santiago', 13, 'Santiago'),
  (13102, 'Cerrillos', 13, 'Santiago'),
  (13103, 'Cerro Navia', 13, 'Santiago'),
  (13104, 'Conchalí', 13, 'Santiago'),
  (13105, 'El Bosque', 13, 'Santiago'),
  (13106, 'Estación Central', 13, 'Santiago'),
  (13107, 'Huechuraba', 13, 'Santiago'),
  (13108, 'Independencia', 13, 'Santiago'),
  (13109, 'La Cisterna', 13, 'Santiago'),
  (13110, 'La Florida', 13, 'Santiago'),
  (13111, 'La Granja', 13, 'Santiago'),
  (13112, 'La Pintana', 13, 'Santiago'),
  (13113, 'La Reina', 13, 'Santiago'),
  (13114, 'Las Condes', 13, 'Santiago'),
  (13115, 'Lo Barnechea', 13, 'Santiago'),
  (13116, 'Lo Espejo', 13, 'Santiago'),
  (13117, 'Lo Prado', 13, 'Santiago'),
  (13118, 'Macul', 13, 'Santiago'),
  (13119, 'Maipú', 13, 'Santiago'),
  (13120, 'Ñuñoa', 13, 'Santiago'),
  (13121, 'Pedro Aguirre Cerda', 13, 'Santiago'),
  (13122, 'Peñalolén', 13, 'Santiago'),
  (13123, 'Providencia', 13, 'Santiago'),
  (13124, 'Pudahuel', 13, 'Santiago'),
  (13125, 'Quilicura', 13, 'Santiago'),
  (13126, 'Quinta Normal', 13, 'Santiago'),
  (13127, 'Recoleta', 13, 'Santiago'),
  (13128, 'Renca', 13, 'Santiago'),
  (13129, 'San Joaquín', 13, 'Santiago'),
  (13130, 'San Miguel', 13, 'Santiago'),
  (13131, 'San Ramón', 13, 'Santiago'),
  (13132, 'Vitacura', 13, 'Santiago');

-- ========================================
-- 9. ADMIN FUNCTIONS
-- ========================================

-- Function to get marketplace statistics
CREATE OR REPLACE FUNCTION get_marketplace_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'total_consumers', (SELECT COUNT(*) FROM users WHERE user_type = 'consumer'),
    'total_providers', (SELECT COUNT(*) FROM users WHERE user_type = 'provider'),
    'verified_providers', (SELECT COUNT(*) FROM provider_profiles WHERE verification_status = 'approved'),
    'pending_verification', (SELECT COUNT(*) FROM provider_profiles WHERE verification_status = 'pending'),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'active_bookings', (SELECT COUNT(*) FROM bookings WHERE status IN ('accepted', 'confirmed', 'in_progress')),
    'completed_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'payment_released'),
    'total_revenue_clp', (SELECT COALESCE(SUM(platform_fee_clp), 0) FROM payments WHERE status = 'released'),
    'avg_rating', (SELECT COALESCE(AVG(rating), 0) FROM provider_profiles WHERE total_reviews > 0)
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users (admin panel can check user role)
GRANT EXECUTE ON FUNCTION get_marketplace_stats TO authenticated;

-- ========================================
-- 10. COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE service_requests IS 'Customer requests for services, providers can quote on these';
COMMENT ON TABLE quotes IS 'Provider quotes/bids for service requests';
COMMENT ON TABLE bookings IS 'Main marketplace transactions - confirmed service bookings';
COMMENT ON TABLE payments IS 'Payment processing and escrow management';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for completed services';
COMMENT ON TABLE messages IS 'In-app messaging between customers and providers';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE disputes IS 'Dispute resolution for problematic transactions';
COMMENT ON TABLE chilean_regions IS 'Chilean administrative regions for geographic filtering';
COMMENT ON TABLE chilean_comunas IS 'Chilean comunas (municipalities) for precise location matching';

COMMENT ON FUNCTION get_marketplace_stats() IS 'Returns key marketplace metrics for admin dashboard';
COMMENT ON FUNCTION update_provider_rating() IS 'Automatically updates provider rating when reviews change';
COMMENT ON FUNCTION update_job_completion_count() IS 'Tracks completed jobs for provider statistics';
COMMENT ON FUNCTION create_booking_notifications() IS 'Creates notifications for booking status changes';