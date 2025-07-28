import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  X, 
  User, 
  CreditCard, 
  Gamepad2, 
  LogOut,
  ChevronRight 
} from 'lucide-react';

const ProfileDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'account',
      icon: User,
      label: 'Minha Conta',
      path: '/minha-conta'
    },
    {
      id: 'financial',
      icon: CreditCard,
      label: 'Histórico Financeiro',
      path: '/historico-financeiro'
    },
    {
      id: 'games',
      icon: Gamepad2,
      label: 'Histórico de Jogos',
      path: '/historico-jogos'
    }
  ];

  const handleMenuClick = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      onClose();
      navigate('/');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md mx-auto bg-gray-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Perfil</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações do Usuário */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xl">
                {(user.nome || '').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{user.nome || 'Usuário'}</h3>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-white font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDrawer;

