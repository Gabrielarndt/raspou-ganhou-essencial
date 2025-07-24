/*
  # Insert initial data

  1. Initial Data
    - Default games (scratch cards)
    - Test admin user
    - Test affiliate user
    - Sample lottery

  2. Notes
    - Passwords are hashed for security
    - Test data for development purposes
*/

-- Insert default games
INSERT INTO games (id, nome, tipo, preco, premio_min, premio_max, win_rate, status, config) VALUES
('11111111-1111-1111-1111-111111111111', 'Sorte Dourada', 'scratch_card', 1.00, 0.00, 100.00, 30.00, 'active', '{"symbols": ["💎", "🍀", "⭐", "🎯", "🏆", "💰", "🎲", "🔥"], "grid_size": 9}'),
('22222222-2222-2222-2222-222222222222', 'Fortuna Real', 'scratch_card', 2.00, 0.00, 250.00, 28.00, 'active', '{"symbols": ["💎", "🍀", "⭐", "🎯", "🏆", "💰", "🎲", "🔥"], "grid_size": 9}'),
('33333333-3333-3333-3333-333333333333', 'Tesouro Escondido', 'scratch_card', 5.00, 0.00, 500.00, 25.00, 'active', '{"symbols": ["💎", "🍀", "⭐", "🎯", "🏆", "💰", "🎲", "🔥"], "grid_size": 9}'),
('44444444-4444-4444-4444-444444444444', 'Diamante Negro', 'scratch_card', 10.00, 0.00, 1000.00, 22.00, 'active', '{"symbols": ["💎", "🍀", "⭐", "🎯", "🏆", "💰", "🎲", "🔥"], "grid_size": 9}'),
('55555555-5555-5555-5555-555555555555', 'Jackpot Premium', 'scratch_card', 20.00, 0.00, 5000.00, 20.00, 'active', '{"symbols": ["💎", "🍀", "⭐", "🎯", "🏆", "💰", "🎲", "🔥"], "grid_size": 9}')
ON CONFLICT (id) DO NOTHING;

-- Insert test admin (password: admin123)
INSERT INTO admins (id, nome, email, senha_hash, role, permissions, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Administrador Teste', 'admin@raspouganhou.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kOp0rQZ8kHp0rQZ8kHp0rQZ8kHp0rQZ8k', 'admin', '["users", "transactions", "games", "reports"]', 'active'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Super Administrador', 'superadmin@raspouganhou.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kOp0rQZ8kHp0rQZ8kHp0rQZ8kHp0rQZ8k', 'super_admin', '["all"]', 'active'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Gabriel', 'gabriel@gmail.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kOp0rQZ8kHp0rQZ8kHp0rQZ8kHp0rQZ8k', 'super_admin', '["all"]', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert test affiliate (password: afiliado123)
INSERT INTO affiliates (id, nome, email, senha_hash, affiliate_code, cpa, commission_rate, total_referrals, volume_generated, total_commission, conversion_rate, status) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Afiliado Teste', 'afiliado@teste.com', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kOp0rQZ8kHp0rQZ8kHp0rQZ8kHp0rQZ8k', 'TESTE001', 50.00, 10.00, 15, 2500.00, 250.00, 12.5, 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert test coupons for affiliate
INSERT INTO coupons (affiliate_id, code, name, description, type, value, status, target_audience) VALUES
((SELECT id FROM affiliates WHERE email = 'afiliado@teste.com'), 'BONUS10', 'BONUS10', 'R$ 10 de bônus para novos usuários', 'bonus', 10.00, 'active', 'new_users'),
((SELECT id FROM affiliates WHERE email = 'afiliado@teste.com'), 'WELCOME20', 'WELCOME20', 'R$ 20 de bônus de boas-vindas', 'bonus', 20.00, 'active', 'all')
ON CONFLICT (code) DO NOTHING;

-- Insert sample lottery
INSERT INTO lotteries (title, description, prize, max_participants, entry_cost_points, draw_date, status) VALUES
('Sorteio Diário', 'Sorteio diário com prêmio de R$ 5.000', 5000.00, 1000, 100, (now() + interval '1 day'), 'active')
ON CONFLICT DO NOTHING;