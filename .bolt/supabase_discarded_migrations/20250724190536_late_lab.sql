/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `nome` (text, full name)
      - `email` (text, unique)
      - `cpf` (text, unique, Brazilian tax ID)
      - `telefone` (text, phone number)
      - `senha_hash` (text, hashed password)
      - `saldo_real` (decimal, real balance)
      - `saldo_bonus` (decimal, bonus balance)
      - `saldo_pendente` (decimal, pending balance)
      - `pontos_sorteio` (integer, lottery points)
      - `jogos_realizados` (integer, games played count)
      - `total_ganho` (decimal, total winnings)
      - `total_depositado` (decimal, total deposited)
      - `total_sacado` (decimal, total withdrawn)
      - `nivel_vip` (text, VIP level)
      - `status` (text, account status)
      - `email_verificado` (boolean, email verification)
      - `cpf_verificado` (boolean, CPF verification)
      - `data_ultimo_acesso` (timestamp, last access)
      - `ip_ultimo_acesso` (text, last access IP)
      - `referral_code` (text, user's referral code)
      - `referred_by` (uuid, who referred this user)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
    - Add policy for admins to manage all users
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  cpf text UNIQUE NOT NULL,
  telefone text,
  senha_hash text NOT NULL,
  saldo_real decimal(10,2) DEFAULT 0.00,
  saldo_bonus decimal(10,2) DEFAULT 0.00,
  saldo_pendente decimal(10,2) DEFAULT 0.00,
  pontos_sorteio integer DEFAULT 0,
  jogos_realizados integer DEFAULT 0,
  total_ganho decimal(10,2) DEFAULT 0.00,
  total_depositado decimal(10,2) DEFAULT 0.00,
  total_sacado decimal(10,2) DEFAULT 0.00,
  nivel_vip text DEFAULT 'Bronze',
  status text DEFAULT 'active',
  email_verificado boolean DEFAULT false,
  cpf_verificado boolean DEFAULT false,
  data_ultimo_acesso timestamptz,
  ip_ultimo_acesso text,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Generate unique referral code for each user
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
BEGIN
  RETURN 'REF' || UPPER(substring(gen_random_uuid()::text from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate referral code
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_referral_code_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can manage own data"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

-- Admins can manage all users
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );