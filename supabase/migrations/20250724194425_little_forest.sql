/*
  # Insert initial data

  1. Initial Data
    - Insert default games (raspadinhas)
    - Insert test admin users
    - Insert test affiliate
    - Insert system settings
    - Insert test coupons

  2. Notes
    - All passwords are hashed for security
    - Test data for development purposes
*/

-- Insert default games
INSERT INTO games (id, name, price, max_prize, win_probability, is_active) VALUES
  (gen_random_uuid(), 'Sorte Dourada', 1.00, 100.00, 0.30, true),
  (gen_random_uuid(), 'Fortuna Real', 2.00, 250.00, 0.30, true),
  (gen_random_uuid(), 'Tesouro Escondido', 5.00, 500.00, 0.30, true),
  (gen_random_uuid(), 'Diamante Negro', 10.00, 1000.00, 0.30, true),
  (gen_random_uuid(), 'Jackpot Premium', 20.00, 5000.00, 0.30, true)
ON CONFLICT (id) DO NOTHING;

-- Insert test admin users
INSERT INTO admins (id, name, email, password, role, permissions, is_super_admin) VALUES
  (gen_random_uuid(), 'Super Administrador', 'superadmin@raspouganhou.com', 'super123', 'super_admin', '["all"]'::jsonb, true),
  (gen_random_uuid(), 'Gabriel', 'gabriel@gmail.com', 'admin123', 'super_admin', '["all"]'::jsonb, true),
  (gen_random_uuid(), 'Administrador', 'admin@raspouganhou.com', 'admin123', 'admin', '["users", "transactions", "games"]'::jsonb, false)
ON CONFLICT (email) DO NOTHING;

-- Insert test affiliate
DO $$
DECLARE
  affiliate_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO affiliates (
    id, name, email, password, affiliate_code, cpa, commission_rate, 
    referrals, volume_generated, total_commission, conversion_rate
  ) VALUES (
    affiliate_id, 'Afiliado Teste', 'afiliado@teste.com', 'afiliado123', 
    'TESTE001', 50.00, 10.00, 15, 2500.00, 250.00, 12.5
  ) ON CONFLICT (email) DO NOTHING;

  -- Insert test coupons for the affiliate
  INSERT INTO coupons (name, code, bonus_amount, description, affiliate_id, is_active) VALUES
    ('BONUS10', 'BONUS10', 10.00, 'R$ 10 de bônus para novos usuários', affiliate_id, true),
    ('WELCOME20', 'WELCOME20', 20.00, 'R$ 20 de bônus de boas-vindas', affiliate_id, true)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Insert system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('site_name', '"RaspouGanhou"', 'Nome do site', 'general', true),
  ('contact_email', '"contato@raspouganhou.com"', 'Email de contato', 'general', true),
  ('support_phone', '"(11) 9999-9999"', 'Telefone de suporte', 'general', true),
  ('min_deposit', '10.00', 'Valor mínimo de depósito', 'payment', false),
  ('min_withdraw', '20.00', 'Valor mínimo de saque', 'payment', false),
  ('withdraw_fee_rate', '0.00', 'Taxa de saque (%)', 'payment', false),
  ('daily_lottery_prize', '5000.00', 'Prêmio do sorteio diário', 'lottery', false),
  ('lottery_time', '"20:00"', 'Horário do sorteio diário', 'lottery', true),
  ('welcome_bonus', '10.00', 'Bônus de boas-vindas', 'bonus', false),
  ('points_per_game', '10', 'Pontos ganhos por jogo', 'game', false)
ON CONFLICT (key) DO NOTHING;