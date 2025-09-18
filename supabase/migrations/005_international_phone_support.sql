-- Add support for international phone numbers
-- Remove Chilean-only phone constraint and add international support

-- Drop the existing Chilean phone constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_chilean_phone;

-- Add international phone constraint (supports +1 to +999 country codes)
ALTER TABLE users ADD CONSTRAINT valid_international_phone 
  CHECK (phone_number IS NULL OR phone_number ~* '^\+[1-9][0-9]{1,3}[0-9]{6,14}$');

-- Add country code field for better tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Add index for country code queries
CREATE INDEX IF NOT EXISTS idx_users_country_code ON users(country_code);

-- Update comments
COMMENT ON COLUMN users.phone_number IS 'International phone number in E.164 format (e.g., +56912345678, +12345678901)';
COMMENT ON COLUMN users.country_code IS 'ISO 3166-1 alpha-2 country code (e.g., CL, US, AR)';

-- Function to extract country code from phone number
CREATE OR REPLACE FUNCTION get_country_from_phone(phone_number TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple mapping of common country codes
  -- Chile
  IF phone_number LIKE '+56%' THEN RETURN 'CL'; END IF;
  -- USA/Canada  
  IF phone_number LIKE '+1%' THEN RETURN 'US'; END IF;
  -- Argentina
  IF phone_number LIKE '+54%' THEN RETURN 'AR'; END IF;
  -- Brazil
  IF phone_number LIKE '+55%' THEN RETURN 'BR'; END IF;
  -- Colombia
  IF phone_number LIKE '+57%' THEN RETURN 'CO'; END IF;
  -- Mexico
  IF phone_number LIKE '+52%' THEN RETURN 'MX'; END IF;
  -- Peru
  IF phone_number LIKE '+51%' THEN RETURN 'PE'; END IF;
  -- Spain
  IF phone_number LIKE '+34%' THEN RETURN 'ES'; END IF;
  -- UK
  IF phone_number LIKE '+44%' THEN RETURN 'GB'; END IF;
  -- Germany
  IF phone_number LIKE '+49%' THEN RETURN 'DE'; END IF;
  -- France
  IF phone_number LIKE '+33%' THEN RETURN 'FR'; END IF;
  -- Italy
  IF phone_number LIKE '+39%' THEN RETURN 'IT'; END IF;
  -- Australia
  IF phone_number LIKE '+61%' THEN RETURN 'AU'; END IF;
  
  -- Default to unknown
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing users with country codes based on phone numbers
UPDATE users 
SET country_code = get_country_from_phone(phone_number) 
WHERE phone_number IS NOT NULL AND country_code IS NULL;

-- Create trigger to auto-set country code from phone number
CREATE OR REPLACE FUNCTION set_country_code_from_phone()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if phone_number changed and country_code is not manually set
  IF NEW.phone_number IS NOT NULL AND NEW.phone_number != COALESCE(OLD.phone_number, '') THEN
    NEW.country_code = COALESCE(NEW.country_code, get_country_from_phone(NEW.phone_number));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_country_code_trigger ON users;
CREATE TRIGGER set_country_code_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_country_code_from_phone();

-- Add some useful views for analytics
CREATE OR REPLACE VIEW user_countries AS
SELECT 
  country_code,
  COUNT(*) as user_count,
  COUNT(CASE WHEN user_type = 'provider' THEN 1 END) as provider_count,
  COUNT(CASE WHEN user_type = 'consumer' THEN 1 END) as consumer_count
FROM users 
WHERE country_code IS NOT NULL
GROUP BY country_code
ORDER BY user_count DESC;

COMMENT ON VIEW user_countries IS 'Summary of users by country for analytics';

-- Grant access to the view
GRANT SELECT ON user_countries TO authenticated;