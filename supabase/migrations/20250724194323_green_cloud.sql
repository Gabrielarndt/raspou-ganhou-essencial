/*
  # Create coupons and coupon usage tables

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `bonus_amount` (decimal)
      - `description` (text)
      - `affiliate_id` (uuid, foreign key to affiliates, nullable)
      - `created_by` (uuid, foreign key to admins, nullable)
      - `usage_limit` (integer, nullable)
      - `usage_count` (integer, default 0)
      - `is_active` (boolean, default true)
      - `expires_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `coupon_usage`
      - `id` (uuid, primary key)
      - `coupon_id` (uuid, foreign key to coupons)
      - `user_id` (uuid, foreign key to users)
      - `bonus_received` (decimal)
      - `used_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  bonus_amount decimal(10,2) NOT NULL,
  description text,
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  bonus_received decimal(10,2) NOT NULL,
  used_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para coupons
CREATE POLICY "Anyone can read active coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Affiliates can read own coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (affiliate_id = auth.uid());

CREATE POLICY "Admins can manage all coupons"
  ON coupons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Políticas para coupon_usage
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

CREATE POLICY "Affiliates can read related coupon usage"
  ON coupon_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coupons 
      WHERE id = coupon_id AND affiliate_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all coupon usage"
  ON coupon_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_affiliate_id ON coupons(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);

-- Triggers
CREATE TRIGGER update_coupons_updated_at 
  BEFORE UPDATE ON coupons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();