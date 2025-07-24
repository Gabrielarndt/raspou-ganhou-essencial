/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `nome` (text)
      - `telefone` (text)
      - `cpf` (text, unique)
      - `senha` (text)
      - `saldo_real` (decimal, default 0)
      - `saldo_bonus` (decimal, default 0)
      - `pontos_sorteio` (integer, default 0)
      - `jogos_realizados` (integer, default 0)
      - `total_ganho` (decimal, default 0)
      - `nivel_vip` (text, default 'Bronze')
      - `data_cadastro` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nome text NOT NULL,
  telefone text,
  cpf text UNIQUE NOT NULL,
  senha text NOT NULL,
  saldo_real decimal(10,2) DEFAULT 0.00,
  saldo_bonus decimal(10,2) DEFAULT 0.00,
  pontos_sorteio integer DEFAULT 0,
  jogos_realizados integer DEFAULT 0,
  total_ganho decimal(10,2) DEFAULT 0.00,
  nivel_vip text DEFAULT 'Bronze',
  data_cadastro timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();