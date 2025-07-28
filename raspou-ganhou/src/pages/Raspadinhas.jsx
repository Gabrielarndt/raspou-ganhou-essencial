import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { Play, Star, Zap, Crown, Gift, Trophy, Coins, Sparkles } from 'lucide-react';

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
        banner: getBannerForGame(index),
        gradient: getGradientForGame(index),
        icon: getIconForGame(index),
        category: getCategoryForGame(index)
      }));
      setGames(gamesWithUI);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBannerForGame = (index) => {
    const banners = [
      'https://images.pexels.com/photos/3279691/pexels-photo-3279691.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      'https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      'https://images.pexels.com/photos/3279667/pexels-photo-3279667.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      'https://images.pexels.com/photos/1111318/pexels-photo-1111318.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
    ];
    return banners[index % banners.length];
  };

  const getGradientForGame = (index) => {
    const gradients = [
      'from-yellow-500/90 to-orange-600/90',
      'from-blue-500/90 to-purple-600/90',
      'from-green-500/90 to-emerald-600/90',
      'from-purple-500/90 to-pink-600/90',
      'from-red-500/90 to-rose-600/90'
    ];
    return gradients[index % gradients.length];
  };

  const getIconForGame = (index) => {
    const icons = [Crown, Star, Trophy, Gift, Sparkles];
    return icons[index % icons.length];
  };

  const getCategoryForGame = (index) => {
    const categories = [
      'Premium',
      'Clássico',
      'Especial',
      'Exclusivo',
      'Popular'
    ];
    return categories[index % categories.length];
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Raspadinhas Online
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl max-w-2xl mx-auto">
            Escolha sua raspadinha favorita e ganhe prêmios instantâneos de até R$ 10.000!
          </p>
        </div>

        {/* Destaque Principal */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-8 mb-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <Crown className="w-16 h-16 text-black mx-auto mb-4" />
            <h2 className="text-black font-bold text-2xl lg:text-3xl mb-2">🎉 Promoção Especial</h2>
            <p className="text-black/80 text-lg mb-4">Ganhe até 50% mais em prêmios nesta semana!</p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>

        {/* Grid de Raspadinhas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => {
            const Icon = game.icon;
            
            return (
              <div
                key={game.id}
                className="group bg-gray-800 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/20"
              >
                {/* Banner da Raspadinha */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={game.banner}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${game.gradient}`}></div>
                  
                  {/* Badge da Categoria */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/70 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
                      {game.category}
                    </span>
                  </div>
                  
                  {/* Ícone Central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  {/* Prêmio Máximo */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Até {formatCurrency(game.max_prize)}
                    </div>
                  </div>
                </div>

                {/* Conteúdo da Card */}
                <div className="p-6">
                  {/* Título e Descrição */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Raspe e descubra se você é o próximo ganhador!
                    </p>
                  </div>

                  {/* Informações do Jogo */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-gray-400 text-xs">Preço</p>
                      <p className="text-yellow-400 font-bold">
                        {formatCurrency(game.price)}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <Trophy className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-gray-400 text-xs">Prêmio Max</p>
                      <p className="text-green-400 font-bold text-sm">
                        {formatCurrency(game.max_prize)}
                      </p>
                    </div>
                  </div>

                  {/* Probabilidade de Ganhar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Chance de Ganhar</span>
                      <span className="text-yellow-400 font-bold text-sm">
                        {((game.win_probability || 0.30) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(game.win_probability || 0.30) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Botão de Jogar */}
                  <button
                    onClick={() => handlePlay(game)}
                    className={`w-full bg-gradient-to-r ${game.gradient.replace('/90', '')} hover:shadow-lg hover:shadow-yellow-400/30 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group-hover:transform group-hover:scale-105`}
                  >
                    <Play className="w-5 h-5" />
                    <span>Jogar Agora</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seção de Informações */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Como Jogar */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4 text-blue-400">Como Jogar</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-400 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <p>Escolha sua raspadinha favorita</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-400 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <p>Raspe a cartela para revelar os símbolos</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-400 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <p>Encontre 3 símbolos iguais e ganhe!</p>
              </div>
            </div>
          </div>

          {/* Prêmios */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4 text-green-400">Prêmios Instantâneos</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex justify-between">
                <span>💎 Diamante:</span>
                <span className="text-green-400 font-bold">10x o valor</span>
              </div>
              <div className="flex justify-between">
                <span>🍀 Trevo:</span>
                <span className="text-green-400 font-bold">8x o valor</span>
              </div>
              <div className="flex justify-between">
                <span>⭐ Estrela:</span>
                <span className="text-green-400 font-bold">6x o valor</span>
              </div>
              <div className="flex justify-between">
                <span>🎯 Alvo:</span>
                <span className="text-green-400 font-bold">5x o valor</span>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-gray-800 rounded-2xl p-8 md:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4 text-purple-400">100% Seguro</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Jogos certificados e auditados</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Pagamentos instantâneos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Suporte 24/7</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Dados protegidos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="mt-16 text-center bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-2xl p-12 border border-yellow-500/30">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">
            Pronto para <span className="text-yellow-400">Ganhar</span>?
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Milhares de jogadores já ganharam prêmios incríveis. Sua vez pode ser agora!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/registro')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Criar Conta Grátis
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold py-4 px-8 rounded-xl transition-all duration-200"
                >
                  Já Tenho Conta
                </button>
              </>
            ) : (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Escolher Raspadinha
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Raspadinhas;