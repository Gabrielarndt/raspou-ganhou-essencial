import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
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
  BarChart3
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({});

  // Verificar se é admin
  const isAdmin = user?.email === 'admin@raspouganhou.com' || user?.is_admin === true || user?.id === 1;

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    // Carregar dados do localStorage
    loadData();
  }, [isAdmin, navigate]);

  const loadData = () => {
    // Carregar usuários
    const savedUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    setUsers(savedUsers);

    // Carregar transações
    const savedTransactions = JSON.parse(localStorage.getItem('raspou_transactions') || '[]');
    setTransactions(savedTransactions);

    // Carregar jogos (simulado)
    const savedGames = JSON.parse(localStorage.getItem('raspou_games') || '[]');
    setGames(savedGames);

    // Calcular estatísticas
    calculateStats(savedUsers, savedTransactions, savedGames);
  };

  const calculateStats = (users, transactions, games) => {
    const totalUsers = users.length;
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdraws = transactions
      .filter(t => t.type === 'withdraw')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalGames = games.length;
    const totalRevenue = totalDeposits - totalWithdraws;

    setStats({
      totalUsers,
      totalDeposits,
      totalWithdraws,
      totalGames,
      totalRevenue,
      pendingWithdraws: transactions.filter(t => t.type === 'withdraw' && t.status === 'processing').length
    });
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

  const handleApproveWithdraw = (transactionId) => {
    const updatedTransactions = transactions.map(t => 
      t.id === transactionId ? { ...t, status: 'completed' } : t
    );
    setTransactions(updatedTransactions);
    localStorage.setItem('raspou_transactions', JSON.stringify(updatedTransactions));
    loadData();
  };

  const handleRejectWithdraw = (transactionId) => {
    const updatedTransactions = transactions.map(t => 
      t.id === transactionId ? { ...t, status: 'rejected' } : t
    );
    setTransactions(updatedTransactions);
    localStorage.setItem('raspou_transactions', JSON.stringify(updatedTransactions));
    loadData();
  };

  if (!isAdmin) {
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
          <h1 className="text-2xl lg:text-3xl font-bold text-yellow-400">Painel Administrativo</h1>
          <div className="w-10" />
        </div>

        {/* Navegação */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-800 p-2 rounded-xl">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'transactions', label: 'Transações', icon: CreditCard },
            { id: 'games', label: 'Jogos', icon: Trophy },
            { id: 'settings', label: 'Configurações', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-yellow-600 text-black'
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
                <p className="text-white/80 text-sm">Total de Usuários</p>
                <p className="text-white text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white/80 text-sm">Receita Total</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center">
                <DollarSign className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white/80 text-sm">Total Depósitos</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalDeposits)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white/80 text-sm">Saques Pendentes</p>
                <p className="text-white text-2xl font-bold">{stats.pendingWithdraws}</p>
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
                <h3 className="text-white font-bold text-lg mb-4">Usuários Ativos</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-sm">{user.nome?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user.nome}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <p className="text-green-400 font-bold text-sm">
                        {formatCurrency(user.saldo_real + user.saldo_bonus)}
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Novo Usuário</span>
              </button>
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
                            <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-black font-bold text-sm">{user.nome?.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{user.nome}</div>
                              <div className="text-sm text-gray-400">{user.cpf}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">
                          {formatCurrency((user.saldo_real || 0) + (user.saldo_bonus || 0))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.data_cadastro ? formatDate(user.data_cadastro) : 'N/A'}
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
                          {formatDate(transaction.date)}
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

        {/* Configurações */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Configurações Gerais</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Site</label>
                    <input
                      type="text"
                      defaultValue="RaspouGanhou"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email de Contato</label>
                    <input
                      type="email"
                      defaultValue="contato@raspouganhou.com"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefone de Suporte</label>
                    <input
                      type="tel"
                      defaultValue="(11) 9999-9999"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Valor Mínimo de Saque</label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Saque (%)</label>
                    <input
                      type="number"
                      defaultValue="0"
                      step="0.01"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                Salvar Configurações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

