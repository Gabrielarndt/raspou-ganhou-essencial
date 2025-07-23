@@ .. @@
         <div className="flex items-center justify-between mb-8">
           <button
            onClick={() => navigate('/super-admin-login')}
             className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
           >
             <ArrowLeft className="w-6 h-6" />
           </button>

  const loadData = () => {
    // Carregar dados do localStorage
    const savedUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    // Filtrar apenas usuários reais (não admins ou afiliados)
    const realUsers = savedUsers.filter(user => 
      !user.is_admin && 
      !user.is_super_admin && 
      !user.is_affiliate &&
      user.email !== 'admin@raspouganhou.com' &&
      user.email !== 'superadmin@raspouganhou.com'
    );
    
    const savedTransactions = JSON.parse(localStorage.getItem('raspou_transactions') || '[]');
    const savedAffiliates = JSON.parse(localStorage.getItem('raspou_affiliates') || '[]');
    const savedAdmins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');

    setUsers(realUsers);
    setTransactions(savedTransactions);
    setAffiliates(savedAffiliates);
    setAdmins(savedAdmins);

    calculateStats(realUsers, savedTransactions, savedAffiliates);
  };