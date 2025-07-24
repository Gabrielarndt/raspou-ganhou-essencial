/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users, nullable)
      - `admin_id` (uuid, foreign key to admins, nullable)
      - `affiliate_id` (uuid, foreign key to affiliates, nullable)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `data` (jsonb)
      - `is_read` (boolean, default false)
      - `read_at` (timestamp, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for users to read own notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES admins(id) ON DELETE CASCADE,
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid());

CREATE POLICY "Admins can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid());

CREATE POLICY "Affiliates can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (affiliate_id = auth.uid());

CREATE POLICY "Affiliates can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (affiliate_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_affiliate_id ON notifications(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);