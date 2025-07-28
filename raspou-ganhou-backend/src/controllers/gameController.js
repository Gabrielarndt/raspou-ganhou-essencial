import { supabaseAdmin } from '../config/database.js';

// Configurações das raspadinhas com lógica corrigida
const SCRATCH_CARD_CONFIGS = {
  '1': {
    name: 'Raspadinha Premium',
    price: 1,
    cycles: [
      { gamesWithoutWin: 3, winChance: 0.50, minPrize: 1, maxPrize: 2 },
      { gamesWithoutWin: 4, winChance: 0.30, minPrize: 2, maxPrize: 4 }
    ]
  },
  '2': {
    name: 'Raspadinha Clássica',
    price: 2,
    cycles: [
      { gamesWithoutWin: 3, winChance: 0.30, minPrize: 2, maxPrize: 5 },
      { gamesWithoutWin: 4, winChance: 0.30, minPrize: 3, maxPrize: 5 }
    ]
  },
  '3': {
    name: 'Raspadinha Especial',
    price: 5,
    cycles: [
      { gamesWithoutWin: 3, winChance: 0.30, minPrize: 5, maxPrize: 12 },
      { gamesWithoutWin: 4, winChance: 0.20, minPrize: 5, maxPrize: 15 }
    ]
  },
  '4': {
    name: 'Raspadinha Exclusiva',
    price: 10,
    cycles: [
      { gamesWithoutWin: 3, winChance: 0.20, minPrize: 10, maxPrize: 25 },
      { gamesWithoutWin: 4, winChance: 0.20, minPrize: 10, maxPrize: 30 }
    ]
  },
  '5': {
    name: 'Raspadinha Popular',
    price: 20,
    cycles: [
      { gamesWithoutWin: 3, winChance: 0.20, minPrize: 15, maxPrize: 35 },
      { gamesWithoutWin: 4, winChance: 0.20, minPrize: 20, maxPrize: 40 }
    ]
  }
};

// Função para gerar símbolos vencedores
const generateWinningSymbols = () => {
  const symbols = ['💎', '🍀', '⭐', '🎯', '🏆', '💰', '🎲', '🔥'];
  const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  const gameSymbols = Array(9).fill(null);
  
  // Escolher padrão vencedor aleatório
  const winningPatterns = [
    [0, 1, 2], // Linha superior
    [3, 4, 5], // Linha meio
    [6, 7, 8], // Linha inferior
    [0, 3, 6], // Coluna esquerda
    [1, 4, 7], // Coluna meio
    [2, 5, 8], // Coluna direita
    [0, 4, 8], // Diagonal principal
    [2, 4, 6]  // Diagonal secundária
  ];
  
  const winningPositions = winningPatterns[Math.floor(Math.random() * winningPatterns.length)];
  
  // Preencher posições vencedoras
  winningPositions.forEach(pos => {
    gameSymbols[pos] = winningSymbol;
  });
  
  // Preencher posições restantes com símbolos aleatórios (diferentes do vencedor)
  const otherSymbols = symbols.filter(s => s !== winningSymbol);
  for (let i = 0; i < 9; i++) {
    if (gameSymbols[i] === null) {
      gameSymbols[i] = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
    }
  }
  
  return { symbols: gameSymbols, winningPositions };
};

// Função para gerar símbolos perdedores
const generateLosingSymbols = () => {
  const symbols = ['💎', '🍀', '⭐', '🎯', '🏆', '💰', '🎲', '🔥'];
  const gameSymbols = [];
  
  // Garantir que não há 3 símbolos iguais em sequência
  for (let i = 0; i < 9; i++) {
    let symbol;
    do {
      symbol = symbols[Math.floor(Math.random() * symbols.length)];
    } while (wouldCreateWinningPattern(gameSymbols, symbol, i));
    
    gameSymbols[i] = symbol;
  }
  
  return { symbols: gameSymbols, winningPositions: [] };
};

// Função para verificar se adicionar um símbolo criaria um padrão vencedor
const wouldCreateWinningPattern = (currentSymbols, newSymbol, position) => {
  const testSymbols = [...currentSymbols];
  testSymbols[position] = newSymbol;
  
  const winningPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6] // Diagonais
  ];
  
  for (const pattern of winningPatterns) {
    if (pattern.every(pos => testSymbols[pos] === newSymbol && testSymbols[pos] !== undefined)) {
      return true;
    }
  }
  
  return false;
};

