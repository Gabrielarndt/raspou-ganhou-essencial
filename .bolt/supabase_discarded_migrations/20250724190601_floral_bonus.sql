/*
  # Create affiliates table

  1. New Tables
    - `affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `nome` (text, affiliate name)
      - `email` (text, unique)
      - `senha_hash` (text, hashed password)
      - `affiliate_code` (text, unique affiliate code)
      - `cpa` (decimal, cost per action)
      - `commission_rate` (decimal, commission percentage)
      - `total_referrals` (integer, total referrals count)
      - `active_referrals` (integer, active referrals count)
      - `volume_generated` (decimal, total volume generated)
      - `total_commission` (decimal, total commission earned)
      - `commission_pending` (decimal, pending commission)
      - `commission_paid` (decimal, paid commission)
      - `conversion_rate` (decimal, conversion rate percentage)
      - `status` (text, affiliate status)
      - `payment_method` (text, preferred payment method)
      - `payment_details` (jsonb, payment details)
      - `notifications_settings` (jsonb, notification preferences)
      - `security_settings` (jsonb, security settings)
      - `ultimo_acesso` (timestamp, last access)
      - `ip_ultimo_acesso` (text, last access IP)
      - `created_by` (uuid, who created this affiliate)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `affiliates` table
    - Add policy for affiliates to read/update their own data
    - Add policy for admins to manage all affiliates
*/

CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  senha_hash text NOT NULL,
  affiliate_code text UNIQUE NOT NULL,
  cpa decimal(10,2) DEFAULT 0.00,
  commission_rate decimal(5,2) DEFAULT 0.00,
  total_referrals integer DEFAULT 0,
  active_referrals integer DEFAULT 0,
  volume_generated decimal(12,2) DEFAULT 0.00,
  total_commission decimal(10,2) DEFAULT 0.00,
  commission_pending decimal(10,2) DEFAULT 0.00,
  commission_paid decimal(10,2) DEFAULT 0.00,
  conversion_rate decimal(5,2) DEFAULT 0.00,
  status text DEFAULT 'active',
  payment_method text DEFAULT 'pix',
  payment_details jsonb DEFAULT '{}'::jsonb,
  notifications_settings jsonb DEFAULT '{"newConversions": true, "newDeposits": true, "commissionChanges": true, "frequency": "realtime"}'::jsonb,
  security_settings jsonb DEFAULT '{"twoFactor": false}'::jsonb,
  ultimo_acesso timestamptz,
  ip_ultimo_acesso text,
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS text AS $$
BEGIN
  RETURN 'AFF' || UPPER(substring(gen_random_uuid()::text from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate affiliate code and update timestamp
CREATE OR REPLACE FUNCTION set_affiliate_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.affiliate_code IS NULL OR NEW.affiliate_code = '' THEN
    NEW.affiliate_code := generate_affiliate_code();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER affiliates_code_trigger
  BEFORE INSERT OR UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION set_affiliate_code();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- Constraints
ALTER TABLE affiliates ADD CONSTRAINT check_affiliate_status 
  CHECK (status IN ('active', 'inactive', 'suspended', 'pending'));

ALTER TABLE affiliates ADD CONSTRAINT check_payment_method 
  CHECK (payment_method IN ('pix', 'bank_transfer', 'crypto'));

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Affiliates can read and update their own data
CREATE POLICY "Affiliates can manage own data"
  ON affiliates
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all affiliates
CREATE POLICY "Admins can manage all affiliates"
  ON affiliates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );