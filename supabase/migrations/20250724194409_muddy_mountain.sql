/*
  # Create system settings table

  1. New Tables
    - `system_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (jsonb)
      - `description` (text)
      - `category` (text)
      - `is_public` (boolean, default false)
      - `updated_by` (uuid, foreign key to admins)
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
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Admins can manage all settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

-- Trigger
CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON system_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();