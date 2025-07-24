/*
  # Create balance movements table

  1. New Tables
    - `balance_movements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `transaction_id` (uuid, foreign key to transactions, nullable)
      - `type` (text) - credit, debit
      - `balance_type` (text) - real, bonus
      - `amount` (decimal)
      - `previous_balance` (decimal)
      - `new_balance` (decimal)
      - `description` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for users and admins
*/

CREATE TABLE IF NOT EXISTS balance_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  balance_type text NOT NULL CHECK (balance_type IN ('real', 'bonus')),
  amount decimal(12,2) NOT NULL,
  previous_balance decimal(12,2) NOT NULL,
  new_balance decimal(12,2) NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE balance_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own balance movements"
  ON balance_movements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all balance movements"
  ON balance_movements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert balance movements"
  ON balance_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_balance_movements_user_id ON balance_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_movements_transaction_id ON balance_movements(transaction_id);
CREATE INDEX IF NOT EXISTS idx_balance_movements_type ON balance_movements(type);
CREATE INDEX IF NOT EXISTS idx_balance_movements_balance_type ON balance_movements(balance_type);
CREATE INDEX IF NOT EXISTS idx_balance_movements_created_at ON balance_movements(created_at);