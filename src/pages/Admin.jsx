@@ .. @@
         <div className="flex items-center justify-between mb-8">
           <button
            onClick={() => navigate('/super-admin-login')}
             className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
           >
             <ArrowLeft className="w-6 h-6" />
           </button>

  const loadData = () => {
    // Carregar usuários
    const savedUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    // Filtrar apenas usuários reais (não admins ou afiliados)
    const realUsers = savedUsers.filter(user => 
      !user.is_admin && 
      !user.is_super_admin && 
      !user.is_affiliate &&
      user.email !== 'admin@raspouganhou.com' &&
      user.email !== 'superadmin@raspouganhou.com'
    );
    setUsers(realUsers);

    // Carregar transações
    const savedTransactions = JSON.parse(localStorage.getItem('raspou_transactions') || '[]');
    setTransactions(savedTransactions);

    // Carregar jogos
    const savedGames = JSON.parse(localStorage.getItem('raspou_games') || '[]');
    setGames(savedGames);

    // Calcular estatísticas
    calculateStats(realUsers, savedTransactions, savedGames);
  };