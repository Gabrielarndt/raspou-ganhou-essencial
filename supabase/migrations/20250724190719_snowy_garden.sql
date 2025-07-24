/*
  # Create affiliate referrals table

  1. New Tables
    - `affiliate_referrals`
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, references affiliates)
      - `user_id` (uuid, references users)
      - `referral_code_used` (text, code used for referral)
      - `first_deposit_amount` (decimal, first deposit amount)
      - `first_deposit_date` (timestamp, when first deposit was made)
      - `total_deposits` (decimal, total deposits by this referral)
      - `total_commission_generated` (decimal, total commission generated)
      - `status` (text, referral status)
      - `conversion_date` (timestamp, when user converted)
      - `last_activity` (timestamp, last activity date)
      - `metadata` (jsonb, additional tracking data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add appropriate policies for affiliates and admins
*/

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code_used text,
  first_deposit_amount decimal(10,2),
  first_deposit_date timestamptz,
  total_deposits decimal(12,2) DEFAULT 0.00,
  total_commission_generated decimal(10,2) DEFAULT 0.00,
  status text DEFAULT 'pending',
  conversion_date timestamptz,
  last_activity timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update timestamp
CREATE TRIGGER affiliate_referrals_updated_at_trigger
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to update affiliate stats when referral changes
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS trigger AS $$
BEGIN
  -- Update affiliate totals
  UPDATE affiliates SET
    total_referrals = (
      SELECT COUNT(*) FROM affiliate_referrals 
      WHERE affiliate_id = COALESCE(NEW.affiliate_id, OLD.affiliate_id)
    ),
    active_referrals = (
      SELECT COUNT(*) FROM affiliate_referrals 
      WHERE affiliate_id = COALESCE(NEW.affiliate_id, OLD.affiliate_id) 
      AND status = 'active'
    ),
    volume_generated = (
      SELECT COALESCE(SUM(total_deposits), 0) FROM affiliate_referrals 
      WHERE affiliate_id = COALESCE(NEW.affiliate_id, OLD.affiliate_id)
    ),
    total_commission = (
      SELECT COALESCE(SUM(total_commission_generated), 0) FROM affiliate_referrals 
      WHERE affiliate_id = COALESCE(NEW.affiliate_id, OLD.affiliate_id)
    )
  WHERE id = COALESCE(NEW.affiliate_id, OLD.affiliate_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER affiliate_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON affiliate_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_conversion_date ON affiliate_referrals(conversion_date);

-- Constraints
ALTER TABLE affiliate_referrals ADD CONSTRAINT check_referral_status 
  CHECK (status IN ('pending', 'active', 'inactive', 'churned'));

-- Unique constraint to prevent duplicate referrals
ALTER TABLE affiliate_referrals ADD CONSTRAINT unique_affiliate_user_referral 
  UNIQUE (affiliate_id, user_id);

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Affiliates can read their own referrals
CREATE POLICY "Affiliates can read own referrals"
  ON affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Admins can manage all referrals
CREATE POLICY "Admins can manage all referrals"
  ON affiliate_referrals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );