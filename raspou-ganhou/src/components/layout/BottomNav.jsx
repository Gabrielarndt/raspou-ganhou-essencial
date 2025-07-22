import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Ticket, 
  Trophy, 
  Wallet, 
  User, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import WalletDrawer from '../ui/WalletDrawer';
import ProfileDrawer from '../ui/ProfileDrawer';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showWallet, setShowWallet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    { id: 'home', icon: Home, label: 'Início', path: '/' },
    { id: 'scratch', icon: Ticket, label: 'Raspadinhas', path: '/raspadinhas' },
    { id: 'numbers', icon: Trophy, label: 'Números', path: '/numeros' },
  ];

  const authItems = isAuthenticated ? [
    { id: 'wallet', icon: Wallet, label: 'Carteira', action: () => setShowWallet(true) },
    { id: 'profile', icon: User, label: 'Perfil', action: () => setShowProfile(true) }
  ] : [
    { id: 'login', icon: LogIn, label: 'Entrar', path: '/login' },
    { id: 'register', icon: UserPlus, label: 'Registrar', path: '/registro' }
  ];

  const handleNavClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40">
        <div className="flex items-center justify-around max-w-md mx-auto py-2">
          {[...navItems, ...authItems].map((item) => {
            const Icon = item.icon;
            const active = item.path && isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                  active 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/5'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Drawers */}
      <WalletDrawer isOpen={showWallet} onClose={() => setShowWallet(false)} />
      <ProfileDrawer isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default BottomNav;

