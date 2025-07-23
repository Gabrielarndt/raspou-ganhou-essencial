// Inicializar super administrador
const initSuperAdmin = () => {
  try {
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    
    // Verificar se super admin já existe
    if (!users.find(u => u.email === 'superadmin@raspouganhou.com')) {
      const superAdminUser = {
        id: 0, // ID especial para super admin
        nome: 'Super Administrador',
        email: 'superadmin@raspouganhou.com',
        telefone: '(11) 99999-0000',
        cpf: '000.000.000-00',
        senha: 'super123',
        saldo_real: 0,
        saldo_bonus: 0,
        pontos_sorteio: 0,
        jogos_realizados: 0,
        total_ganho: 0,
        nivel_vip: 'Master',
        data_cadastro: new Date().toISOString(),
        is_super_admin: true,
        is_admin: true
      };
      
      users.unshift(superAdminUser);
      localStorage.setItem('raspou_users', JSON.stringify(users));
      console.log('Super Admin user created successfully');
    }

    // Inicializar dados de exemplo para afiliados se não existirem
    const affiliates = JSON.parse(localStorage.getItem('raspou_affiliates') || '[]');
    if (affiliates.length === 0) {
      const exampleAffiliates = [
        {
          id: 1,
          name: 'João Afiliado',
          email: 'joao@afiliado.com',
          password: 'afiliado123',
          commission: 10, // 10%
          cpa: 50, // R$ 50 por primeiro depósito
          total_clients: 15,
          total_deposits: 5000,
          total_commission: 500,
          created_at: new Date().toISOString(),
          is_affiliate: true
        },
        {
          id: 2,
          name: 'Maria Parceira',
          email: 'maria@parceira.com',
          password: 'parceira123',
          commission: 15, // 15%
          cpa: 75, // R$ 75 por primeiro depósito
          total_clients: 8,
          total_deposits: 3200,
          total_commission: 480,
          created_at: new Date().toISOString(),
          is_affiliate: true
        }
      ];
      
      localStorage.setItem('raspou_affiliates', JSON.stringify(exampleAffiliates));
      console.log('Example affiliates created successfully');
    }

    // Inicializar dados de exemplo para administradores
    const admins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
    if (admins.length === 0) {
      const exampleAdmins = [
        {
          id: 1,
          name: 'Admin Geral',
          email: 'admin.geral@raspouganhou.com',
          password: 'admin123',
          permissions: ['dashboard', 'users', 'transactions', 'affiliates'],
          created_at: new Date().toISOString(),
          is_admin: true
        }
      ];
      
      localStorage.setItem('raspou_admins', JSON.stringify(exampleAdmins));
      console.log('Example admins created successfully');
    }

  } catch (error) {
    console.error('Error creating super admin user:', error);
  }
};

export default initSuperAdmin;