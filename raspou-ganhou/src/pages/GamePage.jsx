import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { ArrowLeft, Play, RotateCcw, Coins, Trophy, Star, Gift, Crown, Zap } from 'lucide-react';
import ScratchCard from '../components/game/ScratchCard';
import { useState, useEffect } from 'react';

const GamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [gameState, setGameState] = useState('ready'); // ready, playing, revealed, finished
  const [games, setGames] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [winningPrizes, setWinningPrizes] = useState([]);
  const [wonAmount, setWonAmount] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    loadGames();
  }, []);

  const currentGame = games.find(g => g.id === id);

  useEffect(() => {
    console.log('🎮 GamePage: Auth check - User:', !!user, 'Loading:', loading);
    
    if (loading) return;
    
    if (!user) {
      console.log('🎮 GamePage: No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (games.length > 0 && !currentGame) {
      console.log('🎮 GamePage: No current game found, redirecting to raspadinhas');
      navigate('/raspadinhas');
      return;
    }
    
    if (currentGame) {
      console.log('🎮 GamePage: Auth check passed, user can play');
    }
  }, [user, loading, currentGame, navigate, games]);

  const loadGames = async () => {
    try {
      const data = await apiClient.getGames();
      setGames(data.games || []);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBannerForGame = (index) => {
    const banners = [
      'https://images.pexels.com/photos/3279691/pexels-photo-3279691.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      'https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      'https://images.pexels.com/photos/3279667/pexels-photo-3279667.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      'https://images.pexels.com/photos/1111318/pexels-photo-1111318.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
    ];
    return banners[games.findIndex(g => g.id === id) % banners.length];
  };

  const getGradientForGame = (index) => {
    const gradients = [
      'from-yellow-500/90 to-orange-600/90',
      'from-blue-500/90 to-purple-600/90',
      'from-green-500/90 to-emerald-600/90',
      'from-purple-500/90 to-pink-600/90',
      'from-red-500/90 to-rose-600/90'
    ];
    return gradients[games.findIndex(g => g.id === id) % gradients.length];
  };

  const getIconForGame = (index) => {
    const icons = [Crown, Star, Trophy, Gift, Zap];
    return icons[games.findIndex(g => g.id === id) % icons.length];
  };

  const getCategoryForGame = (index) => {
    const categories = [
      'Premium',
      'Clássico',
      'Especial',
      'Exclusivo',
      'Popular'
    ];
    return categories[games.findIndex(g => g.id === id) % categories.length];
  };

  const handleStartGame = async () => {
    console.log('🎮 GamePage: Starting game for user:', user?.email);
    const totalBalance = (user.saldo_real || 0) + (user.saldo_bonus || 0);
    console.log('🎮 GamePage: Total balance:', totalBalance, 'Game cost:', currentGame.price);
    
    if (totalBalance < currentGame.price) {
      console.log('🎮 GamePage: Insufficient balance');
      alert('Saldo insuficiente! Faça um depósito para continuar jogando.');
      return;
    }

    try {
      const result = await apiClient.playGame(currentGame.id);
      
      if (result.success) {
        setGameResult(result.result);
        setPrizes(result.result.symbols);
        setWinningPrizes(result.result.winning_positions);
        setWonAmount(result.result.prize);
        
        // Atualizar usuário com novos saldos
        await refreshUser();
        
        setGameState('playing');
        setIsRevealed(false);
        setShowResultModal(false);
      }
    } catch (error) {
      console.error('Error playing game:', error);
      alert('Erro ao iniciar jogo: ' + error.message);
    }
  };

  const handleReveal = () => {
    console.log('🎮 GamePage: Revealing game result');
    setIsRevealed(true);
    setGameState('revealed');
    
    // Aguardar um pouco antes de processar o prêmio
    setTimeout(() => {
      processWinnings();
    }, 100);
  };

  const processWinnings = () => {
    console.log('💰 processWinnings: Game result processed by backend');

    // Mostrar modal de resultado
    setTimeout(() => {
      setShowResultModal(true);
    }, 500);
  };

  const handlePlayAgain = () => {
    console.log('🎮 GamePage: Playing again');
    setGameState('ready');
    setIsRevealed(false);
    setPrizes([]);
    setWinningPrizes([]);
    setWonAmount(0);
    setGameResult(null);
    setShowResultModal(false);
  };

  const closeModal = () => {
    setShowResultModal(false);
  };

  // Mostrar loading durante carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-400 text-xl">Carregando...</div>
        </div>
      </div>
    );
  }

  // Retornar null se não há jogo ou usuário
  if (!currentGame || !user) {
    return null;
  }

  const gameIndex = games.findIndex(g => g.id === id);
  const banner = getBannerForGame(gameIndex);
  const gradient = getGradientForGame(gameIndex);
  const Icon = getIconForGame(gameIndex);
  const category = getCategoryForGame(gameIndex);

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/raspadinhas')}
            className="p-3 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-yellow-400">{currentGame.name}</h1>
            <p className="text-gray-400">Raspe e descubra se você ganhou!</p>
          </div>
          <div className="w-12" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Área Principal do Jogo */}
          <div className="lg:col-span-2">
            
            {/* Banner da Raspadinha */}
            <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden mb-8">
              <img
                src={banner}
                alt={currentGame.name}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`}></div>
              
              {/* Badge da Categoria */}
              <div className="absolute top-6 left-6">
                <span className="bg-black/70 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold">
                  {category}
                </span>
              </div>
              
              {/* Prêmio Máximo */}
              <div className="absolute top-6 right-6">
                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  Até {formatCurrency(currentGame.max_prize)}
                </div>
              </div>
              
              {/* Ícone Central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Icon className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            {/* Área do Jogo */}
            {gameState === 'ready' && (
              <div className="bg-gray-800 rounded-2xl p-8 text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Play className="w-10 h-10 text-black" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-white">Pronto para Jogar?</h2>
                  <p className="text-gray-400 text-lg mb-8">
                    Clique no botão abaixo para começar a raspar sua cartela!
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-700 rounded-xl p-4 text-center">
                      <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Custo do Jogo</p>
                      <p className="text-yellow-400 font-bold text-xl">
                        {formatCurrency(currentGame.price)}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-xl p-4 text-center">
                      <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Prêmio Máximo</p>
                      <p className="text-green-400 font-bold text-xl">
                        {formatCurrency(currentGame.max_prize)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartGame}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-8 rounded-xl transition-all duration-200 text-xl flex items-center justify-center space-x-3"
                  >
                    <Play className="w-6 h-6" />
                    <span>Começar a Raspar</span>
                  </button>
                </div>
              </div>
            )}

            {(gameState === 'playing' || gameState === 'revealed') && (
              <div className="space-y-6">
                <ScratchCard
                  prizes={prizes}
                  winningPrizes={winningPrizes}
                  onReveal={handleReveal}
                  isRevealed={isRevealed}
                />
                
                {gameState === 'revealed' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={handlePlayAgain}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Jogar Novamente</span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/raspadinhas')}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                    >
                      Outras Raspadinhas
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Informações do Jogo */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Informações do Jogo</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Nome:</span>
                  <span className="text-white font-medium">{currentGame.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Categoria:</span>
                  <span className="text-yellow-400 font-medium">{category}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Preço:</span>
                  <span className="text-yellow-400 font-bold">{formatCurrency(currentGame.price)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Prêmio Máximo:</span>
                  <span className="text-green-400 font-bold">{formatCurrency(currentGame.max_prize)}</span>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 font-medium">Ativo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Saldo do Usuário */}
            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-6">💰 Seu Saldo</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Saldo Real:</span>
                  <span className="text-white font-bold">{formatCurrency(user.saldo_real || 0)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Saldo Bônus:</span>
                  <span className="text-blue-400 font-bold">{formatCurrency(user.saldo_bonus || 0)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Pontos Sorteio:</span>
                  <span className="text-purple-400 font-bold">{user.pontos_sorteio || 0} pts</span>
                </div>
                
                <div className="border-t border-yellow-500/30 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 font-medium">Total Disponível:</span>
                    <span className="text-yellow-400 font-bold text-xl">
                      {formatCurrency((user.saldo_real || 0) + (user.saldo_bonus || 0))}
                    </span>
                  </div>
                </div>
              </div>
              
              {((user.saldo_real || 0) + (user.saldo_bonus || 0)) < currentGame.price && (
                <div className="mt-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
                  <p className="text-red-400 text-sm text-center">
                    Saldo insuficiente para jogar
                  </p>
                  <button
                    onClick={() => navigate('/deposito')}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors"
                  >
                    Adicionar Saldo
                  </button>
                </div>
              )}
            </div>

            {/* Como Jogar */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">🎯 Como Jogar</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
                  <p className="text-gray-300 text-sm">Clique em "Começar a Raspar" para iniciar</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
                  <p className="text-gray-300 text-sm">Raspe a cartela para revelar os símbolos</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
                  <p className="text-gray-300 text-sm">Encontre 3 símbolos iguais para ganhar!</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold mt-1">4</div>
                  <p className="text-gray-300 text-sm">Ganhe pontos de sorteio a cada jogada</p>
                </div>
              </div>
            </div>

            {/* Prêmios */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">🏆 Tabela de Prêmios</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center space-x-2">
                    <span>💎</span>
                    <span>Diamante</span>
                  </span>
                  <span className="text-green-400 font-bold">10x</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center space-x-2">
                    <span>🍀</span>
                    <span>Trevo</span>
                  </span>
                  <span className="text-green-400 font-bold">8x</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center space-x-2">
                    <span>⭐</span>
                    <span>Estrela</span>
                  </span>
                  <span className="text-green-400 font-bold">6x</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center space-x-2">
                    <span>🎯</span>
                    <span>Alvo</span>
                  </span>
                  <span className="text-green-400 font-bold">5x</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center space-x-2">
                    <span>🏆</span>
                    <span>Troféu</span>
                  </span>
                  <span className="text-green-400 font-bold">4x</span>
                </div>
              </div>
            </div>

            {/* Segurança */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">🔒 Segurança</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Resultados verificados</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Pagamentos instantâneos</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Dados protegidos</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Suporte 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Resultado */}
        {showResultModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center border-2 border-yellow-400">
              <div className="text-6xl mb-6">
                {wonAmount > 0 ? '🎉' : '😔'}
              </div>
              
              <h3 className={`text-3xl font-bold mb-6 ${
                wonAmount > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {wonAmount > 0 ? 'PARABÉNS!' : 'QUE PENA!'}
              </h3>
              
              {wonAmount > 0 ? (
                <div className="mb-6">
                  <p className="text-gray-300 mb-4">Você ganhou:</p>
                  <div className="text-4xl font-bold text-yellow-400 mb-4">
                    {formatCurrency(wonAmount)}
                  </div>
                  <p className="text-green-400 text-lg font-semibold">
                    Seu saldo foi atualizado!
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-gray-300 mb-4">
                    Não foi dessa vez, mas não desista!
                  </p>
                  <p className="text-blue-400 text-lg font-semibold">
                    Você ganhou 10 pontos de sorteio!
                  </p>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={handlePlayAgain}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Jogar Novamente
                </button>
                
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;