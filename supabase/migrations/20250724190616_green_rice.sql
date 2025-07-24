/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `affiliate_id` (uuid, references affiliates, nullable)
      - `type` (text, transaction type)
      - `subtype` (text, transaction subtype)
      - `amount` (decimal, transaction amount)
      - `fee` (decimal, transaction fee)
      - `net_amount` (decimal, net amount after fees)
      - `currency` (text, currency code)
      - `status` (text, transaction status)
      - `payment_method` (text, payment method used)
      - `payment_provider` (text, payment provider)
      - `external_id` (text, external transaction ID)
      - `payment_details` (jsonb, payment specific details)
      - `description` (text, transaction description)
      - `metadata` (jsonb, additional metadata)
      - `processed_at` (timestamp, when processed)
      - `approved_by` (uuid, admin who approved)
      - `rejected_reason` (text, rejection reason)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for users to read their own transactions
    - Add policy for admins to manage all transactions
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE SET NULL,
  type text NOT NULL,
  subtype text,
  amount decimal(12,2) NOT NULL,
  fee decimal(10,2) DEFAULT 0.00,
  net_amount decimal(12,2) NOT NULL,
  currency text DEFAULT 'BRL',
  status text DEFAULT 'pending',
  payment_method text,
  payment_provider text,
  external_id text,
  payment_details jsonb DEFAULT '{}'::jsonb,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  approved_by uuid REFERENCES admins(id),
  rejected_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update timestamp
CREATE TRIGGER transactions_updated_at_trigger
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_affiliate_id ON transactions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_id);

-- Constraints
ALTER TABLE transactions ADD CONSTRAINT check_transaction_type 
  CHECK (type IN ('deposit', 'withdraw', 'bonus', 'commission', 'refund', 'adjustment', 'game_win', 'game_cost'));

ALTER TABLE transactions ADD CONSTRAINT check_transaction_status 
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected'));

ALTER TABLE transactions ADD CONSTRAINT check_positive_amount 
  CHECK (amount > 0);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all transactions
CREATE POLICY "Admins can manage all transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Affiliates can read transactions related to their referrals
CREATE POLICY "Affiliates can read related transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );