/*
  # Create commission payments table

  1. New Tables
    - `commission_payments`
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, foreign key to affiliates)
      - `transaction_id` (uuid, foreign key to transactions)
      - `referral_id` (uuid, foreign key to affiliate_referrals)
      - `commission_amount` (decimal)
      - `commission_rate` (decimal)
      - `base_amount` (decimal)
      - `status` (text) - pending, paid, cancelled
      - `paid_at` (timestamp, nullable)
      - `payment_method` (text, nullable)
      - `payment_reference` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for affiliates and admins
*/

CREATE TABLE IF NOT EXISTS commission_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES affiliate_referrals(id) ON DELETE CASCADE,
  commission_amount decimal(10,2) NOT NULL,
  commission_rate decimal(5,2) NOT NULL,
  base_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamptz,
  payment_method text,
  payment_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can read own commissions"
  ON commission_payments
  FOR SELECT
  TO authenticated
  USING (affiliate_id = auth.uid());

CREATE POLICY "Admins can manage all commissions"
  ON commission_payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_commission_payments_affiliate_id ON commission_payments(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_transaction_id ON commission_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_status ON commission_payments(status);
CREATE INDEX IF NOT EXISTS idx_commission_payments_created_at ON commission_payments(created_at);

-- Trigger
CREATE TRIGGER update_commission_payments_updated_at 
  BEFORE UPDATE ON commission_payments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();