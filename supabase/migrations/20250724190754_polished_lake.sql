/*
  # Create audit logs table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, who performed the action)
      - `user_type` (text, type of user: user, admin, affiliate)
      - `action` (text, action performed)
      - `table_name` (text, affected table)
      - `record_id` (uuid, affected record ID)
      - `old_values` (jsonb, old values)
      - `new_values` (jsonb, new values)
      - `ip_address` (text, user IP)
      - `user_agent` (text, user browser)
      - `session_id` (text, session identifier)
      - `metadata` (jsonb, additional context)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for admins only
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_type text NOT NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb DEFAULT '{}'::jsonb,
  new_values jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  session_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_type ON audit_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);

-- Constraints
ALTER TABLE audit_logs ADD CONSTRAINT check_user_type 
  CHECK (user_type IN ('user', 'admin', 'affiliate', 'system'));

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Only admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);