/*
  # Create commission payments table

  1. New Tables
    - `commission_payments`
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, references affiliates)
      - `period_start` (timestamp, commission period start)
      - `period_end` (timestamp, commission period end)
      - `total_volume` (decimal, total volume in period)
      - `commission_rate` (decimal, rate applied)
      - `gross_commission` (decimal, gross commission amount)
      - `deductions` (decimal, any deductions)
      - `net_commission` (decimal, net commission to pay)
      - `status` (text, payment status)
      - `payment_method` (text, how it was paid)
      - `payment_details` (jsonb, payment details)
      - `paid_at` (timestamp, when payment was made)
      - `processed_by` (uuid, admin who processed)
      - `notes` (text, additional notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for affiliates and admins
*/

CREATE TABLE IF NOT EXISTS commission_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_volume decimal(12,2) DEFAULT 0.00,
  commission_rate decimal(5,2) NOT NULL,
  gross_commission decimal(10,2) NOT NULL,
  deductions decimal(10,2) DEFAULT 0.00,
  net_commission decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_method text,
  payment_details jsonb DEFAULT '{}'::jsonb,
  paid_at timestamptz,
  processed_by uuid REFERENCES admins(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update timestamp
CREATE TRIGGER commission_payments_updated_at_trigger
  BEFORE UPDATE ON commission_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commission_payments_affiliate_id ON commission_payments(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_status ON commission_payments(status);
CREATE INDEX IF NOT EXISTS idx_commission_payments_period ON commission_payments(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_commission_payments_paid_at ON commission_payments(paid_at);

-- Constraints
ALTER TABLE commission_payments ADD CONSTRAINT check_commission_status 
  CHECK (status IN ('pending', 'processing', 'paid', 'cancelled', 'disputed'));

ALTER TABLE commission_payments ADD CONSTRAINT check_valid_period 
  CHECK (period_end > period_start);

ALTER TABLE commission_payments ADD CONSTRAINT check_positive_amounts 
  CHECK (gross_commission >= 0 AND net_commission >= 0 AND deductions >= 0);

ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;

-- Affiliates can read their own commission payments
CREATE POLICY "Affiliates can read own commission payments"
  ON commission_payments
  FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Admins can manage all commission payments
CREATE POLICY "Admins can manage all commission payments"
  ON commission_payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );