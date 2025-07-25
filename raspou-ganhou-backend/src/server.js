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

export const getAdmins = async (req, res) => {
  try {
    const { data: admins, error } = await supabaseAdmin
      .from('admins')
      .select('id, name, email, role, is_super_admin, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get admins error:', error);
      return res.status(500).json({ error: 'Erro ao carregar administradores' });
    }

    res.json({ admins });

  } catch (error) {
    console.error('Get admins error:', error);
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
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        is_super_admin: is_super_admin || false
      })
      .select()
      .single();

    if (error) {
      console.error('Create admin error:', error);
      return res.status(500).json({ error: 'Erro ao criar administrador: ' + error.message });
    }

    // Remover senha dos dados retornados
    const { password: _, ...adminWithoutPassword } = admin;

    res.json({
      success: true,
      message: 'Administrador criado com sucesso',
      admin: adminWithoutPassword
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
      return res.status(400).json({ error: 'ID do administrador é obrigatório' });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (is_super_admin !== undefined) updateData.is_super_admin = is_super_admin;

    // Se senha foi fornecida, fazer hash
    if (password && password.trim() !== '') {
      const bcrypt = await import('bcryptjs');
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
        return res.status(409).json({ error: 'Email já está em uso por outro administrador' });
      }
    }

    // Atualizar administrador
    const { data: updatedAdmin, error } = await supabaseAdmin
      .from('admins')
      .update(updateData)
      .eq('id', admin_id)
      .select()
      .single();

    if (error) {
      console.error('Update admin error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar administrador: ' + error.message });
    }

    // Remover senha dos dados retornados
    const { password: _, ...adminWithoutPassword } = updatedAdmin;

    res.json({
      success: true,
      message: 'Administrador atualizado com sucesso',
      admin: adminWithoutPassword
    });

  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { admin_id } = req.body;

    if (!admin_id) {
      return res.status(400).json({ error: 'ID do administrador é obrigatório' });
    }

    // Verificar se é super admin (não pode ser excluído)
    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('is_super_admin')
      .eq('id', admin_id)
      .single();

    if (admin?.is_super_admin) {
      return res.status(403).json({ error: 'Super administradores não podem ser excluídos' });
    }

    const { error } = await supabaseAdmin
      .from('admins')
      .delete()
      .eq('id', admin_id);

    if (error) {
      console.error('Delete admin error:', error);
      return res.status(500).json({ error: 'Erro ao excluir administrador: ' + error.message });
    }

    res.json({
      success: true,
      message: 'Administrador excluído com sucesso'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAffiliates = async (req, res) => {
  try {
    const { data: affiliates, error } = await supabaseAdmin
      .from('affiliates')
      .select('*')
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
    const { name, email, password, affiliate_code, cpa, commission_rate } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const { data: existingAffiliate } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAffiliate) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    // Verificar se código de afiliado já existe
    const finalAffiliateCode = affiliate_code || `AFF${Date.now()}`;
    const { data: existingCode } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', finalAffiliateCode)
      .single();

    if (existingCode) {
      return res.status(409).json({ error: 'Código de afiliado já está em uso' });
    }

    // Hash da senha
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: affiliate, error } = await supabaseAdmin
      .from('affiliates')
      .insert({
        name,
        email,
        password: hashedPassword,
        affiliate_code: finalAffiliateCode,
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

    // Remover senha dos dados retornados
    const { password: _, ...affiliateWithoutPassword } = affiliate;

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

    // Preparar dados para atualização
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (affiliate_code !== undefined) updateData.affiliate_code = affiliate_code;
    if (cpa !== undefined) updateData.cpa = parseFloat(cpa);
    if (commission_rate !== undefined) updateData.commission_rate = parseFloat(commission_rate);

    // Se senha foi fornecida, fazer hash
    if (password && password.trim() !== '') {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (email) {
      const { data: existingAffiliate } = await supabaseAdmin
        .from('affiliates')
        .select('id')
        .eq('email', email)
        .neq('id', affiliate_id)
        .single();

      if (existingAffiliate) {
        return res.status(409).json({ error: 'Email já está em uso por outro afiliado' });
      }
    }

    // Verificar se código já existe (se estiver sendo alterado)
    if (affiliate_code) {
      const { data: existingCode } = await supabaseAdmin
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', affiliate_code)
        .neq('id', affiliate_id)
        .single();

      if (existingCode) {
        return res.status(409).json({ error: 'Código de afiliado já está em uso' });
      }
    }

    // Atualizar afiliado
    const { data: updatedAffiliate, error } = await supabaseAdmin
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
    const { password: _, ...affiliateWithoutPassword } = updatedAffiliate;

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