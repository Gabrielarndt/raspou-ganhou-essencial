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
  Gift
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
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
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
              
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
            </div>
          )}

          {/* Gerenciar Administradores */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Gerenciar Administradores</h1>
              
              {/* Formulário */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  {editingAdmin ? 'Editar Administrador' : 'Adicionar Administrador'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingAdmin ? 'Atualizar' : 'Adicionar'}
                  </button>
                  
                  {editingAdmin && (
                    <button
                      onClick={() => {
                        setEditingAdmin(null);
                        setAdminForm({ name: '', email: '', password: '', is_super_admin: false });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de Administradores */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Administradores Cadastrados</h2>
                
                {admins.length === 0 ? (
                  <p className="text-gray-400">Nenhum administrador encontrado</p>
                ) : (
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
                )}
              </div>
            </div>
          )}

          {/* Outras abas podem ser implementadas aqui */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Usuários</h1>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400">Lista de usuários será implementada aqui</p>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Transações</h1>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400">Lista de transações será implementada aqui</p>
              </div>
            </div>
          )}

          {activeTab === 'affiliates' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Afiliados</h1>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400">Gerenciamento de afiliados será implementado aqui</p>
              </div>
            </div>
          )}

          {activeTab === 'lotteries' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Sorteios</h1>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400">Gerenciamento de sorteios será implementado aqui</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Configurações</h1>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400">Configurações do sistema serão implementadas aqui</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;