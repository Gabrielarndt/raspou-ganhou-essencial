/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `affiliate_id` (uuid, foreign key to affiliates, nullable)
      - `type` (text) - deposit, withdraw, bonus, commission, game_win, game_cost
      - `method` (text) - pix, credit_card, bank_transfer, etc
      - `amount` (decimal)
      - `fee` (decimal, default 0)
      - `net_amount` (decimal)
      - `status` (text) - pending, processing, completed, failed, cancelled
      - `payment_provider` (text, nullable)
      - `external_id` (text, nullable)
      - `metadata` (jsonb)
      - `processed_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `transactions` table
    - Add policies for users, affiliates and admins
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdraw', 'bonus', 'commission', 'game_win', 'game_cost', 'referral_bonus')),
  method text,
  amount decimal(12,2) NOT NULL,
  fee decimal(10,2) DEFAULT 0.00,
  net_amount decimal(12,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_provider text,
  external_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Affiliates can read related transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    affiliate_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM affiliates 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_affiliate_id ON transactions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_id);

-- Trigger para updated_at
CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();