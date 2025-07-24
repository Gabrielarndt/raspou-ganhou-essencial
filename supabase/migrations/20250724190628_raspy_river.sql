/*
  # Create games and game results tables

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `nome` (text, game name)
      - `tipo` (text, game type)
      - `preco` (decimal, game price)
      - `premio_min` (decimal, minimum prize)
      - `premio_max` (decimal, maximum prize)
      - `win_rate` (decimal, win rate percentage)
      - `status` (text, game status)
      - `config` (jsonb, game configuration)
      - `created_by` (uuid, admin who created)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `game_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `game_id` (uuid, references games)
      - `transaction_id` (uuid, references transactions)
      - `cost` (decimal, game cost)
      - `prize` (decimal, prize won)
      - `won` (boolean, if user won)
      - `symbols` (jsonb, game symbols/results)
      - `winning_combination` (jsonb, winning combination)
      - `payment_breakdown` (jsonb, how payment was made)
      - `ip_address` (text, player IP)
      - `user_agent` (text, player browser)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for users and admins
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text DEFAULT 'scratch_card',
  preco decimal(10,2) NOT NULL,
  premio_min decimal(10,2) DEFAULT 0.00,
  premio_max decimal(10,2) NOT NULL,
  win_rate decimal(5,2) DEFAULT 30.00,
  status text DEFAULT 'active',
  config jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  cost decimal(10,2) NOT NULL,
  prize decimal(10,2) DEFAULT 0.00,
  won boolean DEFAULT false,
  symbols jsonb DEFAULT '[]'::jsonb,
  winning_combination jsonb DEFAULT '[]'::jsonb,
  payment_breakdown jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Triggers
CREATE TRIGGER games_updated_at_trigger
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_tipo ON games(tipo);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_preco ON games(preco);

CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON game_results(game_id);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at);
CREATE INDEX IF NOT EXISTS idx_game_results_won ON game_results(won);

-- Constraints
ALTER TABLE games ADD CONSTRAINT check_game_tipo 
  CHECK (tipo IN ('scratch_card', 'lottery', 'instant_win'));

ALTER TABLE games ADD CONSTRAINT check_game_status 
  CHECK (status IN ('active', 'inactive', 'maintenance'));

ALTER TABLE games ADD CONSTRAINT check_positive_price 
  CHECK (preco > 0);

ALTER TABLE games ADD CONSTRAINT check_valid_win_rate 
  CHECK (win_rate >= 0 AND win_rate <= 100);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Anyone can read active games"
  ON games
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage all games"
  ON games
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Game results policies
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

CREATE POLICY "Admins can manage all game results"
  ON game_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );