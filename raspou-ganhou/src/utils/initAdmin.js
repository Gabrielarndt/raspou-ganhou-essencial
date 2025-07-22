// Inicializar usuário admin
const initAdmin = () => {
  try {
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    
    // Verificar se admin já existe
    if (!users.find(u => u.email === 'admin@raspouganhou.com')) {
      const adminUser = {
        id: 1,
        nome: 'Administrador',
        email: 'admin@raspouganhou.com',
        telefone: '(11) 99999-9999',
        cpf: '000.000.000-00',
        senha: 'admin123',
        saldo_real: 10000,
        saldo_bonus: 5000,
        pontos_sorteio: 1000,
        jogos_realizados: 0,
        total_ganho: 0,
        nivel_vip: 'Diamante',
        data_cadastro: new Date().toISOString(),
        is_admin: true
      };
      
      users.unshift(adminUser);
      localStorage.setItem('raspou_users', JSON.stringify(users));
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

export default initAdmin;

