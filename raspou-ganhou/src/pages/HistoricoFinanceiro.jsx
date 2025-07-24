import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

const HistoricoFinanceiro = () => {
  const navigate = useNavigate();
  const { user, loading, getTransactionHistory } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, deposit, withdraw

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Carregar histórico de transações
    const loadTransactions = async () => {
      try {
        const history = await getTransactionHistory();
        setTransactions(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        setTransactions([]);
      }
    };

    loadTransactions();
  }, [user, loading, navigate, getTransactionHistory]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'withdraw':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <DollarSign className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'text-green-400';
      case 'withdraw':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'deposit':
        return 'Depósito';
      case 'withdraw':
        return 'Saque';
      default:
        return 'Transação';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdraws = transactions
    .filter(t => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-400 text-xl">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/minha-conta')}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-yellow-400">Histórico Financeiro</h1>
          <div className="w-10" />
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Depositado</p>
                <p className="text-green-400 font-bold text-lg">{formatCurrency(totalDeposits)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <TrendingDown className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Sacado</p>
                <p className="text-red-400 font-bold text-lg">{formatCurrency(totalWithdraws)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-gray-400 text-sm">Saldo Atual</p>
                <p className="text-yellow-400 font-bold text-lg">
                  {formatCurrency((user.saldo_real || 0) + (user.saldo_bonus || 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-yellow-600 text-black'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('deposit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'deposit'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Depósitos
          </button>
          <button
            onClick={() => setFilter('withdraw')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'withdraw'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Saques
          </button>
        </div>

        {/* Lista de Transações */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhuma transação encontrada</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'Você ainda não realizou nenhuma transação financeira.'
                  : `Você ainda não realizou nenhuma transação do tipo "${getTransactionLabel(filter)}".`
                }
              </p>
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => navigate('/deposito')}
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Fazer Depósito
                </button>
                <button
                  onClick={() => navigate('/saque')}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Solicitar Saque
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h3 className="font-medium text-white">
                          {getTransactionLabel(transaction.type)}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'withdraw' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-400 capitalize">
                        {transaction.status || 'Concluído'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações Rápidas */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/deposito')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Novo Depósito</span>
            </button>
            <button
              onClick={() => navigate('/saque')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <TrendingDown className="w-5 h-5" />
              <span>Solicitar Saque</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricoFinanceiro;

