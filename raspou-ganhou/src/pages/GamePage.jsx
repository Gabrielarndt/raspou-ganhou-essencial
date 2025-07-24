import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { ArrowLeft, Play, RotateCcw, Coins } from 'lucide-react';
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

  const currentGame = games.find(g => g.id === id);
  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    console.log('🎮 GamePage: Auth check - User:', !!user, 'Loading:', loading);
    
    if (loading) return;
    
    if (!user) {
      console.log('🎮 GamePage: No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (!currentGame) {
      console.log('🎮 GamePage: No current game found, redirecting to raspadinhas');
      navigate('/raspadinhas');
      return;
    }
    
    console.log('🎮 GamePage: Auth check passed, user can play');
  }, [user, loading, currentGame, navigate]);

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

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/raspadinhas')}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-yellow-400">{currentGame.nome}</h1>
            <p className="text-gray-400 text-sm">Ache 3 iguais | Ganhe na hora!</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Área do Jogo */}
        <div className="mb-6">
          {gameState === 'ready' && (
            <div className="text-center space-y-6">
              <div className="bg-gray-800 rounded-xl p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Play className="w-12 h-12 text-black" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{currentGame.name}</h2>
                <p className="text-gray-400 mb-4">Prêmio máximo: {formatCurrency(currentGame.max_prize)}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-bold">Custo: {formatCurrency(currentGame.price)}</span>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Jogar Agora
                </button>
              </div>

              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-yellow-400 font-bold mb-2">💰 Seu Saldo</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo Real:</span>
                    <span className="text-white font-medium">{formatCurrency(user.saldo_real || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo Bônus:</span>
                    <span className="text-blue-400 font-medium">{formatCurrency(user.saldo_bonus || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-yellow-400 font-bold">{formatCurrency((user.saldo_real || 0) + (user.saldo_bonus || 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(gameState === 'playing' || gameState === 'revealed') && (
            <div className="text-center space-y-6">
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Jogar Novamente</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/raspadinhas')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Outros Jogos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Resultado */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center border-2 border-yellow-400">
            <div className="text-6xl mb-4">
              {wonAmount > 0 ? '🎉' : '😔'}
            </div>
            
            <h3 className={`text-3xl font-bold mb-4 ${
              wonAmount > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {wonAmount > 0 ? 'VOCÊ GANHOU!' : 'VOCÊ PERDEU!'}
            </h3>
            
            {wonAmount > 0 && (
              <div className="text-4xl font-bold text-yellow-400 mb-4">
                {formatCurrency(wonAmount)}
              </div>
            )}
            
            <div className="text-green-400 text-lg font-semibold mb-4">
              +10 pontos de sorteio adicionados!
            </div>
            
            <p className="text-gray-300 text-sm mb-6">
              {wonAmount > 0 
                ? 'Seu saldo foi atualizado automaticamente!'
                : 'Continue jogando para aumentar suas chances!'
              }
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePlayAgain}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Jogar Novamente
              </button>
              
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
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

export default GamePage;



