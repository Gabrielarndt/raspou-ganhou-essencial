/*
  # Create audit logs table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `admin_id` (uuid, nullable)
      - `affiliate_id` (uuid, nullable)
      - `action` (text)
      - `table_name` (text)
      - `record_id` (uuid, nullable)
      - `old_values` (jsonb, nullable)
      - `new_values` (jsonb, nullable)
      - `ip_address` (text, nullable)
      - `user_agent` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policy for admins only
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_affiliate_id ON audit_logs(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);