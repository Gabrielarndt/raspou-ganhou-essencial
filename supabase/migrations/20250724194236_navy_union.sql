/*
  # Create admins table

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password` (text)
      - `role` (text, default 'admin')
      - `permissions` (jsonb)
      - `is_super_admin` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admins` table
    - Add policy for admins to read their own data
    - Add policy for super admins to manage all admins
*/

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'admin',
  permissions jsonb DEFAULT '[]'::jsonb,
  is_super_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super admins can manage all admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Trigger para updated_at
CREATE TRIGGER update_admins_updated_at 
  BEFORE UPDATE ON admins 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();