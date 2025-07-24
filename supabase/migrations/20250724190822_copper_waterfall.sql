/*
  # Create reports table

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `name` (text, report name)
      - `type` (text, report type)
      - `filters` (jsonb, report filters)
      - `data` (jsonb, report data)
      - `file_url` (text, generated file URL)
      - `status` (text, report status)
      - `generated_by` (uuid, who generated)
      - `generated_for` (uuid, who requested)
      - `generated_at` (timestamp, when generated)
      - `expires_at` (timestamp, when report expires)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for users and admins
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  data jsonb DEFAULT '{}'::jsonb,
  file_url text,
  status text DEFAULT 'generating',
  generated_by uuid,
  generated_for uuid,
  generated_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_generated_for ON reports(generated_for);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_expires_at ON reports(expires_at);

-- Constraints
ALTER TABLE reports ADD CONSTRAINT check_report_type 
  CHECK (type IN ('financial', 'user_activity', 'game_performance', 'affiliate_performance', 'transaction_summary', 'audit'));

ALTER TABLE reports ADD CONSTRAINT check_report_status 
  CHECK (status IN ('generating', 'completed', 'failed', 'expired'));

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can read reports generated for them
CREATE POLICY "Users can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (generated_for = auth.uid());

-- Admins can manage all reports
CREATE POLICY "Admins can manage all reports"
  ON reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Affiliates can read reports generated for them
CREATE POLICY "Affiliates can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    generated_for IN (
      SELECT user_id FROM affiliates 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );