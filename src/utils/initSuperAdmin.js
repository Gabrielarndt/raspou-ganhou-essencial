// Inicializar sistema de super administradores separado
const initSuperAdmin = () => {
  try {
    // Remover super admins da lista de usuários se existirem
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    const filteredUsers = users.filter(u => 
      u.email !== 'admin@raspouganhou.com' && 
      u.email !== 'superadmin@raspouganhou.com' &&
      !u.is_admin &&
      !u.is_super_admin
    );
    localStorage.setItem('raspou_users', JSON.stringify(filteredUsers));

    // Criar sistema separado de super administradores
    const superAdmins = JSON.parse(localStorage.getItem('raspou_super_admins') || '[]');
    
    // Verificar se super admin já existe
    if (!superAdmins.find(sa => sa.email === 'superadmin@raspouganhou.com')) {
      const superAdminUser = {
        id: 1,
        name: 'Super Administrador',
        email: 'superadmin@raspouganhou.com',
        password: 'super123',
        permissions: ['all'],
        created_at: new Date().toISOString(),
        is_super_admin: true,
        role: 'super_admin'
      };
      
      superAdmins.push(superAdminUser);
      localStorage.setItem('raspou_super_admins', JSON.stringify(superAdmins));
      console.log('Super Admin user created successfully in super admin system');
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

    // Inicializar dados de exemplo para administradores normais
    const admins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
    if (admins.length === 0) {
      const exampleAdmins = [
        {
          id: 2,
          name: 'Admin Geral',
          email: 'admin.geral@raspouganhou.com',
          password: 'admin123',
          permissions: ['dashboard', 'users', 'transactions', 'affiliates'],
          created_at: new Date().toISOString(),
          is_admin: true,
          role: 'admin'
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