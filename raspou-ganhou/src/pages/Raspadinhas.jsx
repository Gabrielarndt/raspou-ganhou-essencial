import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { Play, Star, Zap } from 'lucide-react';

const Raspadinhas = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const data = await apiClient.getGames();
      const gamesWithUI = (data.games || []).map((game, index) => ({
        ...game,
        cor: ['from-yellow-400 to-yellow-600', 'from-blue-400 to-blue-600', 'from-green-400 to-green-600', 'from-purple-400 to-purple-600', 'from-red-400 to-red-600'][index % 5],
        icone: [Star, Zap, Star, Zap, Star][index % 5],
        descricao: game.description || 'Tente a sorte!'
      }));
      setGames(gamesWithUI);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handlePlay = (game) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/jogo/${game.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-400 text-xl">Carregando jogos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Raspadinhas
          </h1>
          <p className="text-gray-400">
            Escolha sua raspadinha e tente a sorte!
          </p>
        </div>

        {/* Lista de Raspadinhas */}
        <div className="space-y-4">
          {games.map((game) => {
            const Icon = game.icone;
            
            return (
              <div
                key={game.id}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${game.cor} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{game.name}</h3>
                      <p className="text-gray-400 text-sm">{game.descricao}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-6">
                    <div>
                      <p className="text-gray-400 text-sm">Preço</p>
                      <p className="text-yellow-400 font-bold text-lg">
                        {formatCurrency(game.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Prêmio Máximo</p>
                      <p className="text-green-400 font-bold text-lg">
                        {formatCurrency(game.max_prize)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePlay(game)}
                  className={`w-full bg-gradient-to-r ${game.cor} hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2`}
                >
                  <Play className="w-5 h-5" />
                  <span>Jogar Agora</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 text-yellow-400">Como Jogar</h2>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <p>Escolha uma raspadinha e clique em "Jogar Agora"</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <p>Raspe a cartela para revelar os símbolos</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <p>Encontre 3 símbolos iguais e ganhe na hora!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Raspadinhas;

