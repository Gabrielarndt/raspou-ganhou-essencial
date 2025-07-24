/*
  # Create affiliate referrals table

  1. New Tables
    - `affiliate_referrals`
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, foreign key to affiliates)
      - `user_id` (uuid, foreign key to users)
      - `referral_code` (text)
      - `first_deposit_amount` (decimal, nullable)
      - `first_deposit_date` (timestamp, nullable)
      - `total_deposits` (decimal, default 0)
      - `total_commission_generated` (decimal, default 0)
      - `status` (text) - pending, active, inactive
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for affiliates and admins
*/

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  first_deposit_amount decimal(10,2),
  first_deposit_date timestamptz,
  total_deposits decimal(12,2) DEFAULT 0.00,
  total_commission_generated decimal(10,2) DEFAULT 0.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(affiliate_id, user_id)
);

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can read own referrals"
  ON affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (affiliate_id = auth.uid());

CREATE POLICY "Affiliates can insert own referrals"
  ON affiliate_referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (affiliate_id = auth.uid());

CREATE POLICY "Affiliates can update own referrals"
  ON affiliate_referrals
  FOR UPDATE
  TO authenticated
  USING (affiliate_id = auth.uid());

CREATE POLICY "Admins can manage all referrals"
  ON affiliate_referrals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON affiliate_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_created_at ON affiliate_referrals(created_at);

-- Trigger
CREATE TRIGGER update_affiliate_referrals_updated_at 
  BEFORE UPDATE ON affiliate_referrals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();