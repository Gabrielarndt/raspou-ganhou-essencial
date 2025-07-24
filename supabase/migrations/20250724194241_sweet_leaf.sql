/*
  # Create affiliates table

  1. New Tables
    - `affiliates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password` (text)
      - `affiliate_code` (text, unique)
      - `cpa` (decimal)
      - `commission_rate` (decimal)
      - `referrals` (integer, default 0)
      - `volume_generated` (decimal, default 0)
      - `total_commission` (decimal, default 0)
      - `conversion_rate` (decimal, default 0)
      - `notifications` (jsonb)
      - `security` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `affiliates` table
    - Add policy for affiliates to read/update their own data
    - Add policy for admins to manage affiliates
*/

CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  affiliate_code text UNIQUE NOT NULL,
  cpa decimal(10,2) DEFAULT 0.00,
  commission_rate decimal(5,2) DEFAULT 0.00,
  referrals integer DEFAULT 0,
  volume_generated decimal(12,2) DEFAULT 0.00,
  total_commission decimal(10,2) DEFAULT 0.00,
  conversion_rate decimal(5,2) DEFAULT 0.00,
  notifications jsonb DEFAULT '{
    "newConversions": true,
    "newDeposits": true,
    "commissionChanges": true,
    "frequency": "realtime"
  }'::jsonb,
  security jsonb DEFAULT '{
    "twoFactor": false,
    "lastAccess": null
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can read own data"
  ON affiliates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Affiliates can update own data"
  ON affiliates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage affiliates"
  ON affiliates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_created_at ON affiliates(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_affiliates_updated_at 
  BEFORE UPDATE ON affiliates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar código de afiliado único
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := 'AFF' || LPAD(floor(random() * 999999)::text, 6, '0');
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE affiliate_code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;