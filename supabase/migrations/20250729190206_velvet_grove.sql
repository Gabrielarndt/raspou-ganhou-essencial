/*
  # Add affiliate coupon column to users table

  1. Changes
    - Add `cupom_afiliado` column to users table to store the affiliate coupon code used during registration
    - Add index for better query performance
    - This will help track which affiliate referred each user

  2. Security
    - Column is optional (nullable) for existing users
    - New users can optionally provide a coupon code during registration
*/

-- Add affiliate coupon column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'cupom_afiliado'
  ) THEN
    ALTER TABLE users ADD COLUMN cupom_afiliado text;
  END IF;
END $$;

-- Add index for better performance when querying by affiliate coupon
CREATE INDEX IF NOT EXISTS idx_users_cupom_afiliado ON users(cupom_afiliado);

-- Add comment to document the column purpose
COMMENT ON COLUMN users.cupom_afiliado IS 'Código do cupom de afiliado usado durante o cadastro';