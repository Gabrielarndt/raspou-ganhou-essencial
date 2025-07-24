/*
  # Create system settings table

  1. New Tables
    - `system_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique setting key)
      - `value` (jsonb, setting value)
      - `description` (text, setting description)
      - `category` (text, setting category)
      - `is_public` (boolean, if setting is public)
      - `updated_by` (uuid, admin who updated)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for public settings and admin management
*/

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  is_public boolean DEFAULT false,
  updated_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update timestamp
CREATE TRIGGER system_settings_updated_at_trigger
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('site_name', '"RaspouGanhou"', 'Nome do site', 'general', true),
('site_description', '"O melhor site de raspadinhas online do Brasil"', 'Descrição do site', 'general', true),
('contact_email', '"contato@raspouganhou.com"', 'Email de contato', 'general', true),
('support_phone', '"(11) 9999-9999"', 'Telefone de suporte', 'general', true),
('min_deposit', '10.00', 'Valor mínimo de depósito', 'payments', true),
('max_deposit', '10000.00', 'Valor máximo de depósito', 'payments', true),
('min_withdraw', '20.00', 'Valor mínimo de saque', 'payments', true),
('max_withdraw', '50000.00', 'Valor máximo de saque', 'payments', true),
('withdraw_fee_percentage', '0.00', 'Taxa de saque em porcentagem', 'payments', false),
('withdraw_fee_fixed', '0.00', 'Taxa fixa de saque', 'payments', false),
('bonus_new_user', '10.00', 'Bônus para novos usuários', 'bonuses', false),
('points_per_game', '10', 'Pontos ganhos por jogo', 'games', true),
('daily_lottery_time', '"20:00"', 'Horário do sorteio diário', 'lottery', true),
('maintenance_mode', 'false', 'Modo de manutenção', 'system', false),
('registration_enabled', 'true', 'Registro de novos usuários habilitado', 'system', true)
ON CONFLICT (key) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings(is_public);

-- Constraints
ALTER TABLE system_settings ADD CONSTRAINT check_setting_category 
  CHECK (category IN ('general', 'payments', 'games', 'lottery', 'bonuses', 'security', 'system', 'affiliate'));

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Public settings can be read by anyone
CREATE POLICY "Anyone can read public settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Admins can manage all settings
CREATE POLICY "Admins can manage all settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );