-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  address_type USER-DEFINED DEFAULT 'home'::address_type,
  street text NOT NULL,
  city text NOT NULL,
  comuna text NOT NULL,
  region text NOT NULL,
  postal_code text,
  coordinates jsonb,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.project_services (
  project_id text NOT NULL,
  service_id text NOT NULL,
  is_required boolean DEFAULT true,
  CONSTRAINT project_services_pkey PRIMARY KEY (service_id, project_id),
  CONSTRAINT project_services_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_types(id),
  CONSTRAINT project_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.service_categories(id)
);
CREATE TABLE public.project_types (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  estimated_duration text,
  avg_price_min integer,
  avg_price_max integer,
  complexity USER-DEFINED DEFAULT 'medium'::complexity_level,
  icon text,
  category USER-DEFINED NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.provider_profiles (
  user_id uuid NOT NULL,
  business_name text,
  description text,
  services ARRAY DEFAULT '{}'::text[],
  service_areas ARRAY DEFAULT '{}'::text[],
  hourly_rate_clp integer CHECK (hourly_rate_clp IS NULL OR hourly_rate_clp > 0),
  verification_status USER-DEFINED DEFAULT 'pending'::verification_status,
  verification_documents jsonb DEFAULT '{}'::jsonb,
  background_check_status USER-DEFINED DEFAULT 'pending'::verification_status,
  is_available boolean DEFAULT true,
  rating numeric DEFAULT 0.00 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  total_reviews integer DEFAULT 0,
  total_jobs_completed integer DEFAULT 0,
  bank_account_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  business_name_search text,
  description_search text,
  specialties ARRAY DEFAULT '{}'::text[],
  response_time_hours integer DEFAULT 24,
  has_callout_fee boolean DEFAULT false,
  callout_fee_clp integer,
  min_job_value_clp integer,
  max_travel_distance_km integer DEFAULT 20,
  languages ARRAY DEFAULT '{Español}'::text[],
  certifications ARRAY DEFAULT '{}'::text[],
  is_available_today boolean DEFAULT true,
  working_hours jsonb DEFAULT '{"end": "18:00", "start": "08:00"}'::jsonb,
  coordinates point,
  search_vector tsvector,
  CONSTRAINT provider_profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT provider_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.provider_projects (
  provider_id uuid NOT NULL,
  project_id text NOT NULL,
  base_price_clp integer,
  can_provide_estimate boolean DEFAULT true,
  portfolio_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT provider_projects_pkey PRIMARY KEY (provider_id, project_id),
  CONSTRAINT provider_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_types(id),
  CONSTRAINT provider_projects_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(user_id)
);
CREATE TABLE public.provider_services (
  provider_id uuid NOT NULL,
  service_id text NOT NULL,
  hourly_rate_clp integer,
  fixed_rate_clp integer,
  experience_years integer DEFAULT 0,
  is_primary_service boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT provider_services_pkey PRIMARY KEY (service_id, provider_id),
  CONSTRAINT provider_services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(user_id),
  CONSTRAINT provider_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.service_categories(id)
);
CREATE TABLE public.search_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  search_type text NOT NULL,
  search_key text NOT NULL,
  location_key text,
  filters_hash text,
  provider_ids ARRAY,
  result_count integer,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '01:00:00'::interval),
  CONSTRAINT search_cache_pkey PRIMARY KEY (id)
);
CREATE TABLE public.service_categories (
  id text NOT NULL,
  name text NOT NULL,
  icon text,
  description text,
  avg_price_min integer,
  avg_price_max integer,
  urgency_levels ARRAY DEFAULT '{}'::urgency_level[],
  color text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT service_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  icon_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  phone_number text UNIQUE CHECK (phone_number IS NULL OR phone_number ~* '^\+56[0-9]{8,9}$'::text),
  full_name text NOT NULL,
  user_type USER-DEFINED NOT NULL DEFAULT 'consumer'::user_type,
  avatar_url text,
  is_verified boolean DEFAULT false,
  email_verified_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  rut_number text CHECK (rut_number IS NULL OR rut_number ~* '^[0-9]{7,8}-[0-9kK]{1}$'::text),
  rut_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_seen_at timestamp with time zone DEFAULT now(),
  display_name character varying,
  whatsapp_number character varying CHECK (whatsapp_number IS NULL OR whatsapp_number::text ~* '^\+56[0-9]{8,9}$'::text),
  is_suspended boolean DEFAULT false,
  suspension_reason text,
  notification_preferences jsonb DEFAULT '{"sms": false, "push": true, "email": true, "whatsapp": false}'::jsonb,
  privacy_settings jsonb DEFAULT '{"show_email": false, "show_phone": false, "show_last_seen": true}'::jsonb,
  registration_source character varying,
  referral_code character varying UNIQUE,
  referred_by_id uuid,
  preferred_language character varying DEFAULT 'es'::character varying,
  timezone character varying DEFAULT 'America/Santiago'::character varying,
  last_active_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_referred_by_id_fkey FOREIGN KEY (referred_by_id) REFERENCES public.users(id)
);