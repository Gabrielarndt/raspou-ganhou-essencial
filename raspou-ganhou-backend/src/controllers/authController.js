import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/database.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.senha);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { 
        user_id: user.id, 
        email: user.email, 
        role: 'user' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remover senha dos dados retornados
    const { senha, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const register = async (req, res) => {
  try {
    const { nome, email, telefone, cpf, senha } = req.body;

    // Validação básica
    if (!nome || !email || !telefone || !cpf || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .or(`email.eq.${email},cpf.eq.${cpf}`)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email ou CPF já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 12);

    // Inserir usuário
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        nome,
        email,
        telefone,
        cpf,
        senha: hashedPassword,
        saldo_real: 0.00,
        saldo_bonus: 10.00, // Bônus de boas-vindas
        pontos_sorteio: 0,
        jogos_realizados: 0,
        total_ganho: 0.00
      })
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: error.message || 'Erro ao criar usuário' });
    }

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar admin
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { 
        user_id: admin.id, 
        email: admin.email, 
        role: admin.is_super_admin ? 'super_admin' : 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remover senha dos dados retornados
    const { password: _, ...adminWithoutPassword } = admin;

    res.json({
  success: true,
  token,
  user: {
    ...adminWithoutPassword,
    role: admin.is_super_admin ? 'super_admin' : 'admin'  // Adiciona role aqui
  }
});

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const affiliateLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar afiliado
    const { data: affiliate, error } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !affiliate) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, affiliate.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { 
        user_id: affiliate.id, 
        email: affiliate.email, 
        role: 'affiliate'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remover senha dos dados retornados
    const { password: _, ...affiliateWithoutPassword } = affiliate;

    res.json({
  success: true,
  token,
  user: {
    ...affiliateWithoutPassword,
    role: 'affiliate'
  }
});


  } catch (error) {
    console.error('Affiliate login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};