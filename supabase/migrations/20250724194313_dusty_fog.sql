/*
  # Create lotteries and lottery entries tables

  1. New Tables
    - `lotteries`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `prize` (decimal)
      - `draw_date` (timestamp)
      - `status` (text) - active, finished, cancelled
      - `winner_id` (uuid, foreign key to users, nullable)
      - `winning_number` (text, nullable)
      - `total_participants` (integer, default 0)
      - `created_by` (uuid, foreign key to admins)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lottery_entries`
      - `id` (uuid, primary key)
      - `lottery_id` (uuid, foreign key to lotteries)
      - `user_id` (uuid, foreign key to users)
      - `points_used` (integer)
      - `numbers_generated` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

CREATE TABLE IF NOT EXISTS lotteries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  prize decimal(10,2) NOT NULL,
  draw_date timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'finished', 'cancelled')),
  winner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  winning_number text,
  total_participants integer DEFAULT 0,
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lottery_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id uuid REFERENCES lotteries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  points_used integer NOT NULL,
  numbers_generated jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_entries ENABLE ROW LEVEL SECURITY;

-- Políticas para lotteries
CREATE POLICY "Anyone can read lotteries"
  ON lotteries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage lotteries"
  ON lotteries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Políticas para lottery_entries
CREATE POLICY "Users can read own lottery entries"
  ON lottery_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own lottery entries"
  ON lottery_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all lottery entries"
  ON lottery_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_lotteries_status ON lotteries(status);
CREATE INDEX IF NOT EXISTS idx_lotteries_draw_date ON lotteries(draw_date);
CREATE INDEX IF NOT EXISTS idx_lottery_entries_lottery_id ON lottery_entries(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_entries_user_id ON lottery_entries(user_id);

-- Triggers
CREATE TRIGGER update_lotteries_updated_at 
  BEFORE UPDATE ON lotteries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();