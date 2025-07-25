import { supabaseAdmin } from '../config/database.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Remover senha dos dados retornados
    const { senha, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { nome, telefone } = req.body;

    const updateData = {};
    if (nome) updateData.nome = nome;
    if (telefone) updateData.telefone = telefone;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()  // isso retorna os dados atualizados
      .single(); // garante que é um único usuário

    if (error || !updatedUser) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }

    // Remover a senha antes de enviar pro front
    const { senha, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


export const getBalanceMovements = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { data: movements, error } = await supabaseAdmin
      .from('balance_movements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Get balance movements error:', error);
      return res.status(500).json({ error: 'Erro ao carregar movimentações' });
    }

    res.json({ movements });

  } catch (error) {
    console.error('Get balance movements error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};