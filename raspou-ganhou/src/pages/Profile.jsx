import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { 
  ArrowLeft, 
  User, 
  Edit, 
  Save, 
  X,
  Wallet, 
  Trophy, 
  Star,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Plus,
  Gamepad2,
  History,
  TrendingUp,
  Gift,
  LogOut
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState('perfil');
  const [gameHistory, setGameHistory] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Carregar históricos
    loadHistories();
    
    setEditData({
      nome: user.nome || '',
      telefone: user.telefone || ''
    });
  }, [user, navigate]);

  const loadHistories = async () => {
    try {
      const [gameData, transactionData] = await Promise.all([
        apiClient.getGameHistory(),
        apiClient.getTransactionHistory()
      ]);
      
      setGameHistory(gameData.history || []);
      setTransactionHistory(transactionData.transactions || []);
    } catch (error) {
      console.error('Error loading histories:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const result = await updateUser(editData);
      if (result.success) {
        setIsEditing(false);
      } else {
        alert(result.message || 'Erro ao salvar alterações');
      }
    } catch (error) {
      alert('Erro ao salvar alterações: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditData({
      nome: user.nome || '',
      telefone: user.telefone || ''
    });
    setIsEditing(false);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20 lg:pb-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-yellow-400">Minha Conta</h1>
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        {/* Navegação */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-800 p-2 rounded-xl">
          {[
            { id: 'perfil', label: 'Perfil', icon: User },
            { id: 'jogos', label: 'Histórico de Jogos', icon: Gamepad2 },
            { id: 'transacoes', label: 'Transações', icon: CreditCard }
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

        {/* Conteúdo das Abas */}
        {activeTab === 'perfil' && (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Informações do Usuário */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dados Pessoais */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Dados Pessoais</h2>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Salvar</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.nome}
                        onChange={(e) => setEditData({...editData, nome: e.target.value})}
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    ) : (
                      <p className="text-white bg-gray-700 py-2 px-3 rounded-lg">{user.nome}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <p className="text-gray-400 bg-gray-700 py-2 px-3 rounded-lg">{user.email}</p>
                    <span className="text-xs text-gray-500">Email não pode ser alterado</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Telefone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.telefone}
                        onChange={(e) => setEditData({...editData, telefone: e.target.value})}
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    ) : (
                      <p className="text-white bg-gray-700 py-2 px-3 rounded-lg">{user.telefone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CPF
                    </label>
                    <p className="text-gray-400 bg-gray-700 py-2 px-3 rounded-lg">{user.cpf}</p>
                    <span className="text-xs text-gray-500">CPF não pode ser alterado</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Membro desde
                    </label>
                    <p className="text-gray-400 bg-gray-700 py-2 px-3 rounded-lg">
                      {user.data_cadastro ? formatDate(user.data_cadastro) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Estatísticas</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {user.jogos_realizados || 0}
                    </div>
                    <div className="text-sm text-gray-400">Jogos</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(user.total_ganho || 0)}
                    </div>
                    <div className="text-sm text-gray-400">Total Ganho</div>
                  </div>
                  
                      {user.pontos_sorteio || 0} pts
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {user.nivel_vip || 'Bronze'}
                    </div>
                    <div className="text-sm text-gray-400">Nível VIP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Saldos */}
              <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-center">
                <h3 className="text-black font-bold text-lg mb-4">Meus Saldos</h3>
                
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-black/80 text-sm">Saldo Real</p>
                    <p className="text-black text-xl font-bold">
                      {formatCurrency(user.saldo_real || 0)}
                    </p>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-black/80 text-sm">Saldo Bônus</p>
                    <p className="text-black text-xl font-bold">
                      {formatCurrency(user.saldo_bonus || 0)}
                    </p>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-black/80 text-sm">Pontos de Sorteio</p>
                    <p className="text-black text-xl font-bold">
                      {user.pontos_sorteio || 0} pts
                    </p>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Ações Rápidas</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/deposito')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Adicionar Saldo</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/raspadinhas')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    <span>Jogar Raspadinhas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Histórico de Jogos */}
        {activeTab === 'jogos' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Histórico de Jogos</h2>
            
            {gameHistory.length === 0 ? (
              <div className="text-center py-8">
                <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum jogo realizado ainda</p>
                <button
                  onClick={() => navigate('/raspadinhas')}
                  className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Começar a Jogar
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Jogo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Custo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prêmio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Resultado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {gameHistory.map((game) => (
                      <tr key={game.id} className="hover:bg-gray-700">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{game.game_name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-red-400">
                          -{formatCurrency(game.cost)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-green-400">
                          {game.prize > 0 ? formatCurrency(game.prize) : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            game.won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {game.won ? 'Ganhou' : 'Perdeu'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDateTime(game.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Histórico de Transações */}
        {activeTab === 'transacoes' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Histórico de Transações</h2>
            
            {transactionHistory.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma transação realizada ainda</p>
                <button
                  onClick={() => navigate('/deposito')}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Fazer Depósito
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Método</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {transactionHistory.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-700">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === 'deposit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {transaction.method}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-bold">
                          <span className={transaction.type === 'deposit' ? 'text-green-400' : 'text-blue-400'}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDateTime(transaction.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

