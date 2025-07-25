import { supabaseAdmin } from '../config/database.js';

export const getDashboard = async (req, res) => {
  try {
    // Estatísticas gerais
    const { data: usersCount } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' });

    const { data: depositsSum } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('type', 'deposit')
      .eq('status', 'completed');

    const { data: withdrawsSum } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('type', 'withdraw');

    const { data: pendingWithdraws } = await supabaseAdmin
      .from('transactions')
      .select('id', { count: 'exact' })
      .eq('type', 'withdraw')
      .eq('status', 'processing');

    // Calcular totais
    const totalDeposits = depositsSum?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    const totalWithdraws = withdrawsSum?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    // Transações recentes
    const { data: recentTransactions } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        users(nome)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Usuários ativos
    const { data: activeUsers } = await supabaseAdmin
      .from('users')
      .select('id, nome, email, saldo_real, saldo_bonus, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    const stats = {
      total_users: usersCount?.length || 0,
      total_deposits: totalDeposits,
      total_withdraws: totalWithdraws,
      total_revenue: totalDeposits - totalWithdraws,
      pending_withdraws: pendingWithdraws?.length || 0
    };

    res.json({
      stats,
      recent_transactions: recentTransactions || [],
      active_users: activeUsers || []
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, nome, email, cpf, telefone, saldo_real, saldo_bonus, pontos_sorteio, jogos_realizados, total_ganho, nivel_vip, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Erro ao carregar usuários' });
    }

    res.json({ users });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        users(nome)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get transactions error:', error);
      return res.status(500).json({ error: 'Erro ao carregar transações' });
    }

    res.json({ transactions });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const approveWithdraw = async (req, res) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: 'ID da transação é obrigatório' });
    }

    const { error } = await supabaseAdmin
      .from('transactions')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', transaction_id)
      .eq('type', 'withdraw');

    if (error) {
      console.error('Approve withdraw error:', error);
      return res.status(500).json({ error: 'Erro ao aprovar saque' });
    }

    res.json({ success: true, message: 'Saque aprovado com sucesso' });

  } catch (error) {
    console.error('Approve withdraw error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const rejectWithdraw = async (req, res) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: 'ID da transação é obrigatório' });
    }

    // Buscar transação
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (transactionError || !transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Rejeitar saque
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString()
      })
      .eq('id', transaction_id);

    if (updateError) {
      console.error('Reject withdraw error:', updateError);
      return res.status(500).json({ error: 'Erro ao rejeitar saque' });
    }

    // Devolver valor ao usuário
    const { error: refundError } = await supabaseAdmin
      .from('users')
      .update({
        saldo_real: supabaseAdmin.raw(`saldo_real + ${parseFloat(transaction.amount)}`)
      })
      .eq('id', transaction.user_id);

    if (refundError) {
      console.error('Refund error:', refundError);
    }

    res.json({ success: true, message: 'Saque rejeitado e valor devolvido' });

  } catch (error) {
    console.error('Reject withdraw error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { user_id, nome, email, telefone, saldo_real, saldo_bonus } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (email !== undefined) updateData.email = email;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (saldo_real !== undefined) updateData.saldo_real = parseFloat(saldo_real);
    if (saldo_bonus !== undefined) updateData.saldo_bonus = parseFloat(saldo_bonus);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (email) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', user_id)
        .single();

      if (existingUser) {
        return res.status(409).json({ error: 'Email já está em uso por outro usuário' });
      }
    }

    // Atualizar usuário
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message });
    }

    // Remover senha dos dados retornados
    const { senha, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};