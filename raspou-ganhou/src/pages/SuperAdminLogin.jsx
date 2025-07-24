import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, Crown } from 'lucide-react';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.email || !formData.senha) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 SuperAdminLogin: Tentando login para:', formData.email);
      
      // Verificar super admins
      const superAdmins = JSON.parse(localStorage.getItem('raspou_super_admins') || '[]');
      console.log('🔍 SuperAdminLogin: Super admins encontrados:', superAdmins.length);
      console.log('🔍 SuperAdminLogin: Super admins:', superAdmins);
      
      const foundSuperAdmin = superAdmins.find(sa => 
        sa.email === formData.email && sa.password === formData.senha
      );
      
      console.log('🔍 SuperAdminLogin: Found super admin:', foundSuperAdmin);
      
      if (foundSuperAdmin) {
        console.log('✅ SuperAdminLogin: Super admin encontrado:', foundSuperAdmin.email);
        
        // Criar usuário temporário para o contexto de autenticação
        const tempUser = {
          id: foundSuperAdmin.id,
          nome: foundSuperAdmin.name,
          email: foundSuperAdmin.email,
          is_super_admin: true,
          role: 'super_admin'
        };
        
        console.log('💾 SuperAdminLogin: Salvando usuário temporário:', tempUser);
        localStorage.setItem('raspou_user', JSON.stringify(tempUser));
        
        // Disparar evento para atualizar o contexto de autenticação
        window.dispatchEvent(new CustomEvent('userLogin', { detail: tempUser }));
        
        console.log('🎯 SuperAdminLogin: Redirecionando para super admin panel');
        setIsLoading(false);
        navigate('/super-admin');
        return;
      } else {
        console.log('❌ SuperAdminLogin: Credenciais inválidas');
        setError('Credenciais inválidas para administrador');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Erro no login admin:', err);
      setError('Erro inesperado. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 text-white pt-20 pb-20">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Crown className="w-8 h-8 text-red-400" />
            <h1 className="text-2xl font-bold text-red-400">Super Admin</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Acesso Administrativo</h2>
          <p className="text-gray-400">Área restrita para administradores</p>
        </div>

        {/* Formulário */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Administrativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  placeholder="admin@raspouganhou.com"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  placeholder="Sua senha administrativa"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {isLoading ? 'Verificando...' : 'Acessar Painel'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <Link
              to="/affiliate-login"
              className="block text-blue-400 hover:text-blue-300 transition-colors"
            >
              Acesso para Afiliados →
            </Link>
            
            <Link
              to="/login"
              className="block text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Voltar ao login normal
            </Link>
          </div>
        </div>

        {/* Informações de Segurança */}
        <div className="mt-6 bg-gray-800/30 rounded-xl p-4 border border-red-500/20">
          <h3 className="text-red-400 font-bold mb-2 flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Área de Alta Segurança</span>
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span>Acesso restrito a administradores</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span>Todas as ações são registradas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span>Conexão criptografada</span>
            </div>
          </div>
        </div>

        {/* Credenciais de Teste */}
        <div className="mt-6 bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-4">
          <h4 className="text-yellow-400 font-bold mb-2">🔑 Credenciais de Teste</h4>
          <div className="space-y-1 text-sm text-gray-300">
            <p><strong>Super Admin:</strong> superadmin@raspouganhou.com / super123</p>
            <p><strong>Gabriel:</strong> gabriel@gmail.com / admin123</p>
            <p><strong>Afiliado:</strong> afiliado@teste.com / afiliado123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;