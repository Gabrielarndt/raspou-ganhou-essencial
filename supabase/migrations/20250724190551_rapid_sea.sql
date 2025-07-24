/*
  # Create admins table

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `nome` (text, admin name)
      - `email` (text, unique)
      - `senha_hash` (text, hashed password)
      - `role` (text, admin role: super_admin, admin)
      - `permissions` (jsonb, specific permissions)
      - `status` (text, account status)
      - `ultimo_acesso` (timestamp, last access)
      - `ip_ultimo_acesso` (text, last access IP)
      - `created_by` (uuid, who created this admin)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admins` table
    - Add policy for admins to read their own data
    - Add policy for super admins to manage all admins
*/

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  senha_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  permissions jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  ultimo_acesso timestamptz,
  ip_ultimo_acesso text,
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admins_updated_at_trigger
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);

-- Constraints
ALTER TABLE admins ADD CONSTRAINT check_admin_role 
  CHECK (role IN ('super_admin', 'admin'));

ALTER TABLE admins ADD CONSTRAINT check_admin_status 
  CHECK (status IN ('active', 'inactive', 'suspended'));

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can read their own data
CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Super admins can manage all admins
CREATE POLICY "Super admins can manage all admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'active'
    )
  );