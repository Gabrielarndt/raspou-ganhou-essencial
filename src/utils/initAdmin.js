// Inicializar sistema de administradores separado
const initAdmin = () => {
  try {
    // Remover admins da lista de usuários se existirem
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    const filteredUsers = users.filter(u => 
      u.email !== 'admin@raspouganhou.com' && 
      u.email !== 'superadmin@raspouganhou.com' &&
      !u.is_admin &&
      !u.is_super_admin
    );
    localStorage.setItem('raspou_users', JSON.stringify(filteredUsers));

    // Criar sistema separado de administradores
    const admins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
    
    // Verificar se admin já existe
    if (!admins.find(a => a.email === 'admin@raspouganhou.com')) {
      const adminUser = {
        id: 1,
        name: 'Administrador',
        email: 'admin@raspouganhou.com',
        password: 'admin123',
        permissions: ['dashboard', 'users', 'transactions', 'games', 'settings'],
        created_at: new Date().toISOString(),
        is_admin: true,
        role: 'admin'
      };
      
      admins.push(adminUser);
      localStorage.setItem('raspou_admins', JSON.stringify(admins));
      console.log('Admin user created successfully in admin system');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

export default initAdmin;