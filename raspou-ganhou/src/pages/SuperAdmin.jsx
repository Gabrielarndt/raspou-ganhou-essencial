import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft,
    Users,
    CreditCard,
    TrendingUp,
    Settings,
    Shield,
    Trophy,
    UserCheck,
    BarChart3,
    DollarSign,
    Target,
    Calendar,
    Eye,
    Edit,
    Trash2,
    Plus,
    Download,
    Filter,
    Search,
    AlertTriangle,
    CheckCircle,
    Clock,
    Star,
    Gift,
    Zap,
    Crown,
    X
} from 'lucide-react';

const SuperAdmin = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [affiliates, setAffiliates] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [stats, setStats] = useState({});
    const [selectedAffiliate, setSelectedAffiliate] = useState(null);
    const [showCreateAffiliateModal, setShowCreateAffiliateModal] = useState(false);
    const [newAffiliateData, setNewAffiliateData] = useState({
        name: '',
        email: '',
        password: '',
        commission: '',
        cpa: ''
    });
    const [showAffiliateModal, setShowAffiliateModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showAffiliatePanel, setShowAffiliatePanel] = useState(false);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [showEditCouponModal, setShowEditCouponModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showViewAffiliateModal, setShowViewAffiliateModal] = useState(false);
    const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
    const [showEditAdminModal, setShowEditAdminModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        password: '',
        permissions: []
    });
    const [editingAdmin, setEditingAdmin] = useState({});
    const [showCreateLotteryModal, setShowCreateLotteryModal] = useState(false);
    const [showEditLotteryModal, setShowEditLotteryModal] = useState(false);
    const [editingLottery, setEditingLottery] = useState(null);
    const [lotteryForm, setLotteryForm] = useState({
        name: '',
        prize: '',
        description: '',
        date: '',
        time: '',
        maxParticipants: '',
        entryCost: '',
        status: 'agendado'
    });
    const [newLotteryData, setNewLotteryData] = useState({
        name: '',
        prize: '',
        description: '',
        date: '',
        time: '',
        maxParticipants: '',
        entryCost: '',
        status: 'agendado'
    });


    const [newAffiliate, setNewAffiliate] = useState({
        name: '',
        email: '',
        password: '',
        commission: 5,
        cpa: 0
    });
    const [newCoupon, setNewCoupon] = useState({
        name: '',
        bonus_amount: 0,
        description: ''
    });
    const [editCoupon, setEditCoupon] = useState({});
    const [editUser, setEditUser] = useState({});
    const [editUserData, setEditUserData] = useState({});

    // Verificar se é super admin
    const isSuperAdmin = () => {
        // Verificar se há usuário logado como super admin
        const savedUser = localStorage.getItem('raspou_user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                return parsedUser.is_super_admin === true;
            } catch (error) {
                return false;
            }
        }
        return false;
    };

    useEffect(() => {
        if (!isSuperAdmin()) {
            navigate('/super-admin-login');
            return;
        }

        loadData();
    }, [navigate]);

    const loadData = () => {
        // Carregar dados do localStorage
        const savedUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
        const savedTransactions = JSON.parse(localStorage.getItem('raspou_transactions') || '[]');
        const savedAffiliates = JSON.parse(localStorage.getItem('raspou_affiliates') || '[]');
        const savedAdmins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
        const savedSuperAdmins = JSON.parse(localStorage.getItem('raspou_super_admins') || '[]');

        // Combinar administradores e super administradores, removendo duplicatas por ID
        const allAdmins = [...savedAdmins, ...savedSuperAdmins];
        const uniqueAdmins = allAdmins.filter((admin, index, self) =>
            index === self.findIndex(a => a.id === admin.id)
        );

        setUsers(savedUsers);
        setTransactions(savedTransactions);
        setAffiliates(savedAffiliates);
        setAdmins(uniqueAdmins);

        calculateStats(savedUsers, savedTransactions, savedAffiliates);
    };

    const calculateStats = (users, transactions, affiliates) => {
        const totalUsers = users.length;
        const totalAffiliates = affiliates.length;

        const totalDeposits = transactions
            .filter(t => t.type === 'deposit' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalWithdraws = transactions
            .filter(t => t.type === 'withdraw' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalUserBalances = users.reduce((sum, u) => sum + (u.saldo_real || 0), 0);
        const totalAffiliateCommissions = affiliates.reduce((sum, a) => sum + (a.total_commission || 0), 0);

        // Lucro real = Depósitos - Saldos dos usuários - Comissões dos afiliados
        const realProfit = totalDeposits - totalUserBalances - totalAffiliateCommissions;

        const avgDeposit = totalDeposits / Math.max(transactions.filter(t => t.type === 'deposit').length, 1);
        const avgWithdraw = totalWithdraws / Math.max(transactions.filter(t => t.type === 'withdraw').length, 1);

        setStats({
            totalUsers,
            totalAffiliates,
            totalDeposits,
            totalWithdraws,
            totalUserBalances,
            totalAffiliateCommissions,
            realProfit,
            avgDeposit,
            avgWithdraw,
            pendingWithdraws: transactions.filter(t => t.type === 'withdraw' && t.status === 'processing').length
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const handleCreateAdmin = () => {
        if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Verificar se email já existe
        const allUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
        const allAdmins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
        
        if (allUsers.find(u => u.email === newAdmin.email) || allAdmins.find(a => a.email === newAdmin.email)) {
            alert('Este email já está cadastrado');
            return;
        }

        const adminData = {
            id: Date.now(),
            name: newAdmin.name,
            email: newAdmin.email,
            password: newAdmin.password,
            permissions: newAdmin.permissions,
            status: 'active',
            created_at: new Date().toISOString(),
            is_admin: true
        };

        const updatedAdmins = [...admins, adminData];
        const currentAdmins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
        const newAdminsList = [...currentAdmins, adminData];
        localStorage.setItem('raspou_admins', JSON.stringify(newAdminsList));

        // Adicionar também à lista de usuários para login
        const currentUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
        const newUsersList = [...currentUsers, adminData];
        localStorage.setItem('raspou_users', JSON.stringify(newUsersList));

        setShowCreateAdminModal(false);
        setNewAdmin({ name: '', email: '', password: '', permissions: [] });
        alert('Administrador criado com sucesso!');
        loadData();
    };

    const toggleNewAdminPermission = (permission) => {
        setNewAdmin(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const toggleAdminPermission = (permission) => {
        setEditingAdmin(prev => ({
            ...prev,
            permissions: (prev.permissions || []).includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...(prev.permissions || []), permission]
        }));
    };

    // Função para criar sorteio
    const handleCreateLottery = (e) => {
        e.preventDefault();
        
        if (!user) {
            console.error('❌ SuperAdmin: No user found for lottery creation');
            return;
        }

        // Validar campos obrigatórios
        if (!newLotteryData.name || !newLotteryData.prize || !newLotteryData.date || !newLotteryData.time) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Criar novo sorteio
        const newLottery = {
            id: Date.now().toString(),
            ...newLotteryData,
            participants: [],
            createdAt: new Date().toISOString(),
            createdBy: user.email
        };

        // Salvar no localStorage
        const existingLotteries = JSON.parse(localStorage.getItem('raspou_lotteries') || '[]');
        existingLotteries.push(newLottery);
        localStorage.setItem('raspou_lotteries', JSON.stringify(existingLotteries));

        // Resetar formulário e fechar modal
        setNewLotteryData({
            name: '',
            description: '',
            prize: '',
            date: '',
            time: '',
            maxParticipants: '',
            entryCost: '',
            status: 'agendado'
        });
        setShowCreateLotteryModal(false);
        
        // Atualizar lista (se necessário)
        console.log('Sorteio criado:', newLottery);
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin({ ...admin });
        setShowEditAdminModal(true);
    };

    const handleUpdateAdmin = () => {
        if (!editingAdmin.name || !editingAdmin.email) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        const updatedAdmin = {
            ...editingAdmin,
            updated_at: new Date().toISOString()
        };

        // Se nova senha foi fornecida, atualizar
        if (editingAdmin.newPassword) {
            updatedAdmin.password = editingAdmin.newPassword;
            delete updatedAdmin.newPassword;
        }

        // Atualizar na lista de admins
        const currentAdmins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
        const updatedAdmins = currentAdmins.map(a => a.id === editingAdmin.id ? updatedAdmin : a);
        localStorage.setItem('raspou_admins', JSON.stringify(updatedAdmins));

        // Atualizar também na lista de usuários
        const currentUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
        const updatedUsers = currentUsers.map(u => u.id === editingAdmin.id ? updatedAdmin : u);
        localStorage.setItem('raspou_users', JSON.stringify(updatedUsers));

        setShowEditAdminModal(false);
        setEditingAdmin({});
        alert('Administrador atualizado com sucesso!');
        loadData();
    };

    const handleDeleteAdmin = (adminId) => {
        if (window.confirm('Tem certeza que deseja excluir este administrador?')) {
            // Remover da lista de admins
            const currentAdmins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
            const updatedAdmins = currentAdmins.filter(a => a.id !== adminId);
            localStorage.setItem('raspou_admins', JSON.stringify(updatedAdmins));

            // Remover também da lista de usuários
            const currentUsers = JSON.parse(localStorage.getItem('raspou_users') || '[]');
            const updatedUsers = currentUsers.filter(u => u.id !== adminId);
            localStorage.setItem('raspou_users', JSON.stringify(updatedUsers));

            alert('Administrador excluído com sucesso!');
            loadData();
        }
    };

    const handleCreateAffiliate = () => {
        setShowCreateAffiliateModal(true);
    };

    const handleSaveAffiliate = () => {
        const { name, email, password, commission, cpa } = newAffiliateData;

        if (!name || !email || !password) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Verificar se email já existe
        if (affiliates.find(a => a.email === email)) {
            alert('Este email já está cadastrado');
            return;
        }

        const newAffiliate = {
            id: Date.now(),
            name,
            email,
            password,
            commission: parseFloat(commission) || 0,
            cpa: parseFloat(cpa) || 0,
            total_clients: 0,
            total_deposits: 0,
            total_commission: 0,
            created_at: new Date().toISOString(),
            is_affiliate: true
        };

        const updatedAffiliates = [...affiliates, newAffiliate];
        setAffiliates(updatedAffiliates);
        localStorage.setItem('raspou_affiliates', JSON.stringify(updatedAffiliates));

        // Resetar formulário e fechar modal
        setNewAffiliateData({
            name: '',
            email: '',
            password: '',
            commission: '',
            cpa: ''
        });
        setShowCreateAffiliateModal(false);

        alert('Afiliado criado com sucesso!');
        loadData();
    };

    const handleCancelCreateAffiliate = () => {
        setNewAffiliateData({
            name: '',
            email: '',
            password: '',
            commission: '',
            cpa: ''
        });
        setShowCreateAffiliateModal(false);
    };

    const handleDeleteAffiliate = (affiliateId) => {
        if (window.confirm('Tem certeza que deseja excluir este afiliado?')) {
            const updatedAffiliates = affiliates.filter(a => a.id !== affiliateId);
            setAffiliates(updatedAffiliates);
            localStorage.setItem('raspou_affiliates', JSON.stringify(updatedAffiliates));
            alert('Afiliado excluído com sucesso!');
            loadData();
        }
    };

    const handleSaveNewAffiliate = () => {
        if (!newAffiliate.name || !newAffiliate.email || !newAffiliate.password) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        const affiliate = {
            id: Date.now(),
            ...newAffiliate,
            total_clients: 0,
            total_deposits: 0,
            total_commission: 0,
            created_at: new Date().toISOString(),
            is_affiliate: true
        };

        const updatedAffiliates = [...affiliates, affiliate];
        setAffiliates(updatedAffiliates);
        localStorage.setItem('raspou_affiliates', JSON.stringify(updatedAffiliates));

        setShowAffiliateModal(false);
        setNewAffiliate({ name: '', email: '', password: '', commission: 5, cpa: 0 });
    };

    const handleEditAffiliate = (affiliate) => {
        setSelectedAffiliate(affiliate);
        setShowAffiliatePanel(true);
    };

    const handleUpdateAffiliate = () => {
        const affiliates = JSON.parse(localStorage.getItem('raspou_affiliates') || '[]');
        const updatedAffiliates = affiliates.map(a =>
            a.id === selectedAffiliate.id ? selectedAffiliate : a
        );

        localStorage.setItem('raspou_affiliates', JSON.stringify(updatedAffiliates));
        setAffiliates(updatedAffiliates);
        alert('Afiliado atualizado com sucesso!');
    };

    const handleCreateCoupon = () => {
        if (!newCoupon.name || !newCoupon.bonus_amount) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Verificar se já existe cupom com esse nome
        const coupons = JSON.parse(localStorage.getItem('raspou_coupons') || '[]');
        if (coupons.find(c => c.name.toLowerCase() === newCoupon.name.toLowerCase())) {
            alert('Já existe um cupom com esse nome');
            return;
        }

        const coupon = {
            id: Date.now(),
            affiliate_id: selectedAffiliate.id,
            affiliate_name: selectedAffiliate.name,
            name: newCoupon.name.toUpperCase(),
            bonus_amount: parseFloat(newCoupon.bonus_amount),
            description: newCoupon.description,
            created_at: new Date().toISOString(),
            status: 'active',
            uses: 0
        };

        coupons.push(coupon);
        localStorage.setItem('raspou_coupons', JSON.stringify(coupons));

        setNewCoupon({ name: '', bonus_amount: 0, description: '' });
        setShowCouponModal(false);
        alert('Cupom criado com sucesso!');
        loadData(); // Recarregar dados
    };

    const handleEditCoupon = (coupon) => {
        setSelectedCoupon(coupon);
        setEditCoupon({ ...coupon });
        setShowEditCouponModal(true);
    };

    const handleUpdateCoupon = () => {
        const coupons = JSON.parse(localStorage.getItem('raspou_coupons') || '[]');
        const updatedCoupons = coupons.map(c =>
            c.id === selectedCoupon.id ? editCoupon : c
        );

        localStorage.setItem('raspou_coupons', JSON.stringify(updatedCoupons));
        setShowEditCouponModal(false);
        alert('Cupom atualizado com sucesso!');
        loadData();
    };

    const handleDeleteCoupon = (couponId) => {
        if (window.confirm('Tem certeza que deseja excluir este cupom?')) {
            const coupons = JSON.parse(localStorage.getItem('raspou_coupons') || '[]');
            const updatedCoupons = coupons.filter(c => c.id !== couponId);
            localStorage.setItem('raspou_coupons', JSON.stringify(updatedCoupons));
            alert('Cupom excluído com sucesso!');
            loadData();
        }
    };

    const getAffiliateCoupons = (affiliateId) => {
        const coupons = JSON.parse(localStorage.getItem('raspou_coupons') || '[]');
        return coupons.filter(c => c.affiliate_id === affiliateId);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditUserData({
            nome: user.nome || '',
            email: user.email || '',
            telefone: user.telefone || '',
            status: user.status || 'active',
            saldo_real: user.saldo_real || 0,
            saldo_bonus: user.saldo_bonus || 0
        });
        setShowEditUserModal(true);
    };

    const handleDeleteUser = (user) => {
        if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.nome}? Esta ação não pode ser desfeita.`)) {
            const updatedUsers = users.filter(u => u.id !== user.id);
            setUsers(updatedUsers);
            localStorage.setItem('raspou_users', JSON.stringify(updatedUsers));

            // Remover também transações e histórico do usuário
            const updatedTransactions = transactions.filter(t => t.user_id !== user.id);
            localStorage.setItem('raspou_transactions', JSON.stringify(updatedTransactions));

            const gameHistory = JSON.parse(localStorage.getItem('raspou_game_history') || '[]');
            const updatedGameHistory = gameHistory.filter(g => g.user_id !== user.id);
            localStorage.setItem('raspou_game_history', JSON.stringify(updatedGameHistory));

            alert('Usuário excluído com sucesso!');
            loadData();
        }
    };

    const handleSaveUserEdit = () => {
        const updatedUsers = users.map(u =>
            u.id === selectedUser.id
                ? {
                    ...u,
                    nome: editUserData.nome,
                    telefone: editUserData.telefone,
                    status: editUserData.status,
                    saldo_real: parseFloat(editUserData.saldo_real) || 0,
                    saldo_bonus: parseFloat(editUserData.saldo_bonus) || 0
                }
                : u
        );

        setUsers(updatedUsers);
        localStorage.setItem('raspou_users', JSON.stringify(updatedUsers));

        // Se o usuário editado está logado, atualizar também o localStorage do usuário atual
        const currentUser = JSON.parse(localStorage.getItem('raspou_user') || '{}');
        if (currentUser.id === selectedUser.id) {
            const updatedCurrentUser = updatedUsers.find(u => u.id === selectedUser.id);
            localStorage.setItem('raspou_user', JSON.stringify(updatedCurrentUser));
        }

        setShowEditUserModal(false);
        setSelectedUser(null);
        setEditUserData({});
        alert('Usuário atualizado com sucesso!');
        loadData();
    };

    const handleCancelUserEdit = () => {
        setShowEditUserModal(false);
        setSelectedUser(null);
        setEditUserData({});
    };

    const handleUserInputChange = (field, value) => {
        setEditUserData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleAffiliateInputChange = (field, value) => {
        setNewAffiliateData(prev => ({
            ...prev,
      [field]: value
    });
  };

  const handleCreateLottery = () => {
    // Verificar se há usuário autenticado
    if (!user || loading) {
      console.log('❌ SuperAdmin: User not authenticated or still loading');
      return;
    }

    // Verificar se tem permissão (qualquer admin pode criar)
    if (!user.is_super_admin && !user.is_admin) {
      console.log('❌ SuperAdmin: User does not have admin permissions');
      alert('Você não tem permissão para criar sorteios');
      return;
    }

        }));
    };

    if (!isSuperAdmin()) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-20 lg:pb-8">
            <div className="container mx-auto px-4 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">

                    <h1 className="text-2xl lg:text-3xl font-bold text-red-400">Super Administrador</h1>
                    <div className="flex items-center space-x-2">
                        <Crown className="w-6 h-6 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">Master</span>
                    </div>
                </div>

                {/* Navegação */}
                <div className="flex flex-wrap gap-2 mb-8 bg-gray-800 p-2 rounded-xl">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                        { id: 'clients', label: 'Clientes', icon: Users },
                        { id: 'affiliates', label: 'Afiliados', icon: UserCheck },
                        { id: 'admins', label: 'Administradores', icon: Shield },
                        { id: 'raffles', label: 'Sorteios', icon: Trophy },
                        { id: 'settings', label: 'Configurações', icon: Settings }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Dashboard */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {/* Estatísticas Principais */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-center">
                                <Users className="w-8 h-8 text-white mx-auto mb-2" />
                                <p className="text-white/80 text-sm">Total Usuários</p>
                                <p className="text-white text-2xl font-bold">{stats.totalUsers}</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-center">
                                <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                                <p className="text-white/80 text-sm">Total Depositado</p>
                                <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalDeposits)}</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center">
                                <DollarSign className="w-8 h-8 text-white mx-auto mb-2" />
                                <p className="text-white/80 text-sm">Total Sacado</p>
                                <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalWithdraws)}</p>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-center">
                                <Target className="w-8 h-8 text-white mx-auto mb-2" />
                                <p className="text-white/80 text-sm">Lucro Real</p>
                                <p className="text-white text-2xl font-bold">{formatCurrency(stats.realProfit)}</p>
                            </div>
                        </div>

                        {/* Estatísticas Secundárias */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-800 rounded-xl p-4 text-center">
                                <UserCheck className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Afiliados</p>
                                <p className="text-white text-xl font-bold">{stats.totalAffiliates}</p>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-4 text-center">
                                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Média Depósito</p>
                                <p className="text-white text-xl font-bold">{formatCurrency(stats.avgDeposit)}</p>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-4 text-center">
                                <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Saldos Usuários</p>
                                <p className="text-white text-xl font-bold">{formatCurrency(stats.totalUserBalances)}</p>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-4 text-center">
                                <Gift className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Comissões Pagas</p>
                                <p className="text-white text-xl font-bold">{formatCurrency(stats.totalAffiliateCommissions)}</p>
                            </div>
                        </div>

                        {/* Gráficos e Relatórios */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">Transações Recentes</h3>
                                <div className="space-y-3">
                                    {transactions.slice(0, 5).map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded-full ${transaction.type === 'deposit' ? 'bg-green-400' : 'bg-red-400'
                                                    }`}></div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">
                                                        {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">{formatDate(transaction.date)}</p>
                                                </div>
                                            </div>
                                            <p className={`font-bold ${transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">Usuários Recentes</h3>
                                <div className="space-y-3">
                                    {users.slice(-5).map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">{user.nome?.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{user.nome}</p>
                                                    <p className="text-gray-400 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                            <p className="text-green-400 font-bold text-sm">
                                                {formatCurrency((user.saldo_real || 0) + (user.saldo_bonus || 0))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gestão de Clientes */}
                {activeTab === 'clients' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar clientes..."
                                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                                <Download className="w-4 h-4" />
                                <span>Exportar</span>
                            </button>
                        </div>

                        {/* Médias dos Usuários */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-800 rounded-xl p-4 text-center">
                                <p className="text-gray-400 text-sm">Depósito Médio</p>
                                <p className="text-green-400 text-lg font-bold">{formatCurrency(stats.avgDeposit)}</p>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 text-center">
                                <p className="text-gray-400 text-sm">Saque Médio</p>
                                <p className="text-red-400 text-lg font-bold">{formatCurrency(stats.avgWithdraw)}</p>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 text-center">
                                <p className="text-gray-400 text-sm">Saldo Médio</p>
                                <p className="text-yellow-400 text-lg font-bold">
                                    {formatCurrency(stats.totalUserBalances / Math.max(stats.totalUsers, 1))}
                                </p>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 text-center">
                                <p className="text-gray-400 text-sm">Total Clientes</p>
                                <p className="text-blue-400 text-lg font-bold">{stats.totalUsers}</p>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contato</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Saldo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Depósitos</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-600">
                                        {users.filter(u => !u.is_admin && !u.is_super_admin).map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                                            <span className="text-white font-bold text-sm">{user.nome?.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">{user.nome}</div>
                                                            <div className="text-sm text-gray-400">
                                                                {user.cpf ? `${user.cpf.substring(0, 3)}.**.*${user.cpf.slice(-2)}` : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-300">{user.email}</div>
                                                    <div className="text-sm text-gray-400">{user.telefone || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">
                                                    {formatCurrency(user.saldo_real || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-bold">
                                                    {formatCurrency(user.total_deposited || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'banned' ? 'bg-red-100 text-red-800' :
                                                            user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                        }`}>
                                                        {user.status === 'banned' ? 'Banido' :
                                                            user.status === 'suspended' ? 'Suspenso' : 'Ativo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewUser(user)}
                                                            className="text-blue-400 hover:text-blue-300"
                                                            title="Visualizar"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="text-yellow-400 hover:text-yellow-300"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="text-red-400 hover:text-red-300"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gestão de Afiliados */}
                {activeTab === 'affiliates' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <h2 className="text-xl font-bold text-white">Gestão de Afiliados</h2>
                            <button
                                onClick={handleCreateAffiliate}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Novo Afiliado</span>
                            </button>
                        </div>

                        <div className="bg-gray-800 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Afiliado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Clientes</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Depósitos</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Comissão</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-600">
                                        {affiliates.map((affiliate) => (
                                            <tr key={affiliate.id} className="hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                                                            <span className="text-white font-bold text-sm">{affiliate.name?.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">{affiliate.name}</div>
                                                            <div className="text-sm text-gray-400">{affiliate.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                    {affiliate.total_clients || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">
                                                    {formatCurrency(affiliate.total_deposits || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-bold">
                                                    {formatCurrency(affiliate.total_commission || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAffiliate(affiliate);
                                                                setShowViewAffiliateModal(true);
                                                            }}
                                                            className="text-blue-400 hover:text-blue-300"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAffiliate(affiliate);
                                                                setShowAffiliatePanel(true);
                                                            }}
                                                            className="text-yellow-400 hover:text-yellow-300"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAffiliate(affiliate.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gestão de Administradores */}
                {activeTab === 'admins' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <h2 className="text-xl font-bold text-white">Gestão de Administradores</h2>
                            <button
                                onClick={() => setShowCreateAdminModal(true)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Novo Admin</span>
                            </button>
                        </div>

                        <div className="bg-gray-800 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Administrador</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Permissões</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Criado em</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-600">
                                        {admins.map((admin) => (
                                            <tr key={admin.id} className="hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                                                            <span className="text-white font-bold text-sm">{admin.name?.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">{admin.name}</div>
                                                            <div className="text-sm text-gray-400">Administrador</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{admin.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(admin.permissions || []).map((perm) => (
                                                            <span key={perm} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                {perm}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {admin.created_at ? formatDate(admin.created_at) : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => handleEditAdmin(admin)}
                                                            className="text-yellow-400 hover:text-yellow-300"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteAdmin(admin.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sorteios */}
                {activeTab === 'raffles' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <h2 className="text-xl font-bold text-white">Gestão de Sorteios</h2>
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                                onClick={() => setShowCreateLotteryModal(true)}

                              >
                                <Plus className="w-4 h-4" />
                                <span>Novo Sorteio</span>
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">Próximo Sorteio</h3>
                                <div className="space-y-4">
                                    <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
                                        <h4 className="text-yellow-400 font-bold mb-2">Sorteio Diário</h4>
                                        <p className="text-white text-2xl font-bold mb-2">R$ 5.000,00</p>
                                        <p className="text-gray-400 text-sm">Hoje às 20:00</p>
                                        <p className="text-gray-400 text-sm">1.247 participantes</p>
                                    </div>
                                    <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-lg transition-colors">
                                        Editar Sorteio
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">Histórico de Sorteios</h3>
                                <div className="text-center py-8">
                                    <p className="text-gray-400">Nenhum sorteio realizado ainda</p>
                                    <p className="text-gray-500 text-sm mt-2">O histórico aparecerá após os primeiros sorteios</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Configurações */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>

                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">Parâmetros Financeiros</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Valor Mínimo de Depósito</label>
                                        <input
                                            type="number"
                                            defaultValue="10"
                                            className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Valor Mínimo de Saque</label>
                                        <input
                                            type="number"
                                            defaultValue="20"
                                            className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Limite Diário de Saque</label>
                                        <input
                                            type="number"
                                            defaultValue="5000"
                                            className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">Controle de Bônus</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Bônus de Boas-vindas (%)</label>
                                        <input
                                            type="number"
                                            defaultValue="100"
                                            className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Valor Mínimo para Bônus</label>
                                        <input
                                            type="number"
                                            defaultValue="50"
                                            className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Porcentagem Máxima de Bônus</label>
                                        <input
                                            type="number"
                                            defaultValue="200"
                                            className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                Salvar Configurações
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Criar Sorteio */}
            {showCreateLotteryModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Criar Novo Sorteio</h3>
                            <button
                                onClick={() => {
                                    setShowCreateLotteryModal(false);
                                    setNewLotteryData({
                                        name: '',
                                        prize: '',
                                        description: '',
                                        date: '',
                                        time: '',
                                        maxParticipants: '',
                                        entryCost: '',
                                        status: 'agendado'
                                    });
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome do Sorteio *
                                </label>
                                <input
                                    type="text"
                                    value={newLotteryData.name}
                                    onChange={(e) => setNewLotteryData({...newLotteryData, name: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="Ex: Sorteio Diário"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Valor do Prêmio (R$) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newLotteryData.prize}
                                    onChange={(e) => setNewLotteryData({...newLotteryData, prize: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="5000.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Data do Sorteio *
                                </label>
                                <input
                                    type="date"
                                    value={newLotteryData.date}
                                    onChange={(e) => setNewLotteryData({...newLotteryData, date: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Horário do Sorteio *
                                </label>
                                <input
                                    type="time"
                                    value={newLotteryData.time}
                                    onChange={(e) => setNewLotteryData({...newLotteryData, time: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Máximo de Participantes
                                </label>
                                <input
                                    type="number"
                                    value={newLotteryData.maxParticipants}
                                    onChange={(e) => setNewLotteryData({...newLotteryData, maxParticipants: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="Deixe vazio para ilimitado"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Custo de Participação (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newLotteryData.entryCost}
                                    onChange={(e) => setNewLotteryData({...newLotteryData, entryCost: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="0.00 para gratuito"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={newLotteryData.description}
                                    onChange={(e) => setNewLotteryData({...newLotteryData, description: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    rows="3"
                                    placeholder="Descrição do sorteio..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={newLotteryData.status}
                                    onChange={(e) => setNewLotteryData({...newLotteryData, status: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="scheduled">Agendado</option>
                                    <option value="active">Ativo</option>
                                    <option value="completed">Finalizado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateLotteryModal(false);
                                    setNewLotteryData({
                                        name: '',
                                        prize: '',
                                        description: '',
                                        date: '',
                                        time: '',
                                        maxParticipants: '',
                                        entryCost: '',
                                        status: 'agendado'
                                    });
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateLottery}
                                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Criar Sorteio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Sorteio */}
            {showEditLotteryModal && editingLottery && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Editar Sorteio</h3>
                            <button
                                onClick={() => {
                                    setShowEditLotteryModal(false);
                                    setEditingLottery(null);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome do Sorteio *
                                </label>
                                <input
                                    type="text"
                                    value={editingLottery.name}
                                    onChange={(e) => setEditingLottery({...editingLottery, name: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Valor do Prêmio (R$) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editingLottery.prize}
                                    onChange={(e) => setEditingLottery({...editingLottery, prize: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Data do Sorteio *
                                </label>
                                <input
                                    type="date"
                                    value={editingLottery.draw_date}
                                    onChange={(e) => setEditingLottery({...editingLottery, draw_date: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Horário do Sorteio *
                                </label>
                                <input
                                    type="time"
                                    value={editingLottery.draw_time}
                                    onChange={(e) => setEditingLottery({...editingLottery, draw_time: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Máximo de Participantes
                                </label>
                                <input
                                    type="number"
                                    value={editingLottery.max_participants || ''}
                                    onChange={(e) => setEditingLottery({...editingLottery, max_participants: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="Deixe vazio para ilimitado"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Custo de Participação (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editingLottery.entry_cost || ''}
                                    onChange={(e) => setEditingLottery({...editingLottery, entry_cost: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="0.00 para gratuito"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={editingLottery.description}
                                    onChange={(e) => setEditingLottery({...editingLottery, description: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={editingLottery.status}
                                    onChange={(e) => setEditingLottery({...editingLottery, status: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="scheduled">Agendado</option>
                                    <option value="active">Ativo</option>
                                    <option value="completed">Finalizado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>
                        </div>

                        {/* Informações dos Participantes */}
                        {editingLottery.participants && editingLottery.participants.length > 0 && (
                            <div className="mt-6 bg-gray-700 rounded-lg p-4">
                                <h4 className="text-white font-bold mb-3">Participantes ({editingLottery.participants.length})</h4>
                                <div className="max-h-32 overflow-y-auto">
                                    {editingLottery.participants.map((participant, index) => (
                                        <div key={index} className="flex justify-between items-center py-1 text-sm">
                                            <span className="text-gray-300">{participant.name}</span>
                                            <span className="text-gray-400">{participant.email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowEditLotteryModal(false);
                                    setEditingLottery(null);
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEditLottery}
                                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Painel de Gerenciamento de Afiliado */}
            {showAffiliatePanel && selectedAffiliate && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h2 className="text-2xl font-bold text-white">
                                Gerenciar Afiliado: {selectedAffiliate.name}
                            </h2>
                            <button
                                onClick={() => setShowAffiliatePanel(false)}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 grid lg:grid-cols-2 gap-8">
                            {/* Informações do Afiliado */}
                            <div className="space-y-6">
                                <div className="bg-gray-800 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Informações do Afiliado</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                                            <input
                                                type="text"
                                                value={selectedAffiliate.name}
                                                onChange={(e) => setSelectedAffiliate({ ...selectedAffiliate, name: e.target.value })}
                                                className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={selectedAffiliate.email}
                                                onChange={(e) => setSelectedAffiliate({ ...selectedAffiliate, email: e.target.value })}
                                                className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                            <select
                                                value={selectedAffiliate.status}
                                                onChange={(e) => setSelectedAffiliate({ ...selectedAffiliate, status: e.target.value })}
                                                className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            >
                                                <option value="active">Ativo</option>
                                                <option value="suspended">Suspenso</option>
                                                <option value="inactive">Inativo</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Comissão (%)</label>
                                            <input
                                                type="number"
                                                value={selectedAffiliate.commission}
                                                onChange={(e) => setSelectedAffiliate({ ...selectedAffiliate, commission: parseFloat(e.target.value) })}
                                                className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">CPA (R$)</label>
                                            <input
                                                type="number"
                                                value={selectedAffiliate.cpa}
                                                onChange={(e) => setSelectedAffiliate({ ...selectedAffiliate, cpa: parseFloat(e.target.value) })}
                                                className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpdateAffiliate}
                                        className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition-colors"
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>

                            {/* Gerenciamento de Cupons */}
                            <div className="space-y-6">
                                <div className="bg-gray-800 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white">Cupons de Desconto</h3>
                                        <button
                                            onClick={() => setShowCouponModal(true)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Novo Cupom</span>
                                        </button>
                                    </div>

                                    {/* Lista de Cupons */}
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {getAffiliateCoupons(selectedAffiliate.id).map((coupon) => (
                                            <div key={coupon.id} className="bg-gray-700 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="bg-yellow-600 text-black px-2 py-1 rounded text-sm font-bold">
                                                            {coupon.name}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${coupon.status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                                            }`}>
                                                            {coupon.status === 'active' ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditCoupon(coupon)}
                                                            className="text-yellow-400 hover:text-yellow-300"
                                                            title="Editar cupom"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCoupon(coupon.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                            title="Excluir cupom"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-sm text-gray-300">
                                                    <p><strong>Bônus:</strong> {formatCurrency(coupon.bonus_amount)}</p>
                                                    <p><strong>Usos:</strong> {coupon.uses || 0}</p>
                                                    {coupon.description && (
                                                        <p><strong>Descrição:</strong> {coupon.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {getAffiliateCoupons(selectedAffiliate.id).length === 0 && (
                                            <div className="text-center py-8 text-gray-400">
                                                <p>Nenhum cupom criado ainda</p>
                                                <p className="text-sm">Clique em "Novo Cupom" para começar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Criação de Cupom */}
            {showCouponModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Criar Novo Cupom</h2>
                            <button
                                onClick={() => setShowCouponModal(false)}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome do Cupom *
                                </label>
                                <input
                                    type="text"
                                    value={newCoupon.name}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value.toUpperCase() })}
                                    placeholder="Ex: BONUS10"
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Valor do Bônus (R$) *
                                </label>
                                <input
                                    type="number"
                                    value={newCoupon.bonus_amount}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, bonus_amount: e.target.value })}
                                    placeholder="10.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={newCoupon.description}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                    placeholder="Descrição opcional do cupom..."
                                    rows="3"
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4 mt-6">
                            <button
                                onClick={() => setShowCouponModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateCoupon}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Criar Cupom
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição de Cupom */}
            {showEditCouponModal && selectedCoupon && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Editar Cupom</h2>
                            <button
                                onClick={() => setShowEditCouponModal(false)}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome do Cupom
                                </label>
                                <input
                                    type="text"
                                    value={editCoupon.name}
                                    onChange={(e) => setEditCoupon({ ...editCoupon, name: e.target.value.toUpperCase() })}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Valor do Bônus (R$)
                                </label>
                                <input
                                    type="number"
                                    value={editCoupon.bonus_amount}
                                    onChange={(e) => setEditCoupon({ ...editCoupon, bonus_amount: parseFloat(e.target.value) })}
                                    step="0.01"
                                    min="0"
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={editCoupon.status}
                                    onChange={(e) => setEditCoupon({ ...editCoupon, status: e.target.value })}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={editCoupon.description}
                                    onChange={(e) => setEditCoupon({ ...editCoupon, description: e.target.value })}
                                    rows="3"
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4 mt-6">
                            <button
                                onClick={() => setShowEditCouponModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateCoupon}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition-colors"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Criação de Administrador */}
            {showCreateAdminModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Criar Novo Administrador</h3>
                            <button
                                onClick={() => {
                                    setShowCreateAdminModal(false);
                                    setNewAdmin({ name: '', email: '', password: '', permissions: [] });
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Nome do administrador"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                                <input
                                    type="password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Senha do administrador"
                                />
                            </div>

                            {/* Permissões */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Permissões</label>
                                <div className="space-y-2">
                                    {['users', 'transactions', 'games', 'affiliates', 'reports'].map((permission) => (
                                        <label key={permission} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={newAdmin.permissions.includes(permission)}
                                                onChange={() => toggleNewAdminPermission(permission)}
                                                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-300 text-sm capitalize">{permission}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    onClick={handleCreateAdmin}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                                >
                                    Criar Administrador
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateAdminModal(false);
                                        setNewAdmin({ name: '', email: '', password: '', permissions: [] });
                                    }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição de Administrador */}
            {showEditAdminModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Editar Administrador</h3>
                            <button
                                onClick={() => {
                                    setShowEditAdminModal(false);
                                    setEditingAdmin({});
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={editingAdmin.name || ''}
                                    onChange={(e) => setEditingAdmin({...editingAdmin, name: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editingAdmin.email || ''}
                                    onChange={(e) => setEditingAdmin({...editingAdmin, email: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            {/* Nova Senha (opcional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nova Senha (opcional)</label>
                                <input
                                    type="password"
                                    value={editingAdmin.newPassword || ''}
                                    onChange={(e) => setEditingAdmin({...editingAdmin, newPassword: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="Deixe em branco para manter a atual"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                <select
                                    value={editingAdmin.status || 'active'}
                                    onChange={(e) => setEditingAdmin({...editingAdmin, status: e.target.value})}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="active">Ativo</option>
                                    <option value="suspended">Suspenso</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>

                            {/* Permissões */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Permissões</label>
                                <div className="space-y-2">
                                    {['users', 'transactions', 'games', 'affiliates', 'reports'].map((permission) => (
                                        <label key={permission} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={(editingAdmin.permissions || []).includes(permission)}
                                                onChange={() => toggleAdminPermission(permission)}
                                                className="rounded border-gray-600 bg-gray-700 text-yellow-600 focus:ring-yellow-500"
                                            />
                                            <span className="text-gray-300 text-sm capitalize">{permission}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    onClick={handleUpdateAdmin}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition-colors"
                                >
                                    Salvar Alterações
                                </button>
                                <button
                                    onClick={() => {
                                        setShowEditAdminModal(false);
                                        setEditingAdmin({});
                                    }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Visualização de Afiliado */}
            {showViewAffiliateModal && selectedAffiliate && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold text-xl">Painel do Afiliado: {selectedAffiliate.name}</h3>
                            <button
                                onClick={() => {
                                    setSelectedAffiliate(null);
                                    setShowViewAffiliateModal(false);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Dashboard do Afiliado */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-700 rounded-lg p-4 text-center">
                                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Clientes</p>
                                <p className="text-white text-xl font-bold">{selectedAffiliate.total_clients || 0}</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-4 text-center">
                                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Depósitos</p>
                                <p className="text-white text-xl font-bold">{formatCurrency(selectedAffiliate.total_deposits || 0)}</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-4 text-center">
                                <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Comissão</p>
                                <p className="text-white text-xl font-bold">{formatCurrency(selectedAffiliate.total_commission || 0)}</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => {
                                    setSelectedAffiliate(null);
                                    setShowViewAffiliateModal(false);
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Visualização de Usuário */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500/30">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold text-xl">Informações do Cliente</h3>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Dados Pessoais */}
                            <div className="space-y-4">
                                <h4 className="text-blue-400 font-bold text-lg">Dados Pessoais</h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                                    <p className="text-white bg-gray-700 py-2 px-3 rounded-lg">{selectedUser.nome || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                    <p className="text-white bg-gray-700 py-2 px-3 rounded-lg">{selectedUser.email || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                                    <p className="text-white bg-gray-700 py-2 px-3 rounded-lg">{selectedUser.telefone || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">CPF</label>
                                    <p className="text-white bg-gray-700 py-2 px-3 rounded-lg">{selectedUser.cpf || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Data de Cadastro</label>
                                    <p className="text-white bg-gray-700 py-2 px-3 rounded-lg">
                                        {selectedUser.data_cadastro ? formatDateTime(selectedUser.data_cadastro) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Dados Financeiros */}
                            <div className="space-y-4">
                                <h4 className="text-green-400 font-bold text-lg">Dados Financeiros</h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Saldo Real</label>
                                    <p className="text-green-400 bg-gray-700 py-2 px-3 rounded-lg font-bold">
                                        {formatCurrency(selectedUser.saldo_real || 0)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Saldo Bônus</label>
                                    <p className="text-yellow-400 bg-gray-700 py-2 px-3 rounded-lg font-bold">
                                        {formatCurrency(selectedUser.saldo_bonus || 0)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Pontos de Sorteio</label>
                                    <p className="text-purple-400 bg-gray-700 py-2 px-3 rounded-lg font-bold">
                                        {selectedUser.pontos_sorteio || 0} pts
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Total Ganho</label>
                                    <p className="text-blue-400 bg-gray-700 py-2 px-3 rounded-lg font-bold">
                                        {formatCurrency(selectedUser.total_ganho || 0)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Jogos Realizados</label>
                                    <p className="text-white bg-gray-700 py-2 px-3 rounded-lg font-bold">
                                        {selectedUser.jogos_realizados || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center space-x-4">
                            <button
                                onClick={() => handleEditUser(selectedUser)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Editar Usuário
                            </button>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição de Usuário */}
            {showEditUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-500/30">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold text-xl">Editar Cliente: {selectedUser.nome}</h3>
                            <button
                                onClick={handleCancelUserEdit}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Dados Pessoais */}
                            <div className="space-y-4">
                                <h4 className="text-yellow-400 font-bold text-lg">Dados Pessoais</h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={editUserData.nome}
                                        onChange={(e) => handleUserInputChange('nome', e.target.value)}
                                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={editUserData.email}
                                        disabled
                                        className="w-full py-2 px-3 bg-gray-600 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                                    />
                                    <p className="text-gray-400 text-xs mt-1">Email não pode ser alterado</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                                    <input
                                        type="tel"
                                        value={editUserData.telefone}
                                        onChange={(e) => handleUserInputChange('telefone', e.target.value)}
                                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status da Conta</label>
                                    <select
                                        value={editUserData.status}
                                        onChange={(e) => handleUserInputChange('status', e.target.value)}
                                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="suspended">Suspenso</option>
                                        <option value="banned">Banido</option>
                                    </select>
                                </div>
                            </div>

                            {/* Dados Financeiros */}
                            <div className="space-y-4">
                                <h4 className="text-green-400 font-bold text-lg">Dados Financeiros</h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Saldo Real (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editUserData.saldo_real}
                                        onChange={(e) => handleUserInputChange('saldo_real', e.target.value)}
                                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Saldo Bônus (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editUserData.saldo_bonus}
                                        onChange={(e) => handleUserInputChange('saldo_bonus', e.target.value)}
                                        className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>

                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h5 className="text-white font-medium mb-2">Informações Somente Leitura</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">CPF:</span>
                                            <span className="text-white">{selectedUser.cpf || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total Ganho:</span>
                                            <span className="text-green-400">{formatCurrency(selectedUser.total_ganho || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Jogos Realizados:</span>
                                            <span className="text-blue-400">{selectedUser.jogos_realizados || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Pontos Sorteio:</span>
                                            <span className="text-purple-400">{selectedUser.pontos_sorteio || 0} pts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex space-x-4 mt-8">
                            <button
                                onClick={handleCancelUserEdit}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveUserEdit}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Criação de Afiliado */}
            {showCreateAffiliateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border-2 border-red-500/30">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold text-xl">Criar Novo Afiliado</h3>
                            <button
                                onClick={handleCancelCreateAffiliate}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    value={newAffiliateData.name}
                                    onChange={(e) => handleAffiliateInputChange('name', e.target.value)}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Nome do afiliado"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={newAffiliateData.email}
                                    onChange={(e) => handleAffiliateInputChange('email', e.target.value)}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="email@exemplo.com"
                                    required
                                />
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Senha *
                                </label>
                                <input
                                    type="password"
                                    value={newAffiliateData.password}
                                    onChange={(e) => handleAffiliateInputChange('password', e.target.value)}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Senha de acesso"
                                    required
                                />
                            </div>

                            {/* Comissão */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Comissão (% sobre depósitos)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={newAffiliateData.commission}
                                    onChange={(e) => handleAffiliateInputChange('commission', e.target.value)}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Ex: 5.5"
                                />
                                <p className="text-gray-400 text-xs mt-1">Porcentagem sobre cada depósito dos clientes indicados</p>
                            </div>

                            {/* CPA */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    CPA (R$ por primeiro depósito)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newAffiliateData.cpa}
                                    onChange={(e) => handleAffiliateInputChange('cpa', e.target.value)}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Ex: 50.00"
                                />
                                <p className="text-gray-400 text-xs mt-1">Valor fixo pago quando cliente faz primeiro depósito</p>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex space-x-4 mt-8">
                            <button
                                onClick={handleCancelCreateAffiliate}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveAffiliate}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Criar Afiliado
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Criação de Afiliado */}
            {showAffiliateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Criar Novo Afiliado</h2>
                            <button
                                onClick={() => setShowAffiliateModal(false)}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    value={newAffiliate.name}
                                    onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Nome do afiliado"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={newAffiliate.email}
                                    onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="email@exemplo.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Senha *
                                </label>
                                <input
                                    type="password"
                                    value={newAffiliate.password}
                                    onChange={(e) => setNewAffiliate({ ...newAffiliate, password: e.target.value })}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Senha de acesso"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Comissão (% sobre depósitos)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={newAffiliate.commission}
                                    onChange={(e) => setNewAffiliate({ ...newAffiliate, commission: parseFloat(e.target.value) })}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Ex: 5.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    CPA (R$ por primeiro depósito)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newAffiliate.cpa}
                                    onChange={(e) => setNewAffiliate({ ...newAffiliate, cpa: parseFloat(e.target.value) })}
                                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Ex: 50.00"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4 mt-6">
                            <button
                                onClick={() => setShowAffiliateModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveNewAffiliate}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Criar Afiliado
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdmin;