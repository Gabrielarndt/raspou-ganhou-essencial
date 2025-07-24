import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o usuário ainda existe no banco
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.user_id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = { ...decoded, userData: user };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return res.status(403).json({ error: 'Acesso negado - apenas administradores' });
    }

    // Verificar se o admin ainda existe
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', decoded.user_id)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Administrador não encontrado' });
    }

    req.user = { ...decoded, userData: admin };
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const authenticateAffiliate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'affiliate') {
      return res.status(403).json({ error: 'Acesso negado - apenas afiliados' });
    }

    // Verificar se o afiliado ainda existe
    const { data: affiliate, error } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('id', decoded.user_id)
      .single();

    if (error || !affiliate) {
      return res.status(401).json({ error: 'Afiliado não encontrado' });
    }

    req.user = { ...decoded, userData: affiliate };
    next();
  } catch (error) {
    console.error('Affiliate auth error:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};