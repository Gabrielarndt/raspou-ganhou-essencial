import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Trophy, Target, Calendar, TrendingUp, GamepadIcon } from 'lucide-react';

const HistoricoJogos = () => {
  const navigate = useNavigate();
  const { user, loading, getGameHistory } = useAuth();
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState('all'); // all, won, lost

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Carregar histórico de jogos
    const loadHistory = async () => {
      try {
        const history = await getGameHistory();
        setGames(history || []);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        setGames([]);
      }
    };
    
    loadHistory();
  }, [user, loading, navigate, getGameHistory]);

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

  const filteredGames = games.filter(game => {
    if (filter === 'all') return true;
    if (filter === 'won') return game.won;
    if (filter === 'lost') return !game.won;
    return true;
  });

  const totalGames = games.length;
  const gamesWon = games.filter(g => g.won).length;
  const gamesLost = games.filter(g => !g.won).length;
  const totalSpent = games.reduce((sum, g) => sum + g.cost, 0);
  const totalWon = games.reduce((sum, g) => sum + (g.prize || 0), 0);
  const winRate = totalGames > 0 ? ((gamesWon / totalGames) * 100).toFixed(1) : 0;

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
          <h1 className="text-2xl font-bold text-yellow-400">Histórico de Jogos</h1>
          <div className="w-10" />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <GamepadIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Total de Jogos</p>
            <p className="text-white font-bold text-xl">{totalGames}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Vitórias</p>
            <p className="text-green-400 font-bold text-xl">{gamesWon}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Derrotas</p>
            <p className="text-red-400 font-bold text-xl">{gamesLost}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Taxa de Vitória</p>
            <p className="text-yellow-400 font-bold text-xl">{winRate}%</p>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 text-sm mb-2">Total Investido</h3>
            <p className="text-red-400 font-bold text-lg">{formatCurrency(totalSpent)}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 text-sm mb-2">Total Ganho</h3>
            <p className="text-green-400 font-bold text-lg">{formatCurrency(totalWon)}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 text-sm mb-2">Resultado Líquido</h3>
            <p className={`font-bold text-lg ${
              (totalWon - totalSpent) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(totalWon - totalSpent)}
            </p>
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
            Todos
          </button>
          <button
            onClick={() => setFilter('won')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'won'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Vitórias
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'lost'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Derrotas
          </button>
        </div>

        {/* Lista de Jogos */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {filteredGames.length === 0 ? (
            <div className="p-8 text-center">
              <GamepadIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum jogo encontrado</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'Você ainda não jogou nenhuma raspadinha.'
                  : `Você ainda não tem jogos com resultado "${filter === 'won' ? 'vitória' : 'derrota'}".`
                }
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/raspadinhas')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Jogar Agora
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredGames.map((game) => (
                <div key={game.id} className="p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        game.won ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {game.won ? (
                          <Trophy className="w-5 h-5 text-white" />
                        ) : (
                          <Target className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {game.game_name || 'Raspadinha'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatDate(game.date)}
                        </p>
                        <p className={`text-sm font-medium ${
                          game.won ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {game.won ? 'Vitória' : 'Derrota'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        Custo: {formatCurrency(game.cost)}
                      </p>
                      {game.won && (
                        <p className="text-green-400 font-bold text-lg">
                          Prêmio: {formatCurrency(game.prize)}
                        </p>
                      )}
                      <p className={`text-sm font-medium ${
                        game.won ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {game.won ? `+${formatCurrency(game.prize - game.cost)}` : `-${formatCurrency(game.cost)}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ação Rápida */}
        {filteredGames.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/raspadinhas')}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <GamepadIcon className="w-5 h-5" />
              <span>Jogar Mais Raspadinhas</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricoJogos;

