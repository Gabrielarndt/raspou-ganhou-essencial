import { supabaseAdmin } from '../config/database.js';

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
      .select('*');
      .eq('id', userId);
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

    // Gerar resultado do jogo
    const symbols = ['💎', '🍀', '⭐', '🎯', '🏆', '💰', '🎲', '🔥'];
    const gameSymbols = [];
    for (let i = 0; i < 9; i++) {
      gameSymbols[i] = symbols[Math.floor(Math.random() * symbols.length)];
    }

    // Determinar se ganhou (usar probabilidade do jogo)
    const winProbability = parseFloat(game.win_probability || 0.30);
    const won = Math.random() < winProbability;
    let prize = 0;
    let winningPositions = [];

    if (won) {
  // Símbolo vencedor e posições
  const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  winningPositions = [0, 4, 8]; // Diagonal principal

  // Preencher posições vencedoras
  winningPositions.forEach(pos => {
    gameSymbols[pos] = winningSymbol;
  });

  // Calcular prêmio
  const multipliers = {
    '💎': 10, '🍀': 8, '⭐': 6, '🎯': 5,
    '🏆': 4, '💰': 3, '🎲': 2, '🔥': 1.5
  };
  const multiplier = multipliers[winningSymbol] || 2;
  prize = Math.min(gamePrice * multiplier, parseFloat(game.max_prize || 0));

  // Atualizar saldos com prêmio
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


      
  const { data: updatedUser, error: updateError } = await supabaseAdmin
  .from('users')
  .update({
    saldo_real: finalRealBalance,
    saldo_bonus: finalBonusBalance,
    pontos_sorteio: newPontosSorteio,
    jogos_realizados: newJogosRealizados,
    total_ganho: newTotalGanho
  })
   .eq('id', userId);
  .select();
  .single();

if (updateError) {
  console.error('Erro ao atualizar usuário (ganhou):', updateError);
  return res.status(500).json({ error: 'Erro ao atualizar usuário' });
}

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


  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      saldo_real: newRealBalance,
      saldo_bonus: newBonusBalance,
      pontos_sorteio: newPontosSorteio,
      jogos_realizados: newJogosRealizados
    })
     .eq('id', userId);

if (updateError) {
  console.error('Erro ao atualizar usuário (perdeu):', updateError);
  return res.status(500).json({ error: 'Erro ao atualizar usuário', details: updateError.message });
}

}

// Registrar resultado do jogo
const { error: gameResultError } = await supabaseAdmin
  .from('game_results')
  .insert({
    user_id: userId,
    game_id: game_id,
    cost: gamePrice,
    prize,
    won,
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
    new_balance: newRealBalance + (won ? prize : 0),
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
    new_balance: newBonusBalance + (won && realUsed === 0 ? prize : 0),
    description: `Jogo: ${game.name}`
  });
}

if (won && prize > 0) {
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
    won,
    prize,
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