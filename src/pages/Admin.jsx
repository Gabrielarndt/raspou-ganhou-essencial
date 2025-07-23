@@ .. @@
    // Verificar login administrativo
    const adminLogged = JSON.parse(localStorage.getItem('raspou_admin_logged') || 'null');
    if (!adminLogged) {
      navigate('/super-admin-login');
      return;
    }
    
    setCurrentAdmin(adminLogged);
    setIsAdmin(true);
    
           >
             <ArrowLeft className="w-6 h-6" />
           </button>
  }, [navigate]);
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
  // Verificar se é admin através do sistema administrativo

    calculateStats(realUsers, savedTransactions, savedGames);
  };
  const [isAdmin, setIsAdmin] = useState(false);

export default loadData