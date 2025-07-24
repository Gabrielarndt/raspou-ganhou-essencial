/*
  # Create lotteries and lottery entries tables

  1. New Tables
    - `lotteries`
      - `id` (uuid, primary key)
      - `title` (text, lottery title)
      - `description` (text, lottery description)
      - `prize` (decimal, lottery prize)
      - `max_participants` (integer, max participants)
      - `current_participants` (integer, current participants)
      - `entry_cost_points` (integer, points required to enter)
      - `draw_date` (timestamp, when draw happens)
      - `status` (text, lottery status)
      - `winning_numbers` (jsonb, winning numbers)
      - `winner_id` (uuid, winner user)
      - `config` (jsonb, lottery configuration)
      - `created_by` (uuid, admin who created)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `lottery_entries`
      - `id` (uuid, primary key)
      - `lottery_id` (uuid, references lotteries)
      - `user_id` (uuid, references users)
      - `entry_numbers` (jsonb, user's numbers)
      - `points_used` (integer, points spent)
      - `is_winner` (boolean, if this entry won)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

CREATE TABLE IF NOT EXISTS lotteries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  prize decimal(12,2) NOT NULL,
  max_participants integer,
  current_participants integer DEFAULT 0,
  entry_cost_points integer DEFAULT 100,
  draw_date timestamptz NOT NULL,
  status text DEFAULT 'active',
  winning_numbers jsonb DEFAULT '[]'::jsonb,
  winner_id uuid REFERENCES users(id),
  config jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lottery_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id uuid NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_numbers jsonb DEFAULT '[]'::jsonb,
  points_used integer NOT NULL,
  is_winner boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Triggers
CREATE TRIGGER lotteries_updated_at_trigger
  BEFORE UPDATE ON lotteries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to update participant count
CREATE OR REPLACE FUNCTION update_lottery_participants()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE lotteries 
    SET current_participants = current_participants + 1
    WHERE id = NEW.lottery_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lotteries 
    SET current_participants = current_participants - 1
    WHERE id = OLD.lottery_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lottery_entries_count_trigger
  AFTER INSERT OR DELETE ON lottery_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_lottery_participants();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lotteries_status ON lotteries(status);
CREATE INDEX IF NOT EXISTS idx_lotteries_draw_date ON lotteries(draw_date);
CREATE INDEX IF NOT EXISTS idx_lotteries_winner_id ON lotteries(winner_id);

CREATE INDEX IF NOT EXISTS idx_lottery_entries_lottery_id ON lottery_entries(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_entries_user_id ON lottery_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_entries_is_winner ON lottery_entries(is_winner);

-- Constraints
ALTER TABLE lotteries ADD CONSTRAINT check_lottery_status 
  CHECK (status IN ('active', 'closed', 'drawn', 'cancelled'));

ALTER TABLE lotteries ADD CONSTRAINT check_positive_prize 
  CHECK (prize > 0);

ALTER TABLE lotteries ADD CONSTRAINT check_positive_points 
  CHECK (entry_cost_points > 0);

-- Unique constraint to prevent duplicate entries
ALTER TABLE lottery_entries ADD CONSTRAINT unique_user_lottery_entry 
  UNIQUE (lottery_id, user_id);

ALTER TABLE lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_entries ENABLE ROW LEVEL SECURITY;

-- Lotteries policies
CREATE POLICY "Anyone can read active lotteries"
  ON lotteries
  FOR SELECT
  TO authenticated
  USING (status IN ('active', 'closed', 'drawn'));

CREATE POLICY "Admins can manage all lotteries"
  ON lotteries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Lottery entries policies
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

CREATE POLICY "Admins can manage all lottery entries"
  ON lottery_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );