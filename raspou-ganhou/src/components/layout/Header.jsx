import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Coins, Menu, X, User, Wallet, Star } from 'lucide-react';
import WalletDrawer from '../ui/WalletDrawer';
import ProfileDrawer from '../ui/ProfileDrawer';
import { useState, useEffect } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, forceUpdate, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showWalletDrawer, setShowWalletDrawer] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [localUser, setLocalUser] = useState(null);

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

  // Escutar mudanças no AuthContext
  useEffect(() => {
    console.log('🎯 Header: Auth state changed - User:', !!user, 'Loading:', loading);
    setLocalUser(user);
  }, [user, loading, forceUpdate]);

  // Escutar eventos customizados de login/logout
  useEffect(() => {
    const handleUserLogin = (event) => {
      console.log('🎯 Header: User login event received:', event.detail?.email);
      setLocalUser(event.detail);
    };

    const handleUserLogout = () => {
      console.log('🎯 Header: User logout event received');
      setLocalUser(null);
    };

    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);

    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, []);

  // Verificar localStorage diretamente como fallback
  useEffect(() => {
    const checkLocalStorage = () => {
      try {
        const savedUser = localStorage.getItem('raspou_user');
        if (savedUser && !localUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log('🎯 Header: Found user in localStorage:', parsedUser.email);
          setLocalUser(parsedUser);
        } else if (!savedUser && localUser) {
          console.log('🎯 Header: No user in localStorage, clearing local state');
          setLocalUser(null);
        }
      } catch (error) {
        console.error('🎯 Header: Error checking localStorage:', error);
      }
    };

    // Verificar imediatamente
    checkLocalStorage();

    // Verificar periodicamente
    const interval = setInterval(checkLocalStorage, 1000);

    return () => clearInterval(interval);
  }, [localUser]);

  console.log('🎯 Header: Rendering - LocalUser:', !!localUser, 'AuthUser:', !!user, 'Loading:', loading);

  // Mostrar loading durante carregamento inicial
  if (loading) {
    return (
      <header className="header-fixed fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black border-b border-gray-800">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-yellow-400 font-bold text-lg leading-none">RaspouGanhou</h1>
                <p className="text-gray-400 text-xs">Raspe e Ganhe</p>
              </div>
            </Link>
            <div className="text-gray-400">Carregando...</div>
          </div>
        </div>
      </header>
    );
  }

  // Usar localUser como fonte de verdade
  const currentUser = localUser || user;

  return (
    <>
      <header className="header-fixed fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black border-b border-gray-800">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-yellow-400 font-bold text-lg leading-none">RaspouGanhou</h1>
                <p className="text-gray-400 text-xs">Raspe e Ganhe</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Actions - Renderização Condicional Baseada em currentUser */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  {console.log('🎯 Header: Rendering user section for:', currentUser.email)}
                  
                  {/* Saldo Total */}
                  <div className="hidden md:flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium">
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

                  {/* Botão Carteira */}
                  <button
                    onClick={() => {
                      console.log('🎯 Header: Carteira button clicked');
                      setShowWalletDrawer(true);
                    }}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="hidden lg:inline">Carteira</span>
                  </button>

                  {/* Botão Perfil */}
                  <button
                    onClick={() => {
                      console.log('🎯 Header: Perfil button clicked');
                      setShowProfileDrawer(true);
                    }}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Perfil</span>
                  </button>
                </>
              ) : (
                <>
                  {console.log('🎯 Header: Rendering login/register section')}
                  
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white font-medium transition-colors"
                    onClick={() => console.log('🎯 Header: Login link clicked')}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/registro"
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-lg transition-colors"
                    onClick={() => console.log('🎯 Header: Register link clicked')}
                  >
                    Criar Conta
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-700">
              <nav className="flex flex-col space-y-2 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`font-medium py-2 px-4 rounded transition-colors ${
                      isActive(item.path)
                        ? 'text-yellow-400 bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {currentUser && (
                  <>
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
                  <div className="flex flex-col space-y-2 mt-4">
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
                  </div>
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


