import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/database.js';
import pixService from '../services/pixService.js';

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

    // Buscar transação
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        users(nome, email, telefone, cpf)
      `)
      .eq('id', transaction_id)
      .eq('type', 'withdraw')
      .single();

    if (transactionError || !transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: `Transação já foi processada. Status atual: ${transaction.status}` });
    }

    // Se for PIX, processar via FastSoft
    if (transaction.method === 'PIX') {
      const customerData = {
        name: transaction.users.nome,
        email: transaction.users.email,
        phone: transaction.users.telefone,
        cpf: transaction.users.cpf,
        externalRef: transaction.user_id
      };

      const pixKey = transaction.metadata?.pix_key;
      if (!pixKey) {
        return res.status(400).json({ error: 'Chave PIX não encontrada na transação' });
      }

      // Criar saque via FastSoft
      const pixResult = await pixService.createPixWithdrawal(
        transaction.amount,
        pixKey,
        customerData,
        transaction.id
      );

      if (!pixResult.success) {
        console.error('Erro na API da FastSoft para saque:', pixResult.error);
        return res.status(400).json({ error: 'Erro ao processar saque via PIX: ' + pixResult.error });
      }

      // Atualizar transação com dados da FastSoft
      const { error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({
          status: 'processing',
          external_id: pixResult.data.id,
          processed_at: new Date().toISOString(),
          metadata: {
            ...transaction.metadata,
            fastsoft_transaction_id: pixResult.data.id
          }
        })
        .eq('id', transaction_id);

      if (updateError) {
        console.error('Erro ao atualizar transação:', updateError);
        return res.status(500).json({ error: 'Erro ao atualizar transação' });
      }

      res.json({ 
        success: true, 
        message: 'Saque aprovado e enviado via PIX',
        fastsoft_id: pixResult.data.id
      });

    } else {
      // Para outros métodos, apenas marcar como aprovado
      const { error } = await supabaseAdmin
        .from('transactions')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', transaction_id);

      if (error) {
        console.error('Approve withdraw error:', error);
        return res.status(500).json({ error: 'Erro ao aprovar saque' });
      }

      res.json({ success: true, message: 'Saque aprovado com sucesso' });
    }

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

    // Buscar usuário antes de fazer qualquer alteração
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('saldo_real')
      .eq('id', transaction.user_id)
      .single();

    if (userError || !user) {
      console.error('User not found for refund:', userError);
      return res.status(404).json({ error: 'Usuário não encontrado para estorno' });
    }

    const previousBalance = parseFloat(user.saldo_real || 0);
    const newBalance = previousBalance + parseFloat(transaction.amount);

    // Executar todas as operações em sequência, capturando erros individualmente
    let updateSuccess = false;
    let refundSuccess = false;
    let movementSuccess = false;

    // 1. Rejeitar saque
    try {
      const { error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString()
        })
        .eq('id', transaction_id);

      if (updateError) {
        console.error('Update transaction error:', updateError);
        return res.status(500).json({ error: 'Erro ao rejeitar saque' });
      }
      updateSuccess = true;
    } catch (error) {
      console.error('Update transaction exception:', error);
      return res.status(500).json({ error: 'Erro ao rejeitar saque' });
    }

    // 2. Devolver valor ao usuário
    try {
      const { error: refundError } = await supabaseAdmin
        .from('users')
        .update({
          saldo_real: newBalance
        })
        .eq('id', transaction.user_id);

      if (refundError) {
        console.error('Refund error:', refundError);
        return res.status(500).json({ error: 'Erro ao devolver valor ao usuário' });
      }
      refundSuccess = true;
    } catch (error) {
      console.error('Refund exception:', error);
      return res.status(500).json({ error: 'Erro ao devolver valor ao usuário' });
    }

    // 3. Registrar movimentação de estorno (não crítico)
    try {
      const { error: movementError } = await supabaseAdmin
        .from('balance_movements')
        .insert({
          user_id: transaction.user_id,
          transaction_id: transaction.id,
          type: 'credit',
          balance_type: 'real',
          amount: parseFloat(transaction.amount),
          previous_balance: previousBalance,
          new_balance: newBalance,
          description: 'Estorno de saque rejeitado'
        });

      if (!movementError) {
        movementSuccess = true;
      } else {
        console.error('Movement error (non-critical):', movementError);
      }
    } catch (error) {
      console.error('Movement exception (non-critical):', error);
    }

    // Retornar sucesso apenas se as operações críticas foram bem-sucedidas
    if (updateSuccess && refundSuccess) {
      res.json({ 
        success: true, 
        message: 'Saque rejeitado e valor devolvido',
        details: {
          transaction_updated: updateSuccess,
          refund_processed: refundSuccess,
          movement_logged: movementSuccess
        }
      });
    } else {
      res.status(500).json({ error: 'Erro parcial no processamento da rejeição' });
    }

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

export const createLottery = async (req, res) => {
  try {
    const { title, description, prize, draw_date, status, created_by } = req.body;

    if (!title || !prize || !draw_date) {
      return res.status(400).json({ error: 'Título, prêmio e data do sorteio são obrigatórios' });
    }

    const { data: lottery, error } = await supabaseAdmin
      .from('lotteries')
      .insert({
        title,
        description,
        prize: parseFloat(prize),
        draw_date,
        status: status || 'active',
        created_by
      })
      .select()
      .single();

    if (error) {
      console.error('Create lottery error:', error);
      return res.status(500).json({ error: 'Erro ao criar sorteio: ' + error.message });
    }

    res.json({
      success: true,
      message: 'Sorteio criado com sucesso',
      lottery
    });

  } catch (error) {
    console.error('Create lottery error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateLottery = async (req, res) => {
  try {
    const { lottery_id, title, description, prize, draw_date, status } = req.body;

    if (!lottery_id) {
      return res.status(400).json({ error: 'ID do sorteio é obrigatório' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (prize !== undefined) updateData.prize = parseFloat(prize);
    if (draw_date !== undefined) updateData.draw_date = draw_date;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    const { data: lottery, error } = await supabaseAdmin
      .from('lotteries')
      .update(updateData)
      .eq('id', lottery_id)
      .select()
      .single();

    if (error) {
      console.error('Update lottery error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar sorteio: ' + error.message });
    }

    res.json({
      success: true,
      message: 'Sorteio atualizado com sucesso',
      lottery
    });

  } catch (error) {
    console.error('Update lottery error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteLottery = async (req, res) => {
  try {
    const { lottery_id } = req.body;

    if (!lottery_id) {
      return res.status(400).json({ error: 'ID do sorteio é obrigatório' });
    }

    const { error } = await supabaseAdmin
      .from('lotteries')
      .delete()
      .eq('id', lottery_id);

    if (error) {
      console.error('Delete lottery error:', error);
      return res.status(500).json({ error: 'Erro ao excluir sorteio: ' + error.message });
    }

    res.json({
      success: true,
      message: 'Sorteio excluído com sucesso'
    });

  } catch (error) {
    console.error('Delete lottery error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getLotteries = async (req, res) => {
  try {
    const { data: lotteries, error } = await supabaseAdmin
      .from('lotteries')
      .select(`
        *,
        admins(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get lotteries error:', error);
      return res.status(500).json({ error: 'Erro ao carregar sorteios' });
    }

    res.json({ lotteries });

  } catch (error) {
    console.error('Get lotteries error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getActiveLotteries = async (req, res) => {
  try {
    const now = new Date().toISOString();

    // Sorteios ativos (data futura e status ativo)
    const { data: activeLotteries, error: activeError } = await supabaseAdmin
      .from('lotteries')
      .select('*')
      .eq('status', 'active')
      .gt('draw_date', now)
      .order('draw_date', { ascending: true });

    // Sorteios finalizados (data passada ou status finalizado)
    const { data: finishedLotteries, error: finishedError } = await supabaseAdmin
      .from('lotteries')
      .select('*')
      .or(`draw_date.lt.${now},status.eq.finished`)
      .order('draw_date', { ascending: false })
      .limit(10);

    if (activeError || finishedError) {
      console.error('Get active lotteries error:', activeError || finishedError);
      return res.status(500).json({ error: 'Erro ao carregar sorteios' });
    }

    res.json({
      active_lotteries: activeLotteries || [],
      finished_lotteries: finishedLotteries || []
    });

  } catch (error) {
    console.error('Get active lotteries error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, is_super_admin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .insert({
        name,
        email,
        password: hashedPassword,
        is_super_admin: is_super_admin || false
      })
      .select()
      .single();

    if (error) {
      console.error('Create admin error:', error);
      return res.status(500).json({ error: 'Erro ao criar admin: ' + error.message });
    }

    res.json({
      success: true,
      message: 'Admin criado com sucesso',
      admin
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { admin_id, name, email, password, is_super_admin } = req.body;

    if (!admin_id) {
      return res.status(400).json({ error: 'ID do admin é obrigatório' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (is_super_admin !== undefined) updateData.is_super_admin = is_super_admin;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (email) {
      const { data: existingAdmin } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('email', email)
        .neq('id', admin_id)
        .single();

      if (existingAdmin) {
        return res.status(409).json({ error: 'Email já está em uso por outro admin' });
      }
    }

    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .update(updateData)
      .eq('id', admin_id)
      .select()
      .single();

    if (error) {
      console.error('Update admin error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar admin: ' + error.message });
    }

    res.json({
      success: true,
      message: 'Admin atualizado com sucesso',
      admin
    });

  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { admin_id } = req.body;
    console.log('Recebido admin_id para exclusão:', admin_id);

    if (!admin_id) {
      return res.status(400).json({ error: 'ID do admin é obrigatório' });
    }

    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('id, is_super_admin')
      .eq('id', admin_id)
      .single();

    console.log('Admin encontrado:', admin);

    if (!admin) {
      return res.status(404).json({ error: 'Admin não encontrado' });
    }

    if (admin.is_super_admin) {
      return res.status(403).json({ error: 'Super admins não podem ser excluídos' });
    }

    const { error } = await supabaseAdmin
      .from('admins')
      .delete()
      .eq('id', admin_id);

    if (error) {
      console.error('Delete admin error:', error);
      return res.status(500).json({ error: 'Erro ao excluir admin: ' + error.message });
    }

    res.json({
      success: true,
      message: 'Admin excluído com sucesso'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};



export const getAdmins = async (req, res) => {
  try {
    const { data: admins, error } = await supabaseAdmin
      .from('admins')
      .select('id, name, email, is_super_admin, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get admins error:', error);
      return res.status(500).json({ error: 'Erro ao carregar admins' });
    }

    res.json({ admins });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAffiliates = async (req, res) => {
  try {
    const { data: affiliates, error } = await supabaseAdmin
      .from('affiliates')
      .select('id, name, email, affiliate_code, cpa, commission_rate, referrals, volume_generated, total_commission, conversion_rate, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get affiliates error:', error);
      return res.status(500).json({ error: 'Erro ao carregar afiliados' });
    }

    res.json({ affiliates });

  } catch (error) {
    console.error('Get affiliates error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createAffiliate = async (req, res) => {
  try {
    console.log('🔵 createAffiliate: Recebendo dados:', req.body);
    const { name, email, password, cpa, commission_rate } = req.body;

    if (!name || !email || !password) {
      console.log('❌ createAffiliate: Campos obrigatórios faltando');
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Gerar código de afiliado único
    const generatedAffiliateCode = `AFF${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    console.log('🔑 createAffiliate: Código gerado:', generatedAffiliateCode);

    // Verificar se email ou código já existe
    const { data: existingAffiliate } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('email', email);

    if (existingAffiliate && existingAffiliate.length > 0) {
      console.log('❌ createAffiliate: Email já existe');
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    console.log('🔐 createAffiliate: Fazendo hash da senha...');
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('💾 createAffiliate: Inserindo no banco de dados...');
    const { data: newAffiliate, error } = await supabaseAdmin
      .from('affiliates')
      .insert({
        name,
        email,
        password: hashedPassword,
        affiliate_code: generatedAffiliateCode,
        cpa: parseFloat(cpa || 0),
        commission_rate: parseFloat(commission_rate || 0),
        referrals: 0,
        volume_generated: 0,
        total_commission: 0,
        conversion_rate: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Create affiliate error:', error);
      return res.status(500).json({ error: 'Erro ao criar afiliado: ' + error.message });
    }

    if (!newAffiliate) {
      console.error('❌ createAffiliate: Dados não retornados do banco');
      return res.status(500).json({ error: 'Erro ao criar afiliado - dados não retornados' });
    }

    console.log('✅ createAffiliate: Afiliado criado com sucesso:', newAffiliate.id);
    // Remover senha dos dados retornados
    const { password: _, ...affiliateWithoutPassword } = newAffiliate;

    res.json({
      success: true,
      message: 'Afiliado criado com sucesso',
      affiliate: affiliateWithoutPassword
    });

  } catch (error) {
    console.error('Create affiliate error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateAffiliate = async (req, res) => {
  try {
    const { affiliate_id, name, email, password, affiliate_code, cpa, commission_rate } = req.body;

    if (!affiliate_id) {
      return res.status(400).json({ error: 'ID do afiliado é obrigatório' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (affiliate_code !== undefined) updateData.affiliate_code = affiliate_code;
    if (cpa !== undefined) updateData.cpa = parseFloat(cpa);
    if (commission_rate !== undefined) updateData.commission_rate = parseFloat(commission_rate);
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    // Verificar se email ou código já existe (se estiver sendo alterado)
    if (email || affiliate_code) {
      const conditions = [];
      if (email) conditions.push(`email.eq.${email}`);
      if (affiliate_code) conditions.push(`affiliate_code.eq.${affiliate_code}`);
      
      const { data: existingAffiliate } = await supabaseAdmin
        .from('affiliates')
        .select('id')
        .or(conditions.join(','))
        .neq('id', affiliate_id)
        .single();

      if (existingAffiliate) {
        return res.status(409).json({ error: 'Email ou código de afiliado já está em uso por outro afiliado' });
      }
    }

    const { data: affiliate, error } = await supabaseAdmin
      .from('affiliates')
      .update(updateData)
      .eq('id', affiliate_id)
      .select()
      .single();

    if (error) {
      console.error('Update affiliate error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar afiliado: ' + error.message });
    }

    // Remover senha dos dados retornados
    const { password: _, ...affiliateWithoutPassword } = affiliate;

    res.json({
      success: true,
      message: 'Afiliado atualizado com sucesso',
      affiliate: affiliateWithoutPassword
    });

  } catch (error) {
    console.error('Update affiliate error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteAffiliate = async (req, res) => {
  try {
    const { affiliate_id } = req.body;

    if (!affiliate_id) {
      return res.status(400).json({ error: 'ID do afiliado é obrigatório' });
    }

    const { error } = await supabaseAdmin
      .from('affiliates')
      .delete()
      .eq('id', affiliate_id);

    if (error) {
      console.error('Delete affiliate error:', error);
      return res.status(500).json({ error: 'Erro ao excluir afiliado: ' + error.message });
    }

    res.json({
      success: true,
      message: 'Afiliado excluído com sucesso'
    });

  } catch (error) {
    console.error('Delete affiliate error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};