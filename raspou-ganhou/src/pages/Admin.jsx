import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { 
  BarChart3,
  Users, 
  CreditCard, 
  TrendingUp,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  DollarSign,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock,
  Menu,
  X,
  LogOut,
  Shield,
  Activity,
  UserCheck,
  Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dateFilter, setDateFilter] = useState('30d');
  const [dataLoading, setDataLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Carregar dados do admin do localStorage se não estiver no contexto
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAdminUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, []);

  // Verificar se é admin usando dados do contexto ou localStorage
  const currentUser = user || adminUser;
  const isAdmin = currentUser?.role === 'admin' || 
                  currentUser?.role === 'super_admin' || 
                  currentUser?.is_super_admin;

  useEffect(() => {
    if (loading) return; // Aguardar carregamento do contexto
    
    if (!isAdmin) {
      console.log('Not admin, redirecting to login');
      navigate('/super-admin-login');
      return;
    }

    console.log('Admin verified, loading data');
    loadData();
  }, [isAdmin, navigate, loading]);

  const loadData = async () => {
    try {
      if (activeTab === 'dashboard') {
        const dashboardData = await apiClient.getAdminDashboard();
        setStats(dashboardData.stats);
        setTransactions(dashboardData.recent_transactions);
        setUsers(dashboardData.active_users);
      } else if (activeTab === 'users') {
        const usersData = await apiClient.getAdminUsers();
        setUsers(usersData.users);
      } else if (activeTab === 'transactions') {
        const transactionsData = await apiClient.getAdminTransactions();
        setTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Recarregar dados quando mudar de aba
  useEffect(() => {
    if (isAdmin && !loading) {
      loadData();
    }
  }, [activeTab, isAdmin, loading]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleApproveWithdraw = async (transactionId) => {
    try {
      await apiClient.approveWithdraw(transactionId);
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Error approving withdraw:', error);
      alert('Erro ao aprovar saque: ' + error.message);
    }
  };

  const handleRejectWithdraw = async (transactionId) => {
    try {
      await apiClient.rejectWithdraw(transactionId);
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Error rejecting withdraw:', error);
      alert('Erro ao rejeitar saque: ' + error.message);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      apiClient.logout();
      navigate('/super-admin-login');
    }
  };

  // Dados para gráficos (simulados)
  const chartData = [
    { name: 'Jan', usuarios: 120, receita: 15000, jogos: 450 },
    { name: 'Fev', usuarios: 180, receita: 22000, jogos: 680 },
    { name: 'Mar', usuarios: 250, receita: 31000, jogos: 920 },
    { name: 'Abr', usuarios: 320, receita: 42000, jogos: 1200 },
    { name: 'Mai', usuarios: 280, receita: 38000, jogos: 1050 },
    { name: 'Jun', usuarios: 350, receita: 48000, jogos: 1400 },
  ];

  const pieData = [
    { name: 'Depósitos', value: stats.total_deposits || 0, color: '#10B981' },
    { name: 'Saques', value: stats.total_withdraws || 0, color: '#EF4444' },
    { name: 'Comissões', value: (stats.total_revenue || 0) * 0.1, color: '#F59E0B' },
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'transactions', label: 'Transações', icon: CreditCard },
    { id: 'games', label: 'Jogos', icon: Trophy },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

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
              <Shield className="w-4 h-4 text-white" />
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
          <div className="relative flex flex-col w-64 bg-gray-900 border-r border-gray-800 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
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
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header com filtros */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard Administrativo</h1>
                  <p className="text-gray-400">Visão geral da plataforma e métricas principais</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {['1d', '7d', '30d', '90d', '180d', '365d', 'all'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setDateFilter(period)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        dateFilter === period
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:text-white'
                      }`}
                    >
                      {period === '1d' ? 'Hoje' : 
                       period === '7d' ? '7 dias' :
                       period === '30d' ? '30 dias' :
                       period === '90d' ? '3 meses' :
                       period === '180d' ? '6 meses' :
                       period === '365d' ? '1 ano' : 'Tudo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estatísticas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total de Usuários</p>
                      <p className="text-white text-2xl font-bold">{stats.total_users || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Receita Total</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(stats.total_revenue || 0)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Depósitos</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(stats.total_deposits || 0)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Saques Pendentes</p>
                      <p className="text-white text-2xl font-bold">{stats.pending_withdraws || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Usuários */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>Crescimento de Usuários</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="usuarios" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Receita */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span>Receita Mensal</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="receita" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Jogos */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span>Jogos Realizados</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }} 
                        />
                        <Bar dataKey="jogos" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Pizza - Distribuição Financeira */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <span>Distribuição Financeira</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value) => [formatCurrency(value), '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-300 text-sm">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Atividade Recente */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span>Transações Recentes</span>
                  </h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.type === 'deposit' ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                            </p>
                            <p className="text-gray-400 text-xs">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <p className={`font-bold ${
                          transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-green-400" />
                    <span>Usuários Ativos</span>
                  </h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{user.nome?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{user.nome}</p>
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                        <p className="text-green-400 font-bold text-sm">
                          {formatCurrency((user.saldo_real || 0) + (user.saldo_bonus || 0))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usuários */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Gerenciar Usuários</h1>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Novo Usuário</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Saldo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cadastro</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">{user.nome?.charAt(0)}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{user.nome}</div>
                                <div className="text-sm text-gray-400">{user.cpf}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">
                            {formatCurrency(user.saldo_real || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.created_at ? formatDate(user.created_at) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-400 hover:text-blue-300">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-yellow-400 hover:text-yellow-300">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-400 hover:text-red-300">
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

          {/* Transações */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Gerenciar Transações</h1>
                <div className="flex gap-2">
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filtrar</span>
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Método</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{transaction.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === 'deposit' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                            <span className={transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                              {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{transaction.method}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : transaction.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {transaction.status === 'processing' && <Clock className="w-3 h-3 mr-1" />}
                              {transaction.status === 'rejected' && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {transaction.status === 'completed' ? 'Concluído' : 
                               transaction.status === 'processing' ? 'Processando' : 'Rejeitado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(transaction.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {transaction.type === 'withdraw' && transaction.status === 'processing' && (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleApproveWithdraw(transaction.id)}
                                  className="text-green-400 hover:text-green-300"
                                  title="Aprovar"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleRejectWithdraw(transaction.id)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Rejeitar"
                                >
                                  <AlertTriangle className="w-4 h-4" />
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

          {/* Jogos */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Gerenciar Jogos</h1>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Configurações de Raspadinhas</h3>
                <div className="text-center py-8">
                  <p className="text-gray-400">Configurações de jogos serão implementadas em breve</p>
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
                  <h3 className="text-white font-bold text-lg mb-4">Configurações Gerais</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Site</label>
                      <input
                        type="text"
                        defaultValue="RaspouGanhou"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email de Contato</label>
                      <input
                        type="email"
                        defaultValue="contato@raspouganhou.com"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Telefone de Suporte</label>
                      <input
                        type="tel"
                        defaultValue="(11) 9999-9999"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Configurações de Pagamento</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Valor Mínimo de Depósito</label>
                      <input
                        type="number"
                        defaultValue="10"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Valor Mínimo de Saque</label>
                      <input
                        type="number"
                        defaultValue="20"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Saque (%)</label>
                      <input
                        type="number"
                        defaultValue="0"
                        step="0.01"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;