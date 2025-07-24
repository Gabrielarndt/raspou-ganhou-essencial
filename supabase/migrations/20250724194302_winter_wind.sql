/*
  # Create games and game results tables

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (decimal)
      - `max_prize` (decimal)
      - `win_probability` (decimal)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `game_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `game_id` (uuid, foreign key to games)
      - `cost` (decimal)
      - `prize` (decimal, default 0)
      - `won` (boolean, default false)
      - `symbols` (jsonb)
      - `winning_positions` (jsonb)
      - `payment_breakdown` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  max_prize decimal(10,2) NOT NULL,
  win_probability decimal(5,4) DEFAULT 0.30,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  cost decimal(10,2) NOT NULL,
  prize decimal(10,2) DEFAULT 0.00,
  won boolean DEFAULT false,
  symbols jsonb DEFAULT '[]'::jsonb,
  winning_positions jsonb DEFAULT '[]'::jsonb,
  payment_breakdown jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Políticas para games
CREATE POLICY "Anyone can read active games"
  ON games
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage games"
  ON games
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Políticas para game_results
CREATE POLICY "Users can read own game results"
  ON game_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own game results"
  ON game_results
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all game results"
  ON game_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_games_active ON games(is_active);
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON game_results(game_id);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at);

-- Triggers
CREATE TRIGGER update_games_updated_at 
  BEFORE UPDATE ON games 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();