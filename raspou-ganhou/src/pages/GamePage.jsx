import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Play, RotateCcw, Coins } from 'lucide-react';
import ScratchCard from '../components/game/ScratchCard';
import { useState, useEffect } from 'react';

const GamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading, updateBalance, addGameResult } = useAuth();
  const [gameState, setGameState] = useState('ready'); // ready, playing, revealed, finished
  const [prizes, setPrizes] = useState([]);
  const [winningPrizes, setWinningPrizes] = useState([]);
  const [wonAmount, setWonAmount] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState({ realUsed: 0, bonusUsed: 0 });

  const raspadinhas = {
    1: { nome: 'Sorte Dourada', preco: 1.00, premio_max: 100.00 },
    2: { nome: 'Fortuna Real', preco: 2.00, premio_max: 250.00 },
    3: { nome: 'Tesouro Escondido', preco: 5.00, premio_max: 500.00 },
    4: { nome: 'Diamante Negro', preco: 10.00, premio_max: 1000.00 },
    5: { nome: 'Jackpot Premium', preco: 20.00, premio_max: 5000.00 }
  };

  const currentGame = raspadinhas[id];

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const generatePrizes = () => {
    console.log('🎮 GamePage: Generating prizes for game');
    const symbols = ['💎', '🍀', '⭐', '🎯', '🏆', '💰', '🎲', '🔥'];
    const newPrizes = [];
    
    for (let i = 0; i < 9; i++) {
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      newPrizes.push(randomSymbol);
    }
    
    // 30% de chance de ganhar
    const shouldWin = Math.random() < 0.3;
    console.log('🎮 GamePage: Should win?', shouldWin);
    
    if (shouldWin) {
      const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const positions = [0, 4, 8]; // Diagonal principal
      positions.forEach(pos => {
        newPrizes[pos] = winningSymbol;
      });
      setWinningPrizes(positions);
      
      // Calcular prêmio baseado no símbolo
      const prizeMultipliers = {
        '💎': 10, '🍀': 8, '⭐': 6, '🎯': 5,
        '🏆': 4, '💰': 3, '🎲': 2, '🔥': 1.5
      };
      const multiplier = prizeMultipliers[winningSymbol] || 1;
      const prize = currentGame.preco * multiplier;
      setWonAmount(prize);
      console.log('🎮 GamePage: Won amount:', prize);
    } else {
      setWinningPrizes([]);
      setWonAmount(0);
      console.log('🎮 GamePage: No prize won');
    }
    
    setPrizes(newPrizes);
  };

  const handleStartGame = () => {
    console.log('🎮 GamePage: Starting game for user:', user?.email);
    const totalBalance = (user.saldo_real || 0) + (user.saldo_bonus || 0);
    console.log('🎮 GamePage: Total balance:', totalBalance, 'Game cost:', currentGame.preco);
    
    if (totalBalance < currentGame.preco) {
      console.log('🎮 GamePage: Insufficient balance');
      alert('Saldo insuficiente! Faça um depósito para continuar jogando.');
      return;
    }

    // Calcular quanto será usado de cada saldo
    let newSaldoReal = user.saldo_real || 0;
    let newSaldoBonus = user.saldo_bonus || 0;
    let remainingCost = currentGame.preco;
    let realUsed = 0;
    let bonusUsed = 0;

    if (newSaldoReal >= remainingCost) {
      // Usar apenas saldo real
      realUsed = remainingCost;
      newSaldoReal -= remainingCost;
      remainingCost = 0;
    } else if (newSaldoReal > 0) {
      // Usar saldo real parcialmente e depois bônus
      realUsed = newSaldoReal;
      remainingCost -= newSaldoReal;
      newSaldoReal = 0;
      bonusUsed = remainingCost;
      newSaldoBonus -= remainingCost;
    } else {
      // Usar apenas saldo bônus
      bonusUsed = remainingCost;
      newSaldoBonus -= remainingCost;
    }

    console.log('🎮 GamePage: Payment breakdown - Real used:', realUsed, 'Bonus used:', bonusUsed);
    console.log('🎮 GamePage: New balances - Real:', newSaldoReal, 'Bonus:', newSaldoBonus);

    // Salvar breakdown do pagamento para distribuir prêmio corretamente
    setPaymentBreakdown({ realUsed, bonusUsed });

    updateBalance({
      saldo_real: newSaldoReal,
      saldo_bonus: newSaldoBonus,
      pontos_sorteio: (user.pontos_sorteio || 0)
    });

    generatePrizes();
    setGameState('playing');
    setIsRevealed(false);
    setShowResultModal(false);
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
    console.log('💰 processWinnings: Iniciando processamento do prêmio');
    console.log('💰 processWinnings: wonAmount =', wonAmount);
    console.log('💰 processWinnings: user atual =', user);
    
    if (wonAmount > 0) {
      console.log('💰 GANHOU! Valor:', wonAmount);
      console.log('💰 Saldo atual - Real:', user.saldo_real, 'Bonus:', user.saldo_bonus);
      console.log('💰 Pagamento foi - Real usado:', paymentBreakdown.realUsed, 'Bonus usado:', paymentBreakdown.bonusUsed);
      
      // Pegar saldos atuais do usuário mais recente
      const savedUser = JSON.parse(localStorage.getItem('raspou_user') || '{}');
      const currentRealBalance = savedUser.saldo_real || 0;
      const currentBonusBalance = savedUser.saldo_bonus || 0;
      
      console.log('💰 Saldos do localStorage - Real:', currentRealBalance, 'Bonus:', currentBonusBalance);
      
      let newRealBalance = currentRealBalance;
      let newBonusBalance = currentBonusBalance;
      
      // Aplicar regras de distribuição
      if (paymentBreakdown.realUsed > 0 && paymentBreakdown.bonusUsed === 0) {
        // Usou apenas saldo real → prêmio vai para real
        newRealBalance += wonAmount;
        console.log('💰 Prêmio adicionado ao SALDO REAL (pagou só com real)');
      } else if (paymentBreakdown.realUsed === 0 && paymentBreakdown.bonusUsed > 0) {
        // Usou apenas saldo bônus → prêmio vai para bônus
        newBonusBalance += wonAmount;
        console.log('💰 Prêmio adicionado ao SALDO BÔNUS (pagou só com bônus)');
      } else {
        // Usou ambos → prêmio vai para real
        newRealBalance += wonAmount;
        console.log('💰 Prêmio adicionado ao SALDO REAL (pagou com ambos)');
      }
      
      console.log('💰 Novos saldos - Real:', newRealBalance, 'Bonus:', newBonusBalance);
      
      // Atualizar saldo com força
      console.log('💰 Chamando updateBalance...');
      const updateResult = updateBalance({
        saldo_real: newRealBalance,
        saldo_bonus: newBonusBalance,
        pontos_sorteio: (user.pontos_sorteio || 0) + 10
      });
      
      console.log('💰 Resultado da atualização:', updateResult);
      
      // Forçar atualização do estado local
      setTimeout(() => {
        const updatedUser = JSON.parse(localStorage.getItem('raspou_user') || '{}');
        console.log('💰 Verificação final - Saldo no localStorage:', updatedUser.saldo_real, updatedUser.saldo_bonus);
        
        // Forçar re-renderização
        window.dispatchEvent(new CustomEvent('userLogin', { detail: updatedUser }));
      }, 100);
    } else {
      console.log('😞 Não ganhou, mas adicionando pontos');
      updateBalance({
        saldo_real: user.saldo_real || 0,
        saldo_bonus: user.saldo_bonus || 0,
        pontos_sorteio: (user.pontos_sorteio || 0) + 10
      });
    }

    // Adicionar ao histórico
    addGameResult({
      game_name: currentGame.nome,
      cost: currentGame.preco,
      premio: wonAmount,
      ganhou: wonAmount > 0
    });

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
    setPaymentBreakdown({ realUsed: 0, bonusUsed: 0 });
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
                <h2 className="text-2xl font-bold mb-2">{currentGame.nome}</h2>
                <p className="text-gray-400 mb-4">Prêmio máximo: {formatCurrency(currentGame.premio_max)}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-bold">Custo: {formatCurrency(currentGame.preco)}</span>
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



