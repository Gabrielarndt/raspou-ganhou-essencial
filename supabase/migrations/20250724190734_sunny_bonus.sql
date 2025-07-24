/*
  # Create balance movements table

  1. New Tables
    - `balance_movements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `transaction_id` (uuid, references transactions, nullable)
      - `type` (text, movement type)
      - `balance_type` (text, which balance was affected)
      - `amount` (decimal, movement amount)
      - `balance_before` (decimal, balance before movement)
      - `balance_after` (decimal, balance after movement)
      - `description` (text, movement description)
      - `reference_type` (text, what caused this movement)
      - `reference_id` (uuid, ID of the reference)
      - `metadata` (jsonb, additional data)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for users and admins
*/

CREATE TABLE IF NOT EXISTS balance_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  type text NOT NULL,
  balance_type text NOT NULL,
  amount decimal(12,2) NOT NULL,
  balance_before decimal(12,2) NOT NULL,
  balance_after decimal(12,2) NOT NULL,
  description text,
  reference_type text,
  reference_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_balance_movements_user_id ON balance_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_movements_transaction_id ON balance_movements(transaction_id);
CREATE INDEX IF NOT EXISTS idx_balance_movements_type ON balance_movements(type);
CREATE INDEX IF NOT EXISTS idx_balance_movements_balance_type ON balance_movements(balance_type);
CREATE INDEX IF NOT EXISTS idx_balance_movements_created_at ON balance_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_balance_movements_reference ON balance_movements(reference_type, reference_id);

-- Constraints
ALTER TABLE balance_movements ADD CONSTRAINT check_movement_type 
  CHECK (type IN ('credit', 'debit'));

ALTER TABLE balance_movements ADD CONSTRAINT check_balance_type 
  CHECK (balance_type IN ('real', 'bonus', 'pending'));

ALTER TABLE balance_movements ADD CONSTRAINT check_reference_type 
  CHECK (reference_type IN ('deposit', 'withdraw', 'game_win', 'game_cost', 'bonus', 'commission', 'refund', 'adjustment', 'coupon'));

ALTER TABLE balance_movements ENABLE ROW LEVEL SECURITY;

-- Users can read their own balance movements
CREATE POLICY "Users can read own balance movements"
  ON balance_movements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all balance movements
CREATE POLICY "Admins can manage all balance movements"
  ON balance_movements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );