import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Coins, Menu, X, User, Wallet, Star } from 'lucide-react';
import WalletDrawer from '../ui/WalletDrawer';
import ProfileDrawer from '../ui/ProfileDrawer';
import { useState, useEffect } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showWalletDrawer, setShowWalletDrawer] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const navItems = [
    { id: 'home', label: 'Início', path: '/' },
    { id: 'scratch', label: 'Raspadinhas', path: '/raspadinhas' },
    { id: 'numbers', label: 'Números', path: '/numeros' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  console.log('🎯 Header: Rendering - User:', !!user, 'Loading:', loading);

  // Mostrar loading durante carregamento inicial
  if (loading) {
    return (
      <header className="header-fixed fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black border-b border-gray-800">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
             
            </Link>
            <div className="text-gray-400">Carregando...</div>
          </div>
        </div>
      </header>
    );
  }

  const currentUser = user;

  return (
    <>
      <header className="header-fixed fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black border-b border-gray-800">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logoGanhou.png" 
                alt="RaspouGanhou Logo" 
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-yellow-400 font-bold text-lg leading-none">RaspouGanhou</h1>
                <p className="text-gray-400 text-xs">Raspe e Ganhe</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
          

            {/* User Actions - Renderização Condicional Baseada em currentUser */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  {/* Saldo Total - Visível no mobile */}
                  <div className="flex items-center space-x-2 bg-gray-800 px-2 py-1 md:px-3 md:py-2 rounded-lg">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium text-sm md:text-base">
                      R$ {((currentUser.saldo_real || 0) + (currentUser.saldo_bonus || 0)).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Pontos de Sorteio */}
                  <div className="hidden md:flex items-center space-x-2 bg-blue-800 px-3 py-2 rounded-lg">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">
                      {currentUser.pontos_sorteio || 0} pts
                    </span>
                  </div>

                  {/* Botões Desktop */}
                  <div className="hidden md:flex items-center space-x-4">
                    {/* Botão Carteira */}
                    <button
                      onClick={() => setShowWalletDrawer(true)}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      <Wallet className="w-4 h-4" />
                      <span className="hidden lg:inline">Carteira</span>
                    </button>

                    {/* Botão Perfil */}
                    <button
                      onClick={() => setShowProfileDrawer(true)}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden lg:inline">Perfil</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Botões Desktop para usuários não logados */}
                  <div className="hidden md:flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-300 hover:text-white font-medium transition-colors"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/registro"
                      className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Criar Conta
                    </Link>
                    
                    {/* Link Super Admin (apenas para desenvolvimento) */}
                    <Link
                      to="/super-admin-login"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs transition-colors"
                      title="Acesso Administrativo"
                    >
                      Admin
                    </Link>
                  </div>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
              <nav className="flex flex-col space-y-2 mt-4">
                {currentUser && (
                  <>
                    {/* Pontos de Sorteio no Mobile */}
                    <div className="flex items-center justify-between py-2 px-4 bg-blue-800 rounded">
                      <span className="text-gray-300">Pontos Sorteio:</span>
                      <span className="text-blue-400 font-bold">
                        {currentUser.pontos_sorteio || 0} pts
                      </span>
                    </div>
                    
                    {/* Botões de Ação */}
                    <button
                      onClick={() => {
                        setShowWalletDrawer(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                    >
                      <Wallet className="w-5 h-5" />
                      <span>Carteira</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileDrawer(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Meu Perfil</span>
                    </button>
                    
                    {/* Navegação */}
                    <div className="border-t border-gray-600 pt-4 mt-4">
                      {navItems.map((item) => (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => setShowMobileMenu(false)}
                          className={`block font-medium py-2 px-4 rounded transition-colors ${
                            isActive(item.path)
                              ? 'text-yellow-400 bg-gray-800'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="flex items-center justify-between py-2 px-4 bg-gray-800 rounded mt-4">
                      <span className="text-gray-300">Saldo Total:</span>
                      <span className="text-yellow-400 font-bold">
                        {formatCurrency((currentUser.saldo_real || 0) + (currentUser.saldo_bonus || 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-4 bg-blue-800 rounded">
                      <span className="text-gray-300">Pontos Sorteio:</span>
                      <span className="text-blue-400 font-bold">
                        {currentUser.pontos_sorteio || 0} pts
                      </span>
                    </div>
                  </>
                )}
                
                {!currentUser && (
                  <>
                    {/* Navegação para usuários não logados */}
                    {navItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setShowMobileMenu(false)}
                        className={`block font-medium py-2 px-4 rounded transition-colors ${
                          isActive(item.path)
                            ? 'text-yellow-400 bg-gray-800'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    
                    <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-600">
                      <Link
                        to="/login"
                        onClick={() => setShowMobileMenu(false)}
                        className="text-center py-2 px-4 border border-gray-600 text-gray-300 hover:text-white rounded transition-colors"
                      >
                        Entrar
                      </Link>
                      <Link
                        to="/registro"
                        onClick={() => setShowMobileMenu(false)}
                        className="text-center py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-black font-bold rounded transition-colors"
                      >
                        Criar Conta
                      </Link>
                      
                      {/* Link Super Admin */}
                      <Link
                        to="/super-admin-login"
                        onClick={() => setShowMobileMenu(false)}
                        className="text-center py-1 px-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs transition-colors"
                      >
                        Admin
                      </Link>
                    </div>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Drawers */}
      <WalletDrawer 
        isOpen={showWalletDrawer} 
        onClose={() => setShowWalletDrawer(false)} 
      />
      <ProfileDrawer 
        isOpen={showProfileDrawer} 
        onClose={() => setShowProfileDrawer(false)} 
      />
    </>
  );
};

export default Header;