// Função para determinar se deve ganhar baseado na lógica
const shouldWinGame = (gameId, userId) => {
  console.log('🎮 shouldWinGame called with gameId:', gameId, 'userId:', userId);
  
  const config = SCRATCH_CARD_CONFIGS[gameId.toString()];
  if (!config) {
    console.log('❌ No config found for gameId:', gameId);
    return { shouldWin: false, prize: 0 };
  }

  // Simular localStorage no backend usando uma variável global
  if (!global.gameHistories) {
    global.gameHistories = {};
  }

  const userHistoryKey = `${userId}`;
  if (!global.gameHistories[userHistoryKey]) {
    global.gameHistories[userHistoryKey] = {};
  }

  const gameHistory = global.gameHistories[userHistoryKey][gameId] || { 
    gamesWithoutWin: 0, 
    currentCycle: 0, 
    totalGames: 0 
  };

  console.log('📊 Current game history:', gameHistory);

  const currentCycleConfig = config.cycles[gameHistory.currentCycle] || config.cycles[config.cycles.length - 1];
  console.log('🔄 Current cycle config:', currentCycleConfig);
  
  // Incrementar jogos sem ganhar
  gameHistory.gamesWithoutWin++;
  gameHistory.totalGames++;

  let shouldWin = false;
  let prize = 0;

  console.log(`🎯 Games without win: ${gameHistory.gamesWithoutWin}, Required: ${currentCycleConfig.gamesWithoutWin}`);

  // Verificar se deve ganhar baseado no ciclo atual
  if (gameHistory.gamesWithoutWin >= currentCycleConfig.gamesWithoutWin) {
    const random = Math.random();
    console.log(`🎲 Random: ${random}, Win chance: ${currentCycleConfig.winChance}`);
    
    if (random < currentCycleConfig.winChance) {
      shouldWin = true;
      // Calcular prêmio aleatório dentro da faixa EXATA
      const minPrize = Number(currentCycleConfig.minPrize);
      const maxPrize = Number(currentCycleConfig.maxPrize);
      
      // Gerar valor entre min e max (inclusive)
      prize = Math.random() * (maxPrize - minPrize) + minPrize;
      
      // Arredondar para 2 casas decimais e garantir que não exceda o máximo
      prize = Math.min(maxPrize, Math.max(minPrize, Math.round(prize * 100) / 100));

      console.log(`🏆 WINNER! Prize: ${prize} (Range: ${minPrize} - ${maxPrize}) - Cycle: ${gameHistory.currentCycle}`);

      // Resetar contador e avançar ciclo se necessário
      gameHistory.gamesWithoutWin = 0;
      if (gameHistory.currentCycle === 0) {
        gameHistory.currentCycle = 1; // Avança para o segundo ciclo
        console.log('📈 Advanced to cycle 1');
      }
      // Se já está no segundo ciclo, mantém no segundo ciclo
    } else {
      console.log('💔 No win this time');
    }
  } else {
    console.log(`⏳ Need ${currentCycleConfig.gamesWithoutWin - gameHistory.gamesWithoutWin} more games to be eligible for win`);
  }

  // Salvar histórico atualizado
  global.gameHistories[userHistoryKey][gameId] = gameHistory;
  console.log('💾 Updated game history:', gameHistory);

  return { shouldWin, prize };
};

export const getGames = async (req, res) => {
  try {
    const { data: games, error } = await supabaseAdmin
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Get games error:', error);
      return res.status(500).json({ error: 'Erro ao carregar jogos' });
    }

    res.json({ games: games || [] });

  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const playGame = async (req, res) => {
  try {
    const { game_id } = req.body;
    const userId = req.user.user_id;
    console.log('ID do usuário que está jogando:', userId);

    if (!game_id) {
      return res.status(400).json({ error: 'ID do jogo é obrigatório' });
    }

    // Buscar jogo
    const { data: game, error: gameError } = await supabaseAdmin
      .from('games')
      .select('*')
      .eq('id', game_id)
      .eq('is_active', true)
      .single();

    if (gameError || !game) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    // Buscar usuário atual
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const gamePrice = parseFloat(game.price);
    const userRealBalance = parseFloat(user.saldo_real || 0);
    const userBonusBalance = parseFloat(user.saldo_bonus || 0);
    const totalBalance = userRealBalance + userBonusBalance;

    // Verificar saldo
    if (totalBalance < gamePrice) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Calcular pagamento (usar saldo real primeiro, depois bônus)
    const realUsed = Math.min(userRealBalance, gamePrice);
    const bonusUsed = gamePrice - realUsed;
    const newRealBalance = userRealBalance - realUsed;
    const newBonusBalance = userBonusBalance - bonusUsed;

    // Determinar se ganhou usando a nova lógica
    const gameIndex = parseInt(game_id);
    const { shouldWin, prize } = shouldWinGame(gameIndex, userId);
    
    console.log(`🎮 Game result for user ${userId}, game ${gameIndex}: shouldWin=${shouldWin}, prize=${prize}`);
    
    let gameSymbols, winningPositions;
    
    if (shouldWin) {
      const result = generateWinningSymbols();
      gameSymbols = result.symbols;
      winningPositions = result.winningPositions;
    } else {
      const result = generateLosingSymbols();
      gameSymbols = result.symbols;
      winningPositions = result.winningPositions;
    }

    let updatedUser = null;

    if (shouldWin) {
      // Jogador ganhou
      const finalRealBalance = realUsed > 0 ? newRealBalance + prize : newRealBalance;
      const finalBonusBalance = realUsed === 0 ? newBonusBalance + prize : newBonusBalance;
      const newPontosSorteio = (user.pontos_sorteio || 0) + 10;
      const newJogosRealizados = (user.jogos_realizados || 0) + 1;
      const newTotalGanho = parseFloat(user.total_ganho || 0) + prize;

      console.log('Atualizando usuário (ganhou) com os valores:');
      console.log({
        saldo_real: finalRealBalance,
        saldo_bonus: finalBonusBalance,
        pontos_sorteio: newPontosSorteio,
        jogos_realizados: newJogosRealizados,
        total_ganho: newTotalGanho
      });

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          saldo_real: finalRealBalance,
          saldo_bonus: finalBonusBalance,
          pontos_sorteio: newPontosSorteio,
          jogos_realizados: newJogosRealizados,
          total_ganho: newTotalGanho
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar usuário (ganhou):', error);
        return res.status(500).json({ error: 'Erro ao atualizar usuário' });
      }
      updatedUser = data;

    } else {
      // Jogador perdeu - apenas atualiza estatísticas
      const newPontosSorteio = (user.pontos_sorteio || 0) + 10;
      const newJogosRealizados = (user.jogos_realizados || 0) + 1;

      console.log('Atualizando usuário (perdeu) com os valores:');
      console.log({
        saldo_real: newRealBalance,
        saldo_bonus: newBonusBalance,
        pontos_sorteio: newPontosSorteio,
        jogos_realizados: newJogosRealizados
      });

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          saldo_real: newRealBalance,
          saldo_bonus: newBonusBalance,
          pontos_sorteio: newPontosSorteio,
          jogos_realizados: newJogosRealizados
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar usuário (perdeu):', error);
        return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
      }
      updatedUser = data;
    }

    // Registrar resultado do jogo
    const { error: gameResultError } = await supabaseAdmin
      .from('game_results')
      .insert({
        user_id: userId,
        game_id: game_id,
        cost: gamePrice,
        prize: shouldWin ? prize : 0,
        won: shouldWin,
        symbols: gameSymbols,
        winning_positions: winningPositions,
        payment_breakdown: { realUsed, bonusUsed }
      });

    if (gameResultError) {
      console.error('Erro ao registrar resultado do jogo:', gameResultError);
      // Não interrompe execução
    }

    // Registrar movimentações de saldo (débitos)
    const movements = [];

    if (realUsed > 0) {
      movements.push({
        user_id: userId,
        type: 'debit',
        balance_type: 'real',
        amount: realUsed,
        previous_balance: userRealBalance,
        new_balance: newRealBalance + (shouldWin ? prize : 0),
        description: `Jogo: ${game.name}`
      });
    }

    if (bonusUsed > 0) {
      movements.push({
        user_id: userId,
        type: 'debit',
        balance_type: 'bonus',
        amount: bonusUsed,
        previous_balance: userBonusBalance,
        new_balance: newBonusBalance + (shouldWin && realUsed === 0 ? prize : 0),
        description: `Jogo: ${game.name}`
      });
    }

    if (shouldWin && prize > 0) {
      const balanceType = realUsed > 0 ? 'real' : 'bonus';
      const previousBalance = balanceType === 'real' ? newRealBalance : newBonusBalance;
      const newBalance = previousBalance + prize;

      movements.push({
        user_id: userId,
        type: 'credit',
        balance_type: balanceType,
        amount: prize,
        previous_balance: previousBalance,
        new_balance: newBalance,
        description: `Prêmio: ${game.name}`
      });
    }

    if (movements.length > 0) {
      const { error: movementError } = await supabaseAdmin
        .from('balance_movements')
        .insert(movements);

      if (movementError) {
        console.error('Erro ao registrar movimentações:', movementError);
        // Continua, pois o jogo já foi processado
      }
    }

    // Resposta final para o cliente
    res.json({
      success: true,
      result: {
        won: shouldWin,
        prize: shouldWin ? prize : 0,
        symbols: gameSymbols,
        winning_positions: winningPositions,
        new_balance: {
          saldo_real: updatedUser.saldo_real,
          saldo_bonus: updatedUser.saldo_bonus,
          pontos_sorteio: updatedUser.pontos_sorteio
        }
      }
    });

  } catch (error) {
    console.error('Play game error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getGameHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { data: history, error } = await supabaseAdmin
      .from('game_results')
      .select(`
        *,
        games(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Get game history error:', error);
      return res.status(500).json({ error: 'Erro ao carregar histórico' });
    }

    // Formatar dados para o frontend
    const formattedHistory = (history || []).map(game => ({
      id: game.id,
      game_name: game.games?.name || 'Raspadinha',
      cost: parseFloat(game.cost),
      prize: parseFloat(game.prize || 0),
      won: game.won,
      date: game.created_at,
      symbols: game.symbols,
      winning_positions: game.winning_positions
    }));

    res.json({ history: formattedHistory });

  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};