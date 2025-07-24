/*
  # Create coupons and coupon usage tables

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, references affiliates, nullable)
      - `code` (text, unique coupon code)
      - `name` (text, coupon display name)
      - `description` (text, coupon description)
      - `type` (text, coupon type)
      - `value` (decimal, coupon value)
      - `percentage` (decimal, percentage discount)
      - `min_deposit` (decimal, minimum deposit required)
      - `max_uses` (integer, maximum uses allowed)
      - `current_uses` (integer, current usage count)
      - `valid_from` (timestamp, valid from date)
      - `valid_until` (timestamp, valid until date)
      - `status` (text, coupon status)
      - `target_audience` (text, who can use)
      - `config` (jsonb, additional configuration)
      - `created_by` (uuid, admin who created)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `coupon_usage`
      - `id` (uuid, primary key)
      - `coupon_id` (uuid, references coupons)
      - `user_id` (uuid, references users)
      - `transaction_id` (uuid, references transactions)
      - `value_applied` (decimal, value applied)
      - `ip_address` (text, user IP)
      - `user_agent` (text, user browser)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE SET NULL,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  type text DEFAULT 'bonus',
  value decimal(10,2) DEFAULT 0.00,
  percentage decimal(5,2) DEFAULT 0.00,
  min_deposit decimal(10,2) DEFAULT 0.00,
  max_uses integer,
  current_uses integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  status text DEFAULT 'active',
  target_audience text DEFAULT 'all',
  config jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  value_applied decimal(10,2) NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Triggers
CREATE TRIGGER coupons_updated_at_trigger
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to update coupon usage count
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE coupons 
    SET current_uses = current_uses + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE coupons 
    SET current_uses = current_uses - 1
    WHERE id = OLD.coupon_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coupon_usage_count_trigger
  AFTER INSERT OR DELETE ON coupon_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_usage_count();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_affiliate_id ON coupons(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_created_at ON coupon_usage(created_at);

-- Constraints
ALTER TABLE coupons ADD CONSTRAINT check_coupon_type 
  CHECK (type IN ('bonus', 'percentage', 'free_games', 'cashback'));

ALTER TABLE coupons ADD CONSTRAINT check_coupon_status 
  CHECK (status IN ('active', 'inactive', 'expired', 'exhausted'));

ALTER TABLE coupons ADD CONSTRAINT check_target_audience 
  CHECK (target_audience IN ('all', 'new_users', 'vip_users', 'specific_affiliate'));

-- Prevent duplicate usage by same user
ALTER TABLE coupon_usage ADD CONSTRAINT unique_user_coupon_usage 
  UNIQUE (coupon_id, user_id);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Coupons policies
CREATE POLICY "Anyone can read active coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (status = 'active' AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage all coupons"
  ON coupons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Affiliates can read their coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Coupon usage policies
CREATE POLICY "Users can read own coupon usage"
  ON coupon_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own coupon usage"
  ON coupon_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all coupon usage"
  ON coupon_usage
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );