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
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Estados para Sorteios
  const [lotteries, setLotteries] = useState([]);
  const [showLotteryModal, setShowLotteryModal] = useState(false);
  const [lotteryForm, setLotteryForm] = useState({
    title: '',
    description: '',
    prize: '',
    draw_date: '',
    status: 'active'
  });
  const [editingLottery, setEditingLottery] = useState(null);

  // Estados para Admins
  const [admins, setAdmins] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    is_super_admin: false
  });
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Estados para Afiliados
  const [affiliates, setAffiliates] = useState([]);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [affiliateForm, setAffiliateForm] = useState({
    name: '',
    email: '',
    password: '',
    affiliate_code: '',
    cpa: '',
    commission_rate: ''
  });
  const [editingAffiliate, setEditingAffiliate] = useState(null);

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
  console.log('Current User:', currentUser);
console.log('Role:', currentUser?.role);
console.log('Is Super Admin flag:', currentUser?.is_super_admin);

  const isAdmin = currentUser?.role === 'admin' || 
                  currentUser?.role === 'super_admin' || 
                  currentUser?.is_super_admin;

 useEffect(() => {
  // Só execute depois que o loading acabar E o user estiver carregado (não null)
  if (loading) return;

  if (!currentUser) {
    // usuário ainda não carregado, pode ser que esteja buscando ainda
    console.log('User not loaded yet, aguardando...');
    return;
  }

  if (!isAdmin) {
    console.log('Not admin, redirecting to login');
    navigate('/super-admin-login');
    return;
  }

  console.log('Admin verified, loading data');
  loadData();
  loadLotteries();
  loadAdmins();
  loadAffiliates();

}, [isAdmin, navigate, loading, currentUser]);


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

  const loadLotteries = () => {
    try {
      const savedLotteries = JSON.parse(localStorage.getItem('raspou_lotteries') || '[]');
      setLotteries(savedLotteries);
    } catch (error) {
      console.error('Erro ao carregar sorteios:', error);
      setLotteries([]);
    }
  };

  const loadAdmins = () => {
    try {
      const savedAdmins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
      setAdmins(savedAdmins);
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
      setAdmins([]);
    }
  };

  const loadAffiliates = () => {
    try {
      const savedAffiliates = JSON.parse(localStorage.getItem('raspou_affiliates') || '[]');
      setAffiliates(savedAffiliates);
    } catch (error) {
      console.error('Erro ao carregar afiliados:', error);
      setAffiliates([]);
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

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || '',
      saldo_real: user.saldo_real || 0,
      saldo_bonus: user.saldo_bonus || 0
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      setIsLoading(true);
      
      // Fazer chamada à API para atualizar usuário
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/update-user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          ...editForm
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar usuário');
      }

      // Atualizar lista local de usuários
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...editForm }
          : user
      );
      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, ...editForm });
      setShowEditModal(false);
      alert('Usuário atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
      // Aqui você pode implementar a exclusão via API
      alert('Funcionalidade de exclusão será implementada em breve');
    }
  };

  // Funções para Sorteios
  const handleCreateLottery = () => {
    setEditingLottery(null);
    setLotteryForm({
      title: '',
      description: '',
      prize: '',
      draw_date: '',
      status: 'active'
    });
    setShowLotteryModal(true);
  };

  const handleEditLottery = (lottery) => {
    setEditingLottery(lottery);
    setLotteryForm({
      title: lottery.title,
      description: lottery.description || '',
      prize: lottery.prize.toString(),
      draw_date: lottery.draw_date.slice(0, 16), // Para datetime-local
      status: lottery.status
    });
    setShowLotteryModal(true);
  };

  const handleSaveLottery = () => {
    if (!lotteryForm.title || !lotteryForm.prize || !lotteryForm.draw_date) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const lotteryData = {
      id: editingLottery ? editingLottery.id : Date.now().toString(),
      title: lotteryForm.title,
      description: lotteryForm.description,
      prize: parseFloat(lotteryForm.prize),
      draw_date: lotteryForm.draw_date,
      status: lotteryForm.status,
      created_by: currentUser.id,
      created_at: editingLottery ? editingLottery.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_participants: editingLottery ? editingLottery.total_participants : 0,
      winner_id: editingLottery ? editingLottery.winner_id : null,
      winning_number: editingLottery ? editingLottery.winning_number : null
    };

    const updatedLotteries = editingLottery
      ? lotteries.map(l => l.id === editingLottery.id ? lotteryData : l)
      : [...lotteries, lotteryData];

    setLotteries(updatedLotteries);
    localStorage.setItem('raspou_lotteries', JSON.stringify(updatedLotteries));
    setShowLotteryModal(false);
    alert(editingLottery ? 'Sorteio atualizado!' : 'Sorteio criado!');
  };

  const handleDeleteLottery = (lottery) => {
    if (window.confirm(`Tem certeza que deseja excluir o sorteio "${lottery.title}"?`)) {
      const updatedLotteries = lotteries.filter(l => l.id !== lottery.id);
      setLotteries(updatedLotteries);
      localStorage.setItem('raspou_lotteries', JSON.stringify(updatedLotteries));
      alert('Sorteio excluído!');
    }
  };

  // Funções para Admins
  const handleCreateAdmin = () => {
    setEditingAdmin(null);
    setAdminForm({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      is_super_admin: false
    });
    setShowAdminModal(true);
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      is_super_admin: admin.is_super_admin
    });
    setShowAdminModal(true);
  };

  const handleSaveAdmin = () => {
    if (!adminForm.name || !adminForm.email || (!editingAdmin && !adminForm.password)) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se email já existe
    const emailExists = admins.some(a => 
      a.email === adminForm.email && (!editingAdmin || a.id !== editingAdmin.id)
    );

    if (emailExists) {
      alert('Este email já está em uso');
      return;
    }

    const adminData = {
      id: editingAdmin ? editingAdmin.id : Date.now().toString(),
      name: adminForm.name,
      email: adminForm.email,
      password: adminForm.password || (editingAdmin ? editingAdmin.password : ''),
      role: adminForm.role,
      is_super_admin: adminForm.is_super_admin,
      permissions: editingAdmin ? editingAdmin.permissions : [],
      created_at: editingAdmin ? editingAdmin.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedAdmins = editingAdmin
      ? admins.map(a => a.id === editingAdmin.id ? adminData : a)
      : [...admins, adminData];

    setAdmins(updatedAdmins);
    localStorage.setItem('raspou_admins', JSON.stringify(updatedAdmins));
    setShowAdminModal(false);
    alert(editingAdmin ? 'Admin atualizado!' : 'Admin criado!');
  };

  const handleDeleteAdmin = (admin) => {
    if (admin.is_super_admin) {
      alert('Não é possível excluir um Super Admin');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o admin "${admin.name}"?`)) {
      const updatedAdmins = admins.filter(a => a.id !== admin.id);
      setAdmins(updatedAdmins);
      localStorage.setItem('raspou_admins', JSON.stringify(updatedAdmins));
      alert('Admin excluído!');
    }
  };

  // Funções para Afiliados
  const handleCreateAffiliate = () => {
    setEditingAffiliate(null);
    setAffiliateForm({
      name: '',
      email: '',
      password: '',
      affiliate_code: '',
      cpa: '',
      commission_rate: ''
    });
    setShowAffiliateModal(true);
  };

  const handleEditAffiliate = (affiliate) => {
    setEditingAffiliate(affiliate);
    setAffiliateForm({
      name: affiliate.name,
      email: affiliate.email,
      password: '',
      affiliate_code: affiliate.affiliate_code,
      cpa: affiliate.cpa.toString(),
      commission_rate: affiliate.commission_rate.toString()
    });
    setShowAffiliateModal(true);
  };

  const handleSaveAffiliate = () => {
    if (!affiliateForm.name || !affiliateForm.email || !affiliateForm.affiliate_code || 
        (!editingAffiliate && !affiliateForm.password)) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se email ou código já existe
    const emailExists = affiliates.some(a => 
      a.email === affiliateForm.email && (!editingAffiliate || a.id !== editingAffiliate.id)
    );
    const codeExists = affiliates.some(a => 
      a.affiliate_code === affiliateForm.affiliate_code && (!editingAffiliate || a.id !== editingAffiliate.id)
    );

    if (emailExists) {
      alert('Este email já está em uso');
      return;
    }

    if (codeExists) {
      alert('Este código de afiliado já está em uso');
      return;
    }

    const affiliateData = {
      id: editingAffiliate ? editingAffiliate.id : Date.now().toString(),
      name: affiliateForm.name,
      email: affiliateForm.email,
      password: affiliateForm.password || (editingAffiliate ? editingAffiliate.password : ''),
      affiliate_code: affiliateForm.affiliate_code,
      cpa: parseFloat(affiliateForm.cpa) || 0,
      commission_rate: parseFloat(affiliateForm.commission_rate) || 0,
      referrals: editingAffiliate ? editingAffiliate.referrals : 0,
      volume_generated: editingAffiliate ? editingAffiliate.volume_generated : 0,
      total_commission: editingAffiliate ? editingAffiliate.total_commission : 0,
      conversion_rate: editingAffiliate ? editingAffiliate.conversion_rate : 0,
      notifications: editingAffiliate ? editingAffiliate.notifications : {
        frequency: 'realtime',
        newDeposits: true,
        newConversions: true,
        commissionChanges: true
      },
      security: editingAffiliate ? editingAffiliate.security : {
        twoFactor: false,
        lastAccess: null
      },
      created_at: editingAffiliate ? editingAffiliate.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedAffiliates = editingAffiliate
      ? affiliates.map(a => a.id === editingAffiliate.id ? affiliateData : a)
      : [...affiliates, affiliateData];

    setAffiliates(updatedAffiliates);
    localStorage.setItem('raspou_affiliates', JSON.stringify(updatedAffiliates));
    setShowAffiliateModal(false);
    alert(editingAffiliate ? 'Afiliado atualizado!' : 'Afiliado criado!');
  };

  const handleDeleteAffiliate = (affiliate) => {
    if (window.confirm(`Tem certeza que deseja excluir o afiliado "${affiliate.name}"?`)) {
      const updatedAffiliates = affiliates.filter(a => a.id !== affiliate.id);
      setAffiliates(updatedAffiliates);
      localStorage.setItem('raspou_affiliates', JSON.stringify(updatedAffiliates));
      alert('Afiliado excluído!');
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
    { id: 'lotteries', label: 'Sorteios', icon: Trophy },
    { id: 'admins', label: 'Admins', icon: Shield },
    { id: 'affiliates', label: 'Afiliados', icon: UserCheck },
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
                              <button 
                                onClick={() => handleViewUser(user)}
                                className="text-blue-400 hover:text-blue-300"
                                title="Visualizar usuário"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="text-yellow-400 hover:text-yellow-300"
                                title="Editar usuário"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-400 hover:text-red-300"
                                title="Excluir usuário"
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

          {/* Gerenciar Sorteios */}
          {activeTab === 'lotteries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gerenciar Sorteios</h2>
                <button
                  onClick={handleCreateLottery}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Sorteio</span>
                </button>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                {lotteries.length === 0 ? (
                  <div className="p-8 text-center">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum sorteio criado</h3>
                    <p className="text-gray-500 mb-4">Crie seu primeiro sorteio para começar</p>
                    <button
                      onClick={handleCreateLottery}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Criar Sorteio
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Título</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prêmio</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data do Sorteio</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Participantes</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        {lotteries.map((lottery) => (
                          <tr key={lottery.id} className="hover:bg-gray-700">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-white">{lottery.title}</div>
                                <div className="text-sm text-gray-400">{lottery.description}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-green-400 font-bold">
                              {formatCurrency(lottery.prize)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatDate(lottery.draw_date)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {lottery.total_participants || 0}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditLottery(lottery)}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLottery(lottery)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Excluir"
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
                )}
              </div>
            </div>
          )}

          {/* Gerenciar Admins */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gerenciar Administradores</h2>
                <button
                  onClick={handleCreateAdmin}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Admin</span>
                </button>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                {admins.length === 0 ? (
                  <div className="p-8 text-center">
                    <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum admin cadastrado</h3>
                    <p className="text-gray-500 mb-4">Adicione administradores para gerenciar o sistema</p>
                    <button
                      onClick={handleCreateAdmin}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Adicionar Admin
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Criado em</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        {admins.map((admin) => (
                          <tr key={admin.id} className="hover:bg-gray-700">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">
                                    {admin.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-white">{admin.name}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {admin.email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                admin.is_super_admin 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {admin.is_super_admin ? 'Super Admin' : 'Admin'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatDate(admin.created_at)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditAdmin(admin)}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {!admin.is_super_admin && (
                                  <button
                                    onClick={() => handleDeleteAdmin(admin)}
                                    className="text-red-400 hover:text-red-300"
                                    title="Excluir"
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

          {/* Gerenciar Afiliados */}
          {activeTab === 'affiliates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gerenciar Afiliados</h2>
                <button
                  onClick={handleCreateAffiliate}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Afiliado</span>
                </button>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                {affiliates.length === 0 ? (
                  <div className="p-8 text-center">
                    <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum afiliado cadastrado</h3>
                    <p className="text-gray-500 mb-4">Adicione afiliados para expandir sua rede</p>
                    <button
                      onClick={handleCreateAffiliate}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Adicionar Afiliado
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Código</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">CPA</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Comissão</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Indicações</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        {affiliates.map((affiliate) => (
                          <tr key={affiliate.id} className="hover:bg-gray-700">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">
                                    {affiliate.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-white">{affiliate.name}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {affiliate.email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-yellow-400 font-mono">
                              {affiliate.affiliate_code}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-green-400">
                              {formatCurrency(affiliate.cpa)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-400">
                              {affiliate.commission_rate}%
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {affiliate.referrals || 0}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditAffiliate(affiliate)}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAffiliate(affiliate)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Excluir"
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
                )}
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

      {/* Modal de Sorteio */}
      {showLotteryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingLottery ? 'Editar Sorteio' : 'Novo Sorteio'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                <input
                  type="text"
                  value={lotteryForm.title}
                  onChange={(e) => setLotteryForm({...lotteryForm, title: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Ex: Sorteio Diário"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={lotteryForm.description}
                  onChange={(e) => setLotteryForm({...lotteryForm, description: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Descrição do sorteio"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prêmio (R$)</label>
                <input
                  type="number"
                  value={lotteryForm.prize}
                  onChange={(e) => setLotteryForm({...lotteryForm, prize: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="1000.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data do Sorteio</label>
                <input
                  type="datetime-local"
                  value={lotteryForm.draw_date}
                  onChange={(e) => setLotteryForm({...lotteryForm, draw_date: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={lotteryForm.status}
                  onChange={(e) => setLotteryForm({...lotteryForm, status: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="active">Ativo</option>
                  <option value="finished">Finalizado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
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
                onClick={() => setShowLotteryModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Admin */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingAdmin ? 'Editar Admin' : 'Novo Admin'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="admin@exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {editingAdmin ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
                </label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder={editingAdmin ? "Nova senha (opcional)" : "Senha"}
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={adminForm.is_super_admin}
                    onChange={(e) => setAdminForm({...adminForm, is_super_admin: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">Super Administrador</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSaveAdmin}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {editingAdmin ? 'Atualizar' : 'Criar'}
              </button>
              <button
                onClick={() => setShowAdminModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Afiliado */}
      {showAffiliateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingAffiliate ? 'Editar Afiliado' : 'Novo Afiliado'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={affiliateForm.name}
                  onChange={(e) => setAffiliateForm({...affiliateForm, name: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={affiliateForm.email}
                  onChange={(e) => setAffiliateForm({...affiliateForm, email: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="afiliado@exemplo.com"
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
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder={editingAffiliate ? "Nova senha (opcional)" : "Senha"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Código de Afiliado</label>
                <input
                  type="text"
                  value={affiliateForm.affiliate_code}
                  onChange={(e) => setAffiliateForm({...affiliateForm, affiliate_code: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="AFILIADO123"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CPA (R$)</label>
                  <input
                    type="number"
                    value={affiliateForm.cpa}
                    onChange={(e) => setAffiliateForm({...affiliateForm, cpa: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="50.00"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Comissão (%)</label>
                  <input
                    type="number"
                    value={affiliateForm.commission_rate}
                    onChange={(e) => setAffiliateForm({...affiliateForm, commission_rate: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="10.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSaveAffiliate}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {editingAffiliate ? 'Atualizar' : 'Criar'}
              </button>
              <button
                onClick={() => setShowAffiliateModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização de Usuário */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalhes do Usuário</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedUser.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{selectedUser.nome}</h4>
                  <p className="text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">CPF</p>
                  <p className="text-white font-medium">{selectedUser.cpf}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Telefone</p>
                  <p className="text-white font-medium">{selectedUser.telefone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Saldo Real</p>
                  <p className="text-green-400 font-bold">{formatCurrency(selectedUser.saldo_real || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Saldo Bônus</p>
                  <p className="text-blue-400 font-bold">{formatCurrency(selectedUser.saldo_bonus || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Pontos Sorteio</p>
                  <p className="text-purple-400 font-bold">{selectedUser.pontos_sorteio || 0} pts</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Jogos Realizados</p>
                  <p className="text-yellow-400 font-bold">{selectedUser.jogos_realizados || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Ganho</p>
                  <p className="text-green-400 font-bold">{formatCurrency(selectedUser.total_ganho || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Nível VIP</p>
                  <p className="text-yellow-400 font-bold">{selectedUser.nivel_vip || 'Bronze'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Data de Cadastro</p>
                <p className="text-white font-medium">
                  {selectedUser.created_at ? formatDate(selectedUser.created_at) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  handleEditUser(selectedUser);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Usuário */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Usuário</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={editForm.telefone}
                  onChange={(e) => setEditForm({...editForm, telefone: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Saldo Real</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.saldo_real}
                    onChange={(e) => setEditForm({...editForm, saldo_real: parseFloat(e.target.value) || 0})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Saldo Bônus</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.saldo_bonus}
                    onChange={(e) => setEditForm({...editForm, saldo_bonus: parseFloat(e.target.value) || 0})}
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveUser}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
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