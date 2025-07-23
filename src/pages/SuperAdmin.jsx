@@ .. @@
         <div className="flex items-center justify-between mb-8">
    // Verificar login administrativo
    const adminLogged = JSON.parse(localStorage.getItem('raspou_admin_logged') || 'null');
    if (!adminLogged) {
      navigate('/super-admin-login');
      return;
    }
    
    if (!adminLogged.is_super_admin && adminLogged.role !== 'super_admin') {
      navigate('/admin'); // Redirecionar admin normal para seu painel
      return;
    }
    
    setCurrentAdmin(adminLogged);
    setIsSuperAdmin(true);
    
             <ArrowLeft className="w-6 h-6" />
           </button>
  }, [navigate]);
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
  // Verificar se é super admin através do sistema administrativo
    calculateStats(realUsers, savedTransactions, savedAffiliates);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
export default loadData