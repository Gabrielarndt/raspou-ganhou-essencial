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

    res.json({ games });

  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const playGame = async (req, res) => {
  try {
    const { game_id } = req.body;
    const userId = req.user.user_id;

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

    const totalBalance = parseFloat(user.saldo_real) + parseFloat(user.saldo_bonus);

    // Verificar saldo
    if (totalBalance < parseFloat(game.price)) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Calcular pagamento (usar saldo real primeiro, depois bônus)
    const gamePrice = parseFloat(game.price);
    const realUsed = Math.min(parseFloat(user.saldo_real), gamePrice);
    const bonusUsed = gamePrice - realUsed;
    const newRealBalance = parseFloat(user.saldo_real) - realUsed;
    const newBonusBalance = parseFloat(user.saldo_bonus) - bonusUsed;

    // Gerar resultado do jogo
    const symbols = ['💎', '🍀', '⭐', '🎯', '🏆', '💰', '🎲', '🔥'];
    const gameSymbols = [];
    for (let i = 0; i < 9; i++) {
      gameSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    // Usar probabilidade do jogo (padrão 30%)
    const winProbability = parseFloat(game.win_probability) || 0.30;
    const won = Math.random() <= winProbability;
    let prize = 0;
    let winningPositions = [];

    if (won) {
      const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      winningPositions = [0, 4, 8]; // Diagonal
      winningPositions.forEach(pos => {
        gameSymbols[pos] = winningSymbol;
      });

      // Calcular prêmio baseado no símbolo
      const multipliers = {
        '💎': 10, '🍀': 8, '⭐': 6, '🎯': 5,
        '🏆': 4, '💰': 3, '🎲': 2, '🔥': 1.5
      };
      const multiplier = multipliers[winningSymbol] || 1;
      prize = gamePrice * multiplier;

      // Limitar prêmio ao máximo do jogo
      prize = Math.min(prize, parseFloat(game.max_prize));
    }

    // Atualizar saldo do usuário
    let finalRealBalance = newRealBalance;
    let finalBonusBalance = newBonusBalance;

    if (won && prize > 0) {
      // Adicionar prêmio ao saldo real se usou saldo real, senão ao bônus
      if (realUsed > 0) {
        finalRealBalance += prize;
      } else {
        finalBonusBalance += prize;
      }
    }

    // Atualizar usuário no banco
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        saldo_real: newRealBalance + (won && realUsed > 0 ? prize : 0),
        saldo_bonus: newBonusBalance + (won && realUsed === 0 ? prize : 0),
        pontos_sorteio: supabaseAdmin.raw(`COALESCE(pontos_sorteio, 0) + 10`),
        jogos_realizados: supabaseAdmin.raw(`COALESCE(jogos_realizados, 0) + 1`),
        total_ganho: supabaseAdmin.raw(`COALESCE(total_ganho, 0) + ${prize}`)
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update user error:', updateError);
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }

    // Usar dados atualizados do banco
    finalRealBalance = parseFloat(updatedUser.saldo_real);
    finalBonusBalance = parseFloat(updatedUser.saldo_bonus);

    // Registrar resultado do jogo
    const { error: gameResultError } = await supabaseAdmin
      .from('game_results')
      .insert({
        user_id: userId,
        game_id: game_id,
        cost: gamePrice,
        prize: prize,
        won: won,
        symbols: gameSymbols,
        winning_positions: winningPositions,
        payment_breakdown: {
          realUsed: realUsed,
          bonusUsed: bonusUsed
        }
      });

    if (gameResultError) {
      console.error('Game result error:', gameResultError);
    }

    // Registrar movimentações de saldo
    if (realUsed > 0) {
      await supabaseAdmin
        .from('balance_movements')
        .insert({
          user_id: userId,
          type: 'debit',
          balance_type: 'real',
          amount: realUsed,
          previous_balance: parseFloat(user.saldo_real),
          new_balance: newRealBalance,
          description: `Jogo: ${game.name}`
        });
    }

    if (bonusUsed > 0) {
      await supabaseAdmin
        .from('balance_movements')
        .insert({
          user_id: userId,
          type: 'debit',
          balance_type: 'bonus',
          amount: bonusUsed,
          previous_balance: parseFloat(user.saldo_bonus),
          new_balance: newBonusBalance,
          description: `Jogo: ${game.name}`
        });
    }

    if (won && prize > 0) {
      const balanceType = realUsed > 0 ? 'real' : 'bonus';
      const previousBalance = realUsed > 0 ? newRealBalance : newBonusBalance;
      const newBalance = realUsed > 0 ? finalRealBalance : finalBonusBalance;

      await supabaseAdmin
        .from('balance_movements')
        .insert({
          user_id: userId,
          type: 'credit',
          balance_type: balanceType,
          amount: prize,
          previous_balance: previousBalance - prize,
          new_balance: newBalance,
          description: `Prêmio: ${game.name}`
        });
    }

    res.json({
      success: true,
      result: {
        won: won,
        prize: prize,
        symbols: gameSymbols,
        winning_positions: winningPositions,
        new_balance: {
          saldo_real: finalRealBalance,
          saldo_bonus: finalBonusBalance,
          pontos_sorteio: parseInt(user.pontos_sorteio) + 10
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
    const formattedHistory = history.map(game => ({
      id: game.id,
      game_name: game.games?.name || 'Raspadinha',
      cost: parseFloat(game.cost),
      prize: parseFloat(game.prize || 0),
      won: game.won,
      date: game.created_at
    }));

    res.json({ history: formattedHistory });

  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};