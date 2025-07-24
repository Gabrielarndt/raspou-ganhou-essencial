/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `type` (text, notification type)
      - `title` (text, notification title)
      - `message` (text, notification message)
      - `data` (jsonb, additional notification data)
      - `read` (boolean, if notification was read)
      - `read_at` (timestamp, when it was read)
      - `priority` (text, notification priority)
      - `expires_at` (timestamp, when notification expires)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for users to read their own notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  read_at timestamptz,
  priority text DEFAULT 'normal',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Constraints
ALTER TABLE notifications ADD CONSTRAINT check_notification_type 
  CHECK (type IN ('deposit', 'withdraw', 'game_win', 'lottery_win', 'bonus', 'commission', 'system', 'promotion', 'security'));

ALTER TABLE notifications ADD CONSTRAINT check_notification_priority 
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );