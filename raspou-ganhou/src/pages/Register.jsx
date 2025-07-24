import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, CreditCard, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    senha: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Formatação automática para telefone
    if (e.target.name === 'telefone') {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        if (value.length < 14) {
          value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
      }
    }
    
    // Formatação automática para CPF
    if (e.target.name === 'cpf') {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
    }

    setFormData({
      ...formData,
      [e.target.name]: value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.nome || !formData.email || !formData.telefone || !formData.cpf || !formData.senha || !formData.confirmPassword) {
      return 'Por favor, preencha todos os campos';
    }

    if (formData.senha !== formData.confirmPassword) {
      return 'As senhas não coincidem';
    }

    if (formData.senha.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }

    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      return 'CPF deve ter 11 dígitos';
    }

    const phoneNumbers = formData.telefone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      return 'Telefone deve ter pelo menos 10 dígitos';
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    register(formData).then(result => {
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message || 'Erro ao criar conta');
        setIsLoading(false);
      }
    }).catch(err => {
      setError('Erro inesperado. Tente novamente.');
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-yellow-400">Registrar</h1>
          <div className="w-10" />
        </div>

        {/* Formulário */}
        <div className="bg-gray-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                  maxLength="15"
                  required
                />
              </div>
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CPF
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="000.000.000-00"
                  maxLength="14"
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
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
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

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Confirme sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Botão de Registro */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Já tem conta? Faça login aqui
            </Link>
          </div>
        </div>

        {/* Termos */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Ao criar uma conta, você concorda com nossos{' '}
            <button className="text-yellow-400 hover:text-yellow-300">
              Termos de Uso
            </button>{' '}
            e{' '}
            <button className="text-yellow-400 hover:text-yellow-300">
              Política de Privacidade
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

