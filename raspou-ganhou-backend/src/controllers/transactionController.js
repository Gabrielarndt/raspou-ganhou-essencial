import { supabaseAdmin } from '../config/database.js';

export const deposit = async (req, res) => {
  try {
    const { amount, method, details = {} } = req.body;
    const userId = req.user.user_id;

    if (!amount || amount <= 0 || !method) {
      return res.status(400).json({ error: 'Dados inválidos' });
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

    // Calcular bônus (10% para depósitos acima de R$ 100)
    const depositAmount = parseFloat(amount);
    const bonus = depositAmount >= 100 ? depositAmount * 0.1 : 0;

    // Criar transação
    const { error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        method: method,
        amount: depositAmount,
        net_amount: depositAmount,
        status: 'completed',
        payment_provider: 'simulated',
        metadata: details
      });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return res.status(500).json({ error: 'Erro ao criar transação' });
    }

    // Atualizar saldo do usuário
    const newRealBalance = parseFloat(user.saldo_real || 0) + depositAmount;
    const newBonusBalance = parseFloat(user.saldo_bonus || 0) + bonus;

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        saldo_real: newRealBalance,
        saldo_bonus: newBonusBalance
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update user error:', updateError);
      return res.status(500).json({ error: 'Erro ao atualizar saldo: ' + updateError.message });
    }

    // Registrar movimentações de saldo
    const { error: movementError1 } = await supabaseAdmin
      .from('balance_movements')
      .insert({
        user_id: userId,
        type: 'credit',
        balance_type: 'real',
        amount: depositAmount,
        previous_balance: parseFloat(user.saldo_real || 0),
        new_balance: newRealBalance,
        description: `Depósito via ${method}`
      });

    if (movementError1) {
      console.error('Movement error 1:', movementError1);
    }

    if (bonus > 0) {
      const { error: movementError2 } = await supabaseAdmin
        .from('balance_movements')
        .insert({
          user_id: userId,
          type: 'credit',
          balance_type: 'bonus',
          amount: bonus,
          previous_balance: parseFloat(user.saldo_bonus || 0),
          new_balance: newBonusBalance,
          description: 'Bônus de depósito'
        });

      if (movementError2) {
        console.error('Movement error 2:', movementError2);
      }
    }

    res.json({
      success: true,
      new_balance: {
        saldo_real: newRealBalance,
        saldo_bonus: newBonusBalance
      },
      bonus_received: bonus
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const withdraw = async (req, res) => {
  try {
    const { amount, method, details = {} } = req.body;
    const userId = req.user.user_id;

    if (!amount || amount <= 0 || !method) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Validar chave PIX se o método for PIX
    if (method === 'PIX' && !details.pix_key) {
      return res.status(400).json({ error: 'Chave PIX é obrigatória' });
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

    const withdrawAmount = parseFloat(amount);

    // Verificar saldo real (só pode sacar saldo real)
    if (parseFloat(user.saldo_real || 0) < withdrawAmount) {
      return res.status(400).json({ error: 'Saldo real insuficiente' });
    }

    // Calcular taxa
    const fee = method === 'Transferência Bancária' ? 5.00 : 0;
    const netAmount = withdrawAmount - fee;

    // Criar transação
    const { error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'withdraw',
        method: method,
        amount: withdrawAmount,
        fee: fee,
        net_amount: netAmount,
        status: 'processing',
        metadata: details
      });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return res.status(500).json({ error: 'Erro ao criar transação: ' + transactionError.message });
    }

    // Atualizar saldo do usuário
    const newRealBalance = parseFloat(user.saldo_real || 0) - withdrawAmount;

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        saldo_real: newRealBalance
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update user error:', updateError);
      return res.status(500).json({ error: 'Erro ao atualizar saldo: ' + updateError.message });
    }

    // Registrar movimentação de saldo
    const { error: movementError } = await supabaseAdmin
      .from('balance_movements')
      .insert({
        type: 'debit',
        balance_type: 'real',
        amount: withdrawAmount,
        previous_balance: parseFloat(user.saldo_real || 0),
        new_balance: newRealBalance,
        description: `Saque via ${method}`
      });

    if (movementError) {
      console.error('Movement error:', movementError);
    }

    res.json({
      success: true,
      message: 'Saque solicitado com sucesso.',
      new_balance: {
        saldo_real: newRealBalance,
        saldo_bonus: parseFloat(user.saldo_bonus || 0)
      }
    });

  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Get transaction history error:', error);
      return res.status(500).json({ error: 'Erro ao carregar histórico' });
    }

    // Formatar dados para o frontend
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      method: transaction.method,
      amount: parseFloat(transaction.amount),
      status: transaction.status,
      date: transaction.created_at,
      description: `${transaction.type === 'deposit' ? 'Depósito' : 'Saque'} via ${transaction.method}`
    }));

    res.json({ transactions: formattedTransactions });

  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};