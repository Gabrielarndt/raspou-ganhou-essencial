import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { 
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  User,
  Trophy,
  Menu,
  X,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Gift,
  Check,
  AlertCircle,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para modais
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [showLotteryModal, setShowLotteryModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Estados para formulários
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    is_super_admin: false
  });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [affiliateForm, setAffiliateForm] = useState({
    name: '',
    email: '',
    password: '',
    affiliate_code: '',
    cpa: '',
    commission_rate: ''
  });
  const [editingAffiliate, setEditingAffiliate] = useState(null);

  const [lotteryForm, setLotteryForm] = useState({
    title: '',
    description: '',
    prize: '',
    draw_date: ''
  });
  const [editingLottery, setEditingLottery] = useState(null);

  const [userForm, setUserForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    saldo_real: '',
    saldo_bonus: ''
  });
  const [editingUser, setEditingUser] = useState(null);

  // Verificar se é admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/super-admin-login');
      return;
    }

    loadInitialData();
  }, [isAdmin, navigate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboard(),
        loadUsers(),
        loadTransactions(),
        loadAdmins(),
        loadAffiliates(),
        loadLotteries()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await apiClient.getAdminDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiClient.getAdminUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await apiClient.getAdminTransactions();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await apiClient.request('/admin/admins');
      setAdmins(response.admins || []);
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const loadAffiliates = async () => {
    try {
      const response = await apiClient.request('/admin/affiliates');
      setAffiliates(response.affiliates || []);
    } catch (error) {
      console.error('Error loading affiliates:', error);
    }
  };

  const loadLotteries = async () => {
    try {
      const response = await apiClient.request('/admin/lotteries');
      setLotteries(response.lotteries || []);
    } catch (error) {
      console.error('Error loading lotteries:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Funções para administradores
  const handleSaveAdmin = async () => {
    try {
      if (editingAdmin) {
        await apiClient.request('/admin/update-admin', {
          method: 'PUT',
          body: JSON.stringify({ admin_id: editingAdmin.id, ...adminForm })
        });
      } else {
        await apiClient.request('/admin/create-admin', {
          method: 'POST',
          body: JSON.stringify(adminForm)
        });
      }
      
      setAdminForm({ name: '', email: '', password: '', is_super_admin: false });
      setEditingAdmin(null);
      setShowAdminModal(false);
      await loadAdmins();
      alert(editingAdmin ? 'Administrador atualizado!' : 'Administrador criado!');
    } catch (error) {
      alert('Erro ao salvar administrador: ' + error.message);
    }
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      password: '',
      is_super_admin: admin.is_super_admin
    });
    setShowAdminModal(true);
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Tem certeza que deseja excluir este administrador?')) return;
    
    try {
      await apiClient.request('/admin/delete-admin', {
        method: 'DELETE',
        body: JSON.stringify({ admin_id: adminId })
      });
      await loadAdmins();
      alert('Administrador excluído!');
    } catch (error) {
      alert('Erro ao excluir administrador: ' + error.message);
    }
  };

  // Funções para afiliados
  const handleSaveAffiliate = async () => {
    try {
      if (editingAffiliate) {
        await apiClient.request('/admin/update-affiliate', {
          method: 'PUT',
          body: JSON.stringify({ affiliate_id: editingAffiliate.id, ...affiliateForm })
        });
      } else {
        await apiClient.request('/admin/create-affiliate', {
          method: 'POST',
          body: JSON.stringify(affiliateForm)
        });
      }
      
      setAffiliateForm({ name: '', email: '', password: '', affiliate_code: '', cpa: '', commission_rate: '' });
      setEditingAffiliate(null);
      setShowAffiliateModal(false);
      await loadAffiliates();
      alert(editingAffiliate ? 'Afiliado atualizado!' : 'Afiliado criado!');
    } catch (error) {
      alert('Erro ao salvar afiliado: ' + error.message);
    }
  };

  const handleEditAffiliate = (affiliate) => {
    setEditingAffiliate(affiliate);
    setAffiliateForm({
      name: affiliate.name,
      email: affiliate.email,
      password: '',
      affiliate_code: affiliate.affiliate_code,
      cpa: affiliate.cpa,
      commission_rate: affiliate.commission_rate
    });
    setShowAffiliateModal(true);
  };

  const handleDeleteAffiliate = async (affiliateId) => {
    if (!window.confirm('Tem certeza que deseja excluir este afiliado?')) return;
    
    try {
      await apiClient.request('/admin/delete-affiliate', {
        method: 'DELETE',
        body: JSON.stringify({ affiliate_id: affiliateId })
      });
      await loadAffiliates();
      alert('Afiliado excluído!');
    } catch (error) {
      alert('Erro ao excluir afiliado: ' + error.message);
    }
  };

  // Funções para sorteios
  const handleSaveLottery = async () => {
    try {
      const lotteryData = {
        title: lotteryForm.title,
        description: lotteryForm.description,
        prize: parseFloat(lotteryForm.prize),
        draw_date: lotteryForm.draw_date,
        created_by: user.id
      };

      if (editingLottery) {
        await apiClient.request('/admin/update-lottery', {
          method: 'PUT',
          body: JSON.stringify({ lottery_id: editingLottery.id, ...lotteryData })
        });
      } else {
        await apiClient.request('/admin/create-lottery', {
          method: 'POST',
          body: JSON.stringify(lotteryData)
        });
      }
      
      setLotteryForm({ title: '', description: '', prize: '', draw_date: '' });
      setEditingLottery(null);
      setShowLotteryModal(false);
      await loadLotteries();
      alert(editingLottery ? 'Sorteio atualizado!' : 'Sorteio criado!');
    } catch (error) {
      alert('Erro ao salvar sorteio: ' + error.message);
    }
  };

  const handleEditLottery = (lottery) => {
    setEditingLottery(lottery);
    setLotteryForm({
      title: lottery.title,
      description: lottery.description,
      prize: lottery.prize,
      draw_date: lottery.draw_date.split('T')[0] + 'T' + lottery.draw_date.split('T')[1].substring(0, 5)
    });
    setShowLotteryModal(true);
  };

  const handleDeleteLottery = async (lotteryId) => {
    if (!window.confirm('Tem certeza que deseja excluir este sorteio?')) return;
    
    try {
      await apiClient.request('/admin/delete-lottery', {
        method: 'DELETE',
        body: JSON.stringify({ lottery_id: lotteryId })
      });
      await loadLotteries();
      alert('Sorteio excluído!');
    } catch (error) {
      alert('Erro ao excluir sorteio: ' + error.message);
    }
  };

  // Funções para usuários
  const handleSaveUser = async () => {
    try {
      await apiClient.request('/admin/update-user', {
        method: 'PUT',
        body: JSON.stringify({ user_id: editingUser.id, ...userForm })
      });
      
      setUserForm({ nome: '', email: '', telefone: '', saldo_real: '', saldo_bonus: '' });
      setEditingUser(null);
      setShowUserModal(false);
      await loadUsers();
      alert('Usuário atualizado!');
    } catch (error) {
      alert('Erro ao salvar usuário: ' + error.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      saldo_real: user.saldo_real,
      saldo_bonus: user.saldo_bonus
    });
    setShowUserModal(true);
  };

  const handleApproveWithdraw = async (transactionId) => {
    try {
      await apiClient.approveWithdraw(transactionId);
      await loadTransactions();
      alert('Saque aprovado!');
    } catch (error) {
      alert('Erro ao aprovar saque: ' + error.message);
    }
  };

  const handleRejectWithdraw = async (transactionId) => {
    if (!window.confirm('Tem certeza que deseja rejeitar este saque?')) return;
    
    try {
      await apiClient.rejectWithdraw(transactionId);
      await loadTransactions();
      alert('Saque rejeitado!');
    } catch (error) {
      alert('Erro ao rejeitar saque: ' + error.message);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      apiClient.logout();
      navigate('/super-admin-login');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'transactions', label: 'Transações', icon: DollarSign },
    { id: 'admins', label: 'Administradores', icon: User },
    { id: 'affiliates', label: 'Afiliados', icon: TrendingUp },
    { id: 'lotteries', label: 'Sorteios', icon: Trophy },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  // Filtros
  const filteredUsers = users.filter(user => 
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(transaction => 
    transaction.users?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-red-400 animate-spin mx-auto mb-4" />
          <div className="text-red-400 text-xl">Carregando painel administrativo...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 border-r border-gray-800">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="text-red-400 font-bold">Painel Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <div className="mb-4 text-center">
            <p className="text-gray-400 text-sm">Logado como:</p>
            <p className="text-white font-medium">{user?.name || user?.email}</p>
            <p className="text-red-400 text-xs">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="relative flex flex-col w-64 bg-gray-900 border-r border-gray-800 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <span className="text-red-400 font-bold">Painel Admin</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header Mobile */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-gray-900 border-b border-gray-800">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-red-400">Painel Admin</h1>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
                <button
                  onClick={loadDashboard}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Atualizar</span>
                </button>
              </div>
              
              {/* Métricas principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Usuários</p>
                      <p className="text-white text-2xl font-bold">{dashboardData.stats?.total_users || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Depósitos</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(dashboardData.stats?.total_deposits || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Saques</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(dashboardData.stats?.total_withdraws || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Receita</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(dashboardData.stats?.total_revenue || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transações Recentes */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Transações Recentes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usuário</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {(dashboardData.recent_transactions || []).slice(0, 5).map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-700">
                          <td className="px-4 py-4 text-sm text-white">{transaction.users?.nome || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.type === 'deposit' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-white">{formatCurrency(transaction.amount)}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : transaction.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status === 'completed' ? 'Concluído' : 
                               transaction.status === 'processing' ? 'Processando' : 'Rejeitado'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">{formatDateTime(transaction.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Usuários */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Usuários</h1>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <button
                    onClick={loadUsers}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Saldo Real</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Saldo Bônus</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Jogos</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cadastro</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-700">
                          <td className="px-4 py-4 text-sm text-white">{user.nome}</td>
                          <td className="px-4 py-4 text-sm text-gray-300">{user.email}</td>
                          <td className="px-4 py-4 text-sm text-green-400">{formatCurrency(user.saldo_real)}</td>
                          <td className="px-4 py-4 text-sm text-blue-400">{formatCurrency(user.saldo_bonus)}</td>
                          <td className="px-4 py-4 text-sm text-white">{user.jogos_realizados || 0}</td>
                          <td className="px-4 py-4 text-sm text-gray-300">{formatDate(user.created_at)}</td>
                          <td className="px-4 py-4 text-sm">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-400 hover:text-blue-300 mr-2"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Transações */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Transações</h1>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar transações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <button
                    onClick={loadTransactions}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usuário</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Método</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-700">
                          <td className="px-4 py-4 text-sm text-white">{transaction.users?.nome || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.type === 'deposit' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">{transaction.method}</td>
                          <td className="px-4 py-4 text-sm text-white">{formatCurrency(transaction.amount)}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : transaction.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status === 'completed' ? 'Concluído' : 
                               transaction.status === 'processing' ? 'Processando' : 'Rejeitado'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">{formatDateTime(transaction.created_at)}</td>
                          <td className="px-4 py-4 text-sm">
                            {transaction.type === 'withdraw' && transaction.status === 'processing' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApproveWithdraw(transaction.id)}
                                  className="text-green-400 hover:text-green-300"
                                  title="Aprovar"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectWithdraw(transaction.id)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Rejeitar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Administradores */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Administradores</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setEditingAdmin(null);
                      setAdminForm({ name: '', email: '', password: '', is_super_admin: false });
                      setShowAdminModal(true);
                    }}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Admin</span>
                  </button>
                  <button
                    onClick={loadAdmins}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Criado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-700">
                          <td className="px-4 py-4 text-sm text-white">{admin.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-300">{admin.email}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              admin.is_super_admin 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {admin.is_super_admin ? 'Super Admin' : 'Admin'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">{formatDate(admin.created_at)}</td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditAdmin(admin)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {!admin.is_super_admin && (
                                <button
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Afiliados */}
          {activeTab === 'affiliates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Afiliados</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setEditingAffiliate(null);
                      setAffiliateForm({ name: '', email: '', password: '', affiliate_code: '', cpa: '', commission_rate: '' });
                      setShowAffiliateModal(true);
                    }}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Afiliado</span>
                  </button>
                  <button
                    onClick={loadAffiliates}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Código</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">CPA</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Comissão</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Indicações</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="hover:bg-gray-700">
                          <td className="px-4 py-4 text-sm text-white">{affiliate.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-300">{affiliate.email}</td>
                          <td className="px-4 py-4 text-sm text-yellow-400 font-mono">{affiliate.affiliate_code}</td>
                          <td className="px-4 py-4 text-sm text-green-400">{formatCurrency(affiliate.cpa)}</td>
                          <td className="px-4 py-4 text-sm text-blue-400">{affiliate.commission_rate}%</td>
                          <td className="px-4 py-4 text-sm text-white">{affiliate.referrals || 0}</td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditAffiliate(affiliate)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAffiliate(affiliate.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sorteios */}
          {activeTab === 'lotteries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Sorteios</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setEditingLottery(null);
                      setLotteryForm({ title: '', description: '', prize: '', draw_date: '' });
                      setShowLotteryModal(true);
                    }}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Sorteio</span>
                  </button>
                  <button
                    onClick={loadLotteries}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Título</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Prêmio</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Data Sorteio</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Participantes</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {lotteries.map((lottery) => (
                        <tr key={lottery.id} className="hover:bg-gray-700">
                          <td className="px-4 py-4 text-sm text-white">{lottery.title}</td>
                          <td className="px-4 py-4 text-sm text-yellow-400">{formatCurrency(lottery.prize)}</td>
                          <td className="px-4 py-4 text-sm text-gray-300">{formatDateTime(lottery.draw_date)}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              lottery.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : lottery.status === 'finished'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {lottery.status === 'active' ? 'Ativo' : 
                               lottery.status === 'finished' ? 'Finalizado' : 'Cancelado'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-white">{lottery.total_participants || 0}</td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditLottery(lottery)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLottery(lottery.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Configurações */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Configurações do Sistema</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Configurações Gerais</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Site</label>
                      <input
                        type="text"
                        defaultValue="RaspouGanhou"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email de Contato</label>
                      <input
                        type="email"
                        defaultValue="contato@raspouganhou.com"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Telefone de Suporte</label>
                      <input
                        type="tel"
                        defaultValue="(11) 9999-9999"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Configurações de Jogos</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Vitória Padrão (%)</label>
                      <input
                        type="number"
                        defaultValue="30"
                        min="1"
                        max="100"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bônus de Depósito (%)</label>
                      <input
                        type="number"
                        defaultValue="10"
                        min="0"
                        max="100"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Pontos por Jogo</label>
                      <input
                        type="number"
                        defaultValue="10"
                        min="1"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Admin */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingAdmin ? 'Editar Administrador' : 'Adicionar Administrador'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Nome do administrador"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha {editingAdmin && '(deixe vazio para manter)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="Senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_super_admin"
                  checked={adminForm.is_super_admin}
                  onChange={(e) => setAdminForm({...adminForm, is_super_admin: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="is_super_admin" className="text-sm text-gray-300">
                  Super Administrador
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSaveAdmin}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {editingAdmin ? 'Atualizar' : 'Adicionar'}
              </button>
              
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  setEditingAdmin(null);
                  setAdminForm({ name: '', email: '', password: '', is_super_admin: false });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Afiliado */}
      {showAffiliateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingAffiliate ? 'Editar Afiliado' : 'Adicionar Afiliado'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={affiliateForm.name}
                  onChange={(e) => setAffiliateForm({...affiliateForm, name: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nome do afiliado"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={affiliateForm.email}
                  onChange={(e) => setAffiliateForm({...affiliateForm, email: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha {editingAffiliate && '(deixe vazio para manter)'}
                </label>
                <input
                  type="password"
                  value={affiliateForm.password}
                  onChange={(e) => setAffiliateForm({...affiliateForm, password: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Senha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Código do Afiliado</label>
                <input
                  type="text"
                  value={affiliateForm.affiliate_code}
                  onChange={(e) => setAffiliateForm({...affiliateForm, affiliate_code: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Deixe vazio para gerar automaticamente"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CPA (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={affiliateForm.cpa}
                    onChange={(e) => setAffiliateForm({...affiliateForm, cpa: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Comissão (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={affiliateForm.commission_rate}
                    onChange={(e) => setAffiliateForm({...affiliateForm, commission_rate: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSaveAffiliate}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {editingAffiliate ? 'Atualizar' : 'Adicionar'}
              </button>
              
              <button
                onClick={() => {
                  setShowAffiliateModal(false);
                  setEditingAffiliate(null);
                  setAffiliateForm({ name: '', email: '', password: '', affiliate_code: '', cpa: '', commission_rate: '' });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sorteio */}
      {showLotteryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingLottery ? 'Editar Sorteio' : 'Criar Sorteio'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                <input
                  type="text"
                  value={lotteryForm.title}
                  onChange={(e) => setLotteryForm({...lotteryForm, title: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Sorteio Diário"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={lotteryForm.description}
                  onChange={(e) => setLotteryForm({...lotteryForm, description: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Descrição do sorteio"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prêmio (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={lotteryForm.prize}
                  onChange={(e) => setLotteryForm({...lotteryForm, prize: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="1000.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data e Hora do Sorteio</label>
                <input
                  type="datetime-local"
                  value={lotteryForm.draw_date}
                  onChange={(e) => setLotteryForm({...lotteryForm, draw_date: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSaveLottery}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {editingLottery ? 'Atualizar' : 'Criar'}
              </button>
              
              <button
                onClick={() => {
                  setShowLotteryModal(false);
                  setEditingLottery(null);
                  setLotteryForm({ title: '', description: '', prize: '', draw_date: '' });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Usuário */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Editar Usuário</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={userForm.nome}
                  onChange={(e) => setUserForm({...userForm, nome: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={userForm.telefone}
                  onChange={(e) => setUserForm({...userForm, telefone: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Saldo Real (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={userForm.saldo_real}
                    onChange={(e) => setUserForm({...userForm, saldo_real: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Saldo Bônus (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={userForm.saldo_bonus}
                    onChange={(e) => setUserForm({...userForm, saldo_bonus: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSaveUser}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Atualizar
              </button>
              
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setUserForm({ nome: '', email: '', telefone: '', saldo_real: '', saldo_bonus: '' });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;