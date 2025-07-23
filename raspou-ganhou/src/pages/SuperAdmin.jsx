import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Users, 
  CreditCard, 
  TrendingUp,
  Settings,
  Shield,
  Trophy,
  UserCheck,
  BarChart3,
  DollarSign,
  Target,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Gift,
  Zap,
  Crown
} from 'lucide-react';

const SuperAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);

  // Verificar se é super admin
  const isSuperAdmin = user?.email === 'superadmin@raspouganhou.com' || user?.is_super_admin === true;

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/super-admin-login');
      return;
    }

    loadData();
  }, [isSuperAdmin, navigate]);

  const loadData = () => {
    // Carregar dados do localStorage
    const savedUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    const savedTransactions = JSON.parse(localStorage.getItem('raspou_transactions') || '[]');
    const savedAffiliates = JSON.parse(localStorage.getItem('raspou_affiliates') || '[]');
    const savedAdmins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
    const savedSuperAdmins = JSON.parse(localStorage.getItem('raspou_super_admins') || '[]');
    
    // Combinar administradores e super administradores, removendo duplicatas por ID
    const allAdmins = [...savedAdmins, ...savedSuperAdmins];
    const uniqueAdmins = allAdmins.filter((admin, index, self) => 
      index === self.findIndex(a => a.id === admin.id)
    );

    setUsers(savedUsers);
    setTransactions(savedTransactions);
    setAffiliates(savedAffiliates);
    setAdmins(uniqueAdmins);

    calculateStats(savedUsers, savedTransactions, savedAffiliates);
  };

  const calculateStats = (users, transactions, affiliates) => {
    const totalUsers = users.length;
    const totalAffiliates = affiliates.length;
    
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdraws = transactions
      .filter(t => t.type === 'withdraw' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalUserBalances = users.reduce((sum, u) => sum + (u.saldo_real || 0), 0);
    const totalAffiliateCommissions = affiliates.reduce((sum, a) => sum + (a.total_commission || 0), 0);
    
    // Lucro real = Depósitos - Saldos dos usuários - Comissões dos afiliados
    const realProfit = totalDeposits - totalUserBalances - totalAffiliateCommissions;

    const avgDeposit = totalDeposits / Math.max(transactions.filter(t => t.type === 'deposit').length, 1);
    const avgWithdraw = totalWithdraws / Math.max(transactions.filter(t => t.type === 'withdraw').length, 1);

    setStats({
      totalUsers,
      totalAffiliates,
      totalDeposits,
      totalWithdraws,
      totalUserBalances,
      totalAffiliateCommissions,
      realProfit,
      avgDeposit,
      avgWithdraw,
      pendingWithdraws: transactions.filter(t => t.type === 'withdraw' && t.status === 'processing').length
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleCreateAdmin = () => {
    // Implementar modal de criação de admin
    const name = prompt('Nome do administrador:');
    const email = prompt('Email do administrador:');
    const password = prompt('Senha do administrador:');
    
    if (name && email && password) {
      const newAdmin = {
        id: Date.now(),
        name,
        email,
        password,
        permissions: ['dashboard', 'users', 'transactions'],
        created_at: new Date().toISOString(),
        is_admin: true
      };
      
      const updatedAdmins = [...admins, newAdmin];
      const currentAdmins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
      const newAdminsList = [...currentAdmins, newAdmin];
      localStorage.setItem('raspou_admins', JSON.stringify(newAdminsList));
      
      // Adicionar também à lista de usuários para login
      const currentUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
      const newUsersList = [...currentUsers, newAdmin];
      localStorage.setItem('raspou_users', JSON.stringify(newUsersList));
      
      alert('Administrador criado com sucesso!');
      loadData();
    }
  };

  const handleCreateAffiliate = () => {
    const name = prompt('Nome do afiliado:');
    const email = prompt('Email do afiliado:');
    const password = prompt('Senha do afiliado:');
    const commission = parseFloat(prompt('Comissão (% sobre depósitos):') || '0');
    const cpa = parseFloat(prompt('CPA (valor fixo por primeiro depósito):') || '0');
    
    if (name && email && password) {
      const newAffiliate = {
        id: Date.now(),
        name,
        email,
        password,
        commission,
        cpa,
        total_clients: 0,
        total_deposits: 0,
        total_commission: 0,
        created_at: new Date().toISOString(),
        is_affiliate: true
      };
      
      const updatedAffiliates = [...affiliates, newAffiliate];
      setAffiliates(updatedAffiliates);
      localStorage.setItem('raspou_affiliates', JSON.stringify(updatedAffiliates));
      
      alert('Afiliado criado com sucesso!');
      loadData();
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20 lg:pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-red-400">Super Administrador</h1>
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Master</span>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-800 p-2 rounded-xl">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'clients', label: 'Clientes', icon: Users },
            { id: 'affiliates', label: 'Afiliados', icon: UserCheck },
            { id: 'admins', label: 'Administradores', icon: Shield },
            { id: 'raffles', label: 'Sorteios', icon: Trophy },
            { id: 'settings', label: 'Configurações', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Estatísticas Principais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white/80 text-sm">Total Usuários</p>
                <p className="text-white text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white/80 text-sm">Total Depositado</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalDeposits)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center">
                <DollarSign className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white/80 text-sm">Total Sacado</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalWithdraws)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-center">
                <Target className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white/80 text-sm">Lucro Real</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(stats.realProfit)}</p>
              </div>
            </div>

            {/* Estatísticas Secundárias */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <UserCheck className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Afiliados</p>
                <p className="text-white text-xl font-bold">{stats.totalAffiliates}</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Média Depósito</p>
                <p className="text-white text-xl font-bold">{formatCurrency(stats.avgDeposit)}</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Saldos Usuários</p>
                <p className="text-white text-xl font-bold">{formatCurrency(stats.totalUserBalances)}</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <Gift className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Comissões Pagas</p>
                <p className="text-white text-xl font-bold">{formatCurrency(stats.totalAffiliateCommissions)}</p>
              </div>
            </div>

            {/* Gráficos e Relatórios */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Transações Recentes</h3>
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
                <h3 className="text-white font-bold text-lg mb-4">Usuários Recentes</h3>
                <div className="space-y-3">
                  {users.slice(-5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
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

        {/* Gestão de Clientes */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>

            {/* Médias dos Usuários */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Depósito Médio</p>
                <p className="text-green-400 text-lg font-bold">{formatCurrency(stats.avgDeposit)}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Saque Médio</p>
                <p className="text-red-400 text-lg font-bold">{formatCurrency(stats.avgWithdraw)}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Saldo Médio</p>
                <p className="text-yellow-400 text-lg font-bold">
                  {formatCurrency(stats.totalUserBalances / Math.max(stats.totalUsers, 1))}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Total Clientes</p>
                <p className="text-blue-400 text-lg font-bold">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Saldo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Depósitos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {users.filter(u => !u.is_admin && !u.is_super_admin).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">{user.nome?.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{user.nome}</div>
                              <div className="text-sm text-gray-400">
                                {user.cpf ? `${user.cpf.substring(0, 3)}.**.*${user.cpf.slice(-2)}` : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{user.email}</div>
                          <div className="text-sm text-gray-400">{user.telefone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">
                          {formatCurrency((user.saldo_real || 0) + (user.saldo_bonus || 0))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-bold">
                          {formatCurrency(user.total_deposited || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'banned' ? 'bg-red-100 text-red-800' :
                            user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.status === 'banned' ? 'Banido' :
                             user.status === 'suspended' ? 'Suspenso' : 'Ativo'}
                          </span>
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

        {/* Gestão de Afiliados */}
        {activeTab === 'affiliates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <h2 className="text-xl font-bold text-white">Gestão de Afiliados</h2>
              <button 
                onClick={handleCreateAffiliate}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Afiliado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Clientes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Depósitos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Comissão</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {affiliates.map((affiliate) => (
                      <tr key={affiliate.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">{affiliate.name?.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{affiliate.name}</div>
                              <div className="text-sm text-gray-400">{affiliate.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {affiliate.total_clients || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">
                          {formatCurrency(affiliate.total_deposits || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-bold">
                          {formatCurrency(affiliate.total_commission || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => setSelectedAffiliate(affiliate)}
                              className="text-blue-400 hover:text-blue-300"
                            >
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

        {/* Gestão de Administradores */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <h2 className="text-xl font-bold text-white">Gestão de Administradores</h2>
              <button 
                onClick={handleCreateAdmin}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Admin</span>
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Administrador</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Permissões</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Criado em</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">{admin.name?.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{admin.name}</div>
                              <div className="text-sm text-gray-400">Administrador</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{admin.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {(admin.permissions || []).map((perm) => (
                              <span key={perm} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {admin.created_at ? formatDate(admin.created_at) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
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

        {/* Sorteios */}
        {activeTab === 'raffles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <h2 className="text-xl font-bold text-white">Gestão de Sorteios</h2>
              <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Novo Sorteio</span>
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Próximo Sorteio</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-bold mb-2">Sorteio Diário</h4>
                    <p className="text-white text-2xl font-bold mb-2">R$ 5.000,00</p>
                    <p className="text-gray-400 text-sm">Hoje às 20:00</p>
                    <p className="text-gray-400 text-sm">1.247 participantes</p>
                  </div>
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-lg transition-colors">
                    Editar Sorteio
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Histórico de Sorteios</h3>
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhum sorteio realizado ainda</p>
                  <p className="text-gray-500 text-sm mt-2">O histórico aparecerá após os primeiros sorteios</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configurações */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Parâmetros Financeiros</h3>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Limite Diário de Saque</label>
                    <input
                      type="number"
                      defaultValue="5000"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Controle de Bônus</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bônus de Boas-vindas (%)</label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Valor Mínimo para Bônus</label>
                    <input
                      type="number"
                      defaultValue="50"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Porcentagem Máxima de Bônus</label>
                    <input
                      type="number"
                      defaultValue="200"
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

      {/* Modal do Painel do Afiliado */}
      {selectedAffiliate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-xl">Painel do Afiliado: {selectedAffiliate.name}</h3>
              <button
                onClick={() => setSelectedAffiliate(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Dashboard do Afiliado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Clientes</p>
                <p className="text-white text-xl font-bold">{selectedAffiliate.total_clients || 0}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Depósitos</p>
                <p className="text-white text-xl font-bold">{formatCurrency(selectedAffiliate.total_deposits || 0)}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Comissão</p>
                <p className="text-white text-xl font-bold">{formatCurrency(selectedAffiliate.total_commission || 0)}</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setSelectedAffiliate(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;