import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  User,
  Link as LinkIcon,
  Gift,
  Menu,
  X,
  LogOut,
  Copy,
  Eye,
  Calendar,
  Filter,
  Bell,
  Shield,
  Globe,
  Palette,
  Smartphone
} from 'lucide-react';

const Affiliate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dateFilter, setDateFilter] = useState('30d');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [affiliateData, setAffiliateData] = useState(null);
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({});
  const [notifications, setNotifications] = useState({});
  const [security, setSecurity] = useState({});

  // Verificar se é afiliado - primeiro verifica localStorage, depois user do context
  const [storedUser, setStoredUser] = useState(null);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      console.log('📦 Affiliate: Stored user data:', userData);
      
      if (userData.role === 'affiliate' || userData.affiliate_code) {
        console.log('✅ Affiliate: Found affiliate in localStorage');
        setStoredUser(userData);
        setCurrentUser(userData);
        setIsAffiliate(true);
      } else {
        console.log('❌ Affiliate: User data found but not an affiliate:', userData);
        setIsAffiliate(false);
        setCurrentUser(null);
      }
    }
  } catch (error) {
    console.error('Error parsing stored user:', error);
  } finally {
    setAuthChecked(true); // <-- ✅ marca que a verificação foi feita
  }
}, []);


  useEffect(() => {
  if (!authChecked) return; // aguarda até verificar

  console.log('🔍 Affiliate: Checking auth - isAffiliate:', isAffiliate, 'currentUser:', !!currentUser);

  if (!isAffiliate || !currentUser) {
    console.log('❌ Affiliate: Not an affiliate, redirecting to login');
    navigate('/affiliate-login');
    return;
  }

  loadAffiliateData();
}, [authChecked, isAffiliate, currentUser, navigate]);


  const loadAffiliateData = () => {
    // Carregar dados do afiliado
    const affiliates = JSON.parse(localStorage.getItem('raspou_affiliates') || '[]');
    const currentAffiliate = affiliates.find(a => a.email === currentUser?.email);
    
    if (currentAffiliate) {
      setAffiliateData(currentAffiliate);
      setAccountForm({
        name: currentAffiliate.name,
        email: currentAffiliate.email,
        currentPassword: '',
        newPassword: ''
      });
      setNotifications(currentAffiliate.notifications || {
        newConversions: true,
        newDeposits: true,
        commissionChanges: true,
        frequency: 'realtime'
      });
      setSecurity(currentAffiliate.security || {
        twoFactor: false,
        lastAccess: new Date().toISOString()
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDateRangeLabel = (filter) => {
    const labels = {
      '1d': 'Último dia',
      '7d': 'Últimos 7 dias',
      '30d': 'Últimos 30 dias',
      '90d': 'Últimos 3 meses',
      '180d': 'Últimos 6 meses',
      '365d': 'Último ano',
      'all': 'Todo período',
      'custom': 'Período personalizado'
    };
    return labels[filter] || 'Período selecionado';
  };

  const handleAccountUpdate = () => {
    if (!accountForm.currentPassword) {
      alert('Digite sua senha atual para confirmar as alterações');
      return;
    }

    // Verificar senha atual
    if (accountForm.currentPassword !== affiliateData.password) {
      alert('Senha atual incorreta');
      return;
    }

    // Atualizar dados do afiliado
    const affiliates = JSON.parse(localStorage.getItem('raspou_affiliates') || '[]');
    const affiliateIndex = affiliates.findIndex(a => a.id === affiliateData.id);
    
    if (affiliateIndex !== -1) {
      const updatedAffiliate = {
        ...affiliateData,
        name: accountForm.name,
        email: accountForm.email,
        password: accountForm.newPassword || affiliateData.password
      };
      
      affiliates[affiliateIndex] = updatedAffiliate;
      localStorage.setItem('raspou_affiliates', JSON.stringify(affiliates));
      
      setAffiliateData(updatedAffiliate);
      setEditingAccount(false);
      setAccountForm({
        ...accountForm,
        currentPassword: '',
        newPassword: ''
      });
      
      alert('Dados atualizados com sucesso!');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('raspou_user');
      window.dispatchEvent(new CustomEvent('userLogout'));
      navigate('/affiliate-login');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'account', label: 'Minha Conta', icon: User },
    { id: 'links', label: 'Links de Afiliado', icon: LinkIcon },
    { id: 'coupons', label: 'Cupons', icon: Gift },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  if (!isAffiliate || !affiliateData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-400 text-xl">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 border-r border-gray-800">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-blue-400 font-bold">Painel Afiliado</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="relative flex flex-col w-64 bg-gray-900 border-r border-gray-800 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-400 font-bold">Painel Afiliado</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header Mobile */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-gray-900 border-b border-gray-800">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-blue-400">Painel Afiliado</h1>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header com filtros */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
                  <p className="text-gray-400">Acompanhe suas indicações e comissões</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {['1d', '7d', '30d', '90d', '180d', '365d', 'all'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setDateFilter(period)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        dateFilter === period
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:text-white'
                      }`}
                    >
                      {getDateRangeLabel(period)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Métricas principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Indicações</p>
                      <p className="text-white text-2xl font-bold">{affiliateData.referrals || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Volume Gerado</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(affiliateData.volume_generated || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Comissão Total</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(affiliateData.total_commission || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Taxa de Conversão</p>
                      <p className="text-white text-2xl font-bold">{affiliateData.conversion_rate || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Indicações por Período</h3>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    Gráfico de indicações (implementar com biblioteca de gráficos)
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Comissões por Período</h3>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    Gráfico de comissões (implementar com biblioteca de gráficos)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Minha Conta */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Minha Conta</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações da Conta */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Dados Pessoais</h2>
                    <button
                      onClick={() => setEditingAccount(!editingAccount)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {editingAccount ? 'Cancelar' : 'Editar'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                      {editingAccount ? (
                        <input
                          type="text"
                          value={accountForm.name}
                          onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                          className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      ) : (
                        <p className="text-white bg-gray-700 py-2 px-3 rounded-lg">{affiliateData.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      {editingAccount ? (
                        <input
                          type="email"
                          value={accountForm.email}
                          onChange={(e) => setAccountForm({...accountForm, email: e.target.value})}
                          className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      ) : (
                        <p className="text-white bg-gray-700 py-2 px-3 rounded-lg">{affiliateData.email}</p>
                      )}
                    </div>

                    {editingAccount && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Senha Atual</label>
                          <input
                            type="password"
                            value={accountForm.currentPassword}
                            onChange={(e) => setAccountForm({...accountForm, currentPassword: e.target.value})}
                            className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Digite sua senha atual"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Nova Senha (opcional)</label>
                          <input
                            type="password"
                            value={accountForm.newPassword}
                            onChange={(e) => setAccountForm({...accountForm, newPassword: e.target.value})}
                            className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Digite uma nova senha (opcional)"
                          />
                        </div>

                        <button
                          onClick={handleAccountUpdate}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                          Salvar Alterações
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Informações do Programa */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Informações do Programa</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">CPA (Custo por Ação):</span>
                      <span className="text-white font-bold">{formatCurrency(affiliateData.cpa || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">% Comissão sobre Depósitos:</span>
                      <span className="text-white font-bold">{affiliateData.commission_rate || 0}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data de Cadastro:</span>
                      <span className="text-white">{formatDate(affiliateData.created_at)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-400 font-bold">Ativo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Links de Afiliado */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Links de Afiliado</h1>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Link Principal</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`https://raspouganhou.com/?ref=${affiliateData.affiliate_code}`}
                    readOnly
                    className="flex-1 py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <button
                    onClick={() => copyToClipboard(`https://raspouganhou.com/?ref=${affiliateData.affiliate_code}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Criar Link Personalizado</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Campanha</label>
                    <input
                      type="text"
                      placeholder="Ex: instagram, facebook, youtube"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Fonte</label>
                    <input
                      type="text"
                      placeholder="Ex: story, post, video"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Gerar Link Personalizado
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cupons */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Meus Cupons</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(affiliateData.coupons || []).map((coupon) => (
                  <div key={coupon.id} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">{coupon.name}</h3>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Código: <span className="text-white font-mono">{coupon.code}</span></p>
                      <p className="text-gray-400 text-sm">Bônus: <span className="text-green-400 font-bold">{formatCurrency(coupon.bonus)}</span></p>
                      <p className="text-gray-400 text-sm">{coupon.description}</p>
                    </div>
                  </div>
                ))}
                
                {(!affiliateData.coupons || affiliateData.coupons.length === 0) && (
                  <div className="col-span-full text-center py-8">
                    <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum cupom atribuído</p>
                    <p className="text-gray-500 text-sm">Entre em contato com o administrador para solicitar cupons</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configurações */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Configurações</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notificações */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notificações</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Novas conversões</span>
                      <input
                        type="checkbox"
                        checked={notifications.newConversions}
                        onChange={(e) => setNotifications({...notifications, newConversions: e.target.checked})}
                        className="w-4 h-4"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Novos depósitos</span>
                      <input
                        type="checkbox"
                        checked={notifications.newDeposits}
                        onChange={(e) => setNotifications({...notifications, newDeposits: e.target.checked})}
                        className="w-4 h-4"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Alterações na comissão</span>
                      <input
                        type="checkbox"
                        checked={notifications.commissionChanges}
                        onChange={(e) => setNotifications({...notifications, commissionChanges: e.target.checked})}
                        className="w-4 h-4"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Frequência</label>
                      <select
                        value={notifications.frequency}
                        onChange={(e) => setNotifications({...notifications, frequency: e.target.value})}
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="realtime">Tempo real</option>
                        <option value="daily">Diária</option>
                        <option value="weekly">Semanal</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Segurança */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Segurança</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Autenticação 2FA</span>
                      <input
                        type="checkbox"
                        checked={security.twoFactor}
                        onChange={(e) => setSecurity({...security, twoFactor: e.target.checked})}
                        className="w-4 h-4"
                      />
                    </div>
                    
                    <div>
                      <span className="text-gray-300 text-sm">Último acesso:</span>
                      <p className="text-white">{formatDate(security.lastAccess)}</p>
                    </div>
                    
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors">
                      Encerrar Outras Sessões
                    </button>
                  </div>
                </div>

                {/* Integrações */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Integrações</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Google Analytics UTM</label>
                      <input
                        type="text"
                        placeholder="UA-XXXXXXXXX-X"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Facebook Pixel</label>
                      <input
                        type="text"
                        placeholder="Pixel ID"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
                      <input
                        type="url"
                        placeholder="https://seu-webhook.com/endpoint"
                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Visual */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Visual</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tema</label>
                      <select className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="dark">Escuro</option>
                        <option value="light">Claro</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Idioma</label>
                      <select className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="pt">Português</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Estilo dos Gráficos</label>
                      <select className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="modern">Moderno</option>
                        <option value="classic">Clássico</option>
                        <option value="minimal">Minimalista</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Affiliate;