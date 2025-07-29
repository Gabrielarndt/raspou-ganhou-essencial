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
  UserPlus,
  Edit,
  Trash2,
  Save,
  X,
  Menu,
  LogOut,
  Shield,
  Crown,
  Gift,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  // Estados para dados
  const [dashboardStats, setDashboardStats] = useState({});
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lotteries, setLotteries] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [affiliates, setAffiliates] = useState([]);

  // Estados para formulários
  const [showUserForm, setShowUserForm] = useState(false);
  const [showLotteryForm, setShowLotteryForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showAffiliateForm, setShowAffiliateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingLottery, setEditingLottery] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editingAffiliate, setEditingAffiliate] = useState(null);

  // Formulários
  const [userForm, setUserForm] = useState({
    nome: '', email: '', telefone: '', saldo_real: '', saldo_bonus: ''
  });
  const [lotteryForm, setLotteryForm] = useState({
    title: '', description: '', prize: '', draw_date: '', status: 'active'
  });
  const [adminForm, setAdminForm] = useState({
    name: '', email: '', password: '', is_super_admin: false
  });
  const [affiliateForm, setAffiliateForm] = useState({
    name: '', email: '', password: '', cpa: '', commission_rate: ''
  });

  // Verificar autenticação
  useEffect(() => {
    console.log('🔍 Admin: Starting auth check...');
    
    try {
      const stored = localStorage.getItem('user');
      console.log('📦 Admin: Raw stored data:', stored);
      
      if (stored) {
        const userData = JSON.parse(stored);
        console.log('📦 Admin: Stored user data:', userData);
        
        if (userData.role === 'admin' || userData.role === 'super_admin') {
          console.log('✅ Admin: Found admin in localStorage');
          setAdminData(userData);
          loadDashboardData();
        } else {
          console.log('❌ Admin: User data found but not an admin:', userData);
          navigate('/super-admin-login');
          return;
        }
      } else {
        console.log('❌ Admin: No user data in localStorage');
        navigate('/super-admin-login');
        return;
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      navigate('/super-admin-login');
      return;
    }
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const [dashboardData, usersData, transactionsData, lotteriesData, adminsData, affiliatesData] = await Promise.all([
        apiClient.getAdminDashboard(),
        apiClient.getAdminUsers(),
        apiClient.getAdminTransactions(),
        apiClient.getLotteries(),
        apiClient.getAdmins(),
        apiClient.getAffiliates()
      ]);

      setDashboardStats(dashboardData.stats || {});
      setUsers(usersData.users || []);
      setTransactions(transactionsData.transactions || []);
      setLotteries(lotteriesData.lotteries || []);
      setAdmins(adminsData.admins || []);
      setAffiliates(affiliatesData.affiliates || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAffiliates = async () => {
    try {
      const data = await apiClient.getAffiliates();
      setAffiliates(data.affiliates || []);
    } catch (error) {
      console.error('Erro ao carregar afiliados:', error);
      setAffiliates([]);
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

  const handleUpdateUser = async () => {
    try {
      await apiClient.updateUser(editingUser.id, userForm);
      await loadDashboardData();
      setEditingUser(null);
      setShowUserForm(false);
      setUserForm({ nome: '', email: '', telefone: '', saldo_real: '', saldo_bonus: '' });
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar usuário: ' + error.message);
    }
  };

  const handleCreateLottery = async () => {
    try {
      await apiClient.createLottery({
        ...lotteryForm,
        created_by: adminData.id
      });
      await loadDashboardData();
      setShowLotteryForm(false);
      setLotteryForm({ title: '', description: '', prize: '', draw_date: '', status: 'active' });
      alert('Sorteio criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar sorteio: ' + error.message);
    }
  };

  const handleUpdateLottery = async () => {
    try {
      await apiClient.updateLottery(editingLottery.id, lotteryForm);
      await loadDashboardData();
      setEditingLottery(null);
      setShowLotteryForm(false);
      setLotteryForm({ title: '', description: '', prize: '', draw_date: '', status: 'active' });
      alert('Sorteio atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar sorteio: ' + error.message);
    }
  };

  const handleDeleteLottery = async (lotteryId) => {
    if (window.confirm('Tem certeza que deseja excluir este sorteio?')) {
      try {
        await apiClient.deleteLottery(lotteryId);
        await loadDashboardData();
        alert('Sorteio excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir sorteio: ' + error.message);
      }
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await apiClient.createAdmin(adminForm);
      await loadDashboardData();
      setShowAdminForm(false);
      setAdminForm({ name: '', email: '', password: '', is_super_admin: false });
      alert('Admin criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar admin: ' + error.message);
    }
  };

  const handleUpdateAdmin = async () => {
    try {
      await apiClient.updateAdmin(editingAdmin.id, adminForm);
      await loadDashboardData();
      setEditingAdmin(null);
      setShowAdminForm(false);
      setAdminForm({ name: '', email: '', password: '', is_super_admin: false });
      alert('Admin atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar admin: ' + error.message);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Tem certeza que deseja excluir este admin?')) {
      try {
        await apiClient.deleteAdmin(adminId);
        await loadDashboardData();
        alert('Admin excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir admin: ' + error.message);
      }
    }
  };

  const handleCreateAffiliate = async () => {
    try {
      // Criar afiliado via API
      const result = await apiClient.createAffiliate({
        name: affiliateForm.name,
        email: affiliateForm.email,
        password: affiliateForm.password,
        cpa: parseFloat(affiliateForm.cpa || 0),
        commission_rate: parseFloat(affiliateForm.commission_rate || 0)
      });
      
      // Recarregar lista de afiliados
      await loadAffiliates();
      
      // Limpar formulário e fechar modal
      setShowAffiliateForm(false);
      setAffiliateForm({ name: '', email: '', password: '', cpa: '', commission_rate: '' });
      
      alert('Afiliado criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar afiliado:', error);
      alert('Erro ao criar afiliado: ' + error.message);
    }
  };

  const handleUpdateAffiliate = async () => {
    try {
      await apiClient.updateAffiliate(editingAffiliate.id, {
        name: affiliateForm.name,
        email: affiliateForm.email,
        password: affiliateForm.password || undefined,
        cpa: parseFloat(affiliateForm.cpa || 0),
        commission_rate: parseFloat(affiliateForm.commission_rate || 0)
      });
      
      await loadAffiliates();
      setEditingAffiliate(null);
      setShowAffiliateForm(false);
      setAffiliateForm({ name: '', email: '', password: '', cpa: '', commission_rate: '' });
      alert('Afiliado atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar afiliado: ' + error.message);
    }
  };

  const handleDeleteAffiliate = async (affiliateId) => {
    if (window.confirm('Tem certeza que deseja excluir este afiliado?')) {
      try {
        await apiClient.deleteAffiliate(affiliateId);
        await loadAffiliates();
        alert('Afiliado excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir afiliado: ' + error.message);
      }
    }
  };

  const handleApproveWithdraw = async (transactionId) => {
    if (window.confirm('Tem certeza que deseja aprovar este saque?')) {
      try {
        await apiClient.approveWithdraw(transactionId);
        await loadDashboardData();
        alert('Saque aprovado com sucesso!');
      } catch (error) {
        alert('Erro ao aprovar saque: ' + error.message);
      }
    }
  };

  const handleRejectWithdraw = async (transactionId) => {
    if (window.confirm('Tem certeza que deseja rejeitar este saque? O valor será devolvido ao usuário.')) {
      try {
        await apiClient.rejectWithdraw(transactionId);
        await loadDashboardData();
        alert('Saque rejeitado e valor devolvido ao usuário!');
      } catch (error) {
        alert('Erro ao rejeitar saque: ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      apiClient.logout();
      navigate('/super-admin-login');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'transactions', label: 'Transações', icon: DollarSign },
    { id: 'lotteries', label: 'Sorteios', icon: Gift },
    { id: 'admins', label: 'Administradores', icon: Shield },
    { id: 'affiliates', label: 'Afiliados', icon: TrendingUp },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-red-400 text-xl">Carregando painel administrativo...</div>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl">Erro ao carregar dados do administrador</div>
          <button 
            onClick={() => navigate('/super-admin-login')}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 border-r border-gray-800">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="text-red-400 font-bold">Admin Panel</span>
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
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm">Logado como:</p>
            <p className="text-white font-medium">{adminData.name}</p>
            <p className="text-gray-400 text-xs">{adminData.email}</p>
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
          <div className="relative flex flex-col w-64 bg-gray-900 border-r border-gray-800">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <span className="text-red-400 font-bold">Admin Panel</span>
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
          <h1 className="text-lg font-bold text-red-400">Admin Panel</h1>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Usuários</p>
                      <p className="text-white text-2xl font-bold">{dashboardStats.total_users || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Depósitos</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(dashboardStats.total_deposits || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Saques</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(dashboardStats.total_withdraws || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Receita Líquida</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(dashboardStats.total_revenue || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Afiliados */}
          {activeTab === 'affiliates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Afiliados</h1>
                <button
                  onClick={() => setShowAffiliateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Afiliado</span>
                </button>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">CPA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Comissão</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Indicações</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{affiliate.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{affiliate.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-mono">{affiliate.affiliate_code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{formatCurrency(affiliate.cpa || 0)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">{affiliate.commission_rate || 0}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{affiliate.referrals || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => {
                                setEditingAffiliate(affiliate);
                                setAffiliateForm({
                                  name: affiliate.name,
                                  email: affiliate.email,
                                  password: '',
                                  cpa: affiliate.cpa || '',
                                  commission_rate: affiliate.commission_rate || ''
                                });
                                setShowAffiliateForm(true);
                              }}
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Outros tabs aqui... */}
        </div>
      </div>

      {/* Modal Afiliado */}
      {showAffiliateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingAffiliate ? 'Editar Afiliado' : 'Novo Afiliado'}
              </h3>
              <button
                onClick={() => {
                  setShowAffiliateForm(false);
                  setEditingAffiliate(null);
                  setAffiliateForm({ name: '', email: '', password: '', cpa: '', commission_rate: '' });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  {editingAffiliate ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
                </label>
                <input
                  type="password"
                  value={affiliateForm.password}
                  onChange={(e) => setAffiliateForm({...affiliateForm, password: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Senha"
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

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={editingAffiliate ? handleUpdateAffiliate : handleCreateAffiliate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  {editingAffiliate ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  onClick={() => {
                    setShowAffiliateForm(false);
                    setEditingAffiliate(null);
                    setAffiliateForm({ name: '', email: '', password: '', cpa: '', commission_rate: '' });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;