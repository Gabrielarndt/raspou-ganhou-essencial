import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Função para forçar re-renderização
  const triggerUpdate = () => {
    setForceUpdate(prev => prev + 1);
  };

  useEffect(() => {
    console.log('🚀 AuthContext: Initializing...');
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('raspou_user');
        console.log('📦 AuthContext: Loading user from localStorage:', !!savedUser);
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log('✅ AuthContext: User loaded successfully:', parsedUser.email);
          setUser(parsedUser);
        } else {
          console.log('❌ AuthContext: No user found in localStorage');
          setUser(null);
        }
      } catch (error) {
        console.error('💥 AuthContext: Failed to parse user from localStorage', error);
        localStorage.removeItem('raspou_user');
        setUser(null);
      } finally {
        console.log('🏁 AuthContext: Loading complete, setting loading to false');
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Verificar mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 AuthContext: Storage changed, reloading user');
      const savedUser = localStorage.getItem('raspou_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          triggerUpdate();
        } catch (error) {
          console.error('Error parsing user from storage:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (email, senha) => {
    console.log('🔐 AuthContext: Attempting login for email:', email);
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    const foundUser = users.find(u => 
      u.email === email && (u.senha === senha || u.password === senha)
    );
    
    if (foundUser) {
      console.log('✅ AuthContext: User found, logging in:', foundUser.email);
      setUser(foundUser);
      localStorage.setItem('raspou_user', JSON.stringify(foundUser));
      console.log('💾 AuthContext: User saved to localStorage');
      
      // Forçar re-renderização de todos os componentes
      triggerUpdate();
      
      // Disparar evento customizado para notificar mudança
      window.dispatchEvent(new CustomEvent('userLogin', { detail: foundUser }));
      
      return { success: true };
    }
    
    console.log('❌ AuthContext: Login failed for email:', email);
    return { success: false, message: 'Email ou senha incorretos' };
  };

  const register = (userData) => {
    console.log('📝 AuthContext: Attempting registration for user:', userData.email);
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    
    if (users.find(u => u.email === userData.email)) {
      console.log('❌ AuthContext: Registration failed, email already exists:', userData.email);
      return { success: false, message: 'Email já cadastrado' };
    }
    
    if (users.find(u => u.cpf === userData.cpf)) {
      console.log('❌ AuthContext: Registration failed, CPF already exists:', userData.cpf);
      return { success: false, message: 'CPF já cadastrado' };
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      senha: userData.senha,
      saldo_real: 0,
      saldo_bonus: 10, 
      pontos_sorteio: 0, 
      jogos_realizados: 0,
      total_ganho: 0,
      nivel_vip: 'Bronze',
      data_cadastro: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('raspou_users', JSON.stringify(users));
    console.log('✅ AuthContext: User registered and saved:', newUser.email);
    
    return { success: true };
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out user:', user?.email);
    setUser(null);
    localStorage.removeItem('raspou_user');
    console.log('🧹 AuthContext: User removed from localStorage');
    
    // Forçar re-renderização
    triggerUpdate();
    
    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('userLogout'));
  };

  const updateUser = (updatedData) => {
    console.log('🔄 AuthContext: Attempting to update user:', user?.email);
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      const updatedUser = { ...user, ...updatedData };
      users[userIndex] = updatedUser;
      
      localStorage.setItem('raspou_users', JSON.stringify(users));
      setUser(updatedUser);
      localStorage.setItem('raspou_user', JSON.stringify(updatedUser));
      console.log('✅ AuthContext: User updated and saved:', updatedUser.email);
      
      // Forçar re-renderização
      triggerUpdate();
      
      return { success: true };
    }
    
    console.log('❌ AuthContext: Failed to update user:', user?.email);
    return { success: false, message: 'Erro ao atualizar usuário' };
  };

  const updateBalance = (newBalance) => {
    console.log('💰 AuthContext: Updating balance for user:', user?.email);
    console.log('💰 AuthContext: Current balance - Real:', user?.saldo_real, 'Bonus:', user?.saldo_bonus);
    console.log('💰 AuthContext: New balance - Real:', newBalance.saldo_real, 'Bonus:', newBalance.saldo_bonus);
    
    if (!user) {
      console.error('❌ AuthContext: No user found for balance update');
      return false;
    }
    
    try {
      const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      console.log('💰 AuthContext: User index found:', userIndex);
      
      if (userIndex !== -1) {
        const updatedUser = { 
          ...user, 
          saldo_real: Number(newBalance.saldo_real) || 0,
          saldo_bonus: Number(newBalance.saldo_bonus) || 0,
          pontos_sorteio: Number(newBalance.pontos_sorteio) || user.pontos_sorteio || 0
        };
        
        console.log('💰 AuthContext: Updated user object:', updatedUser);
        
        users[userIndex] = updatedUser;
        
        // Salvar no localStorage
        localStorage.setItem('raspou_users', JSON.stringify(users));
        localStorage.setItem('raspou_user', JSON.stringify(updatedUser));
        
        // Atualizar estado
        setUser(updatedUser);
        
        console.log('✅ AuthContext: Balance updated successfully');
        console.log('✅ AuthContext: Final balance - Real:', updatedUser.saldo_real, 'Bonus:', updatedUser.saldo_bonus);
        
        // Forçar re-renderização
        triggerUpdate();
        
        return true;
      } else {
        console.error('❌ AuthContext: User not found in users array for balance update');
        return false;
      }
    } catch (error) {
      console.error('💥 AuthContext: Error updating balance:', error);
      return false;
    }
  };
    

  const addGameResult = (gameResult) => {
    console.log('🎮 AuthContext: Adding game result for user:', user?.email);
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      const updatedUser = { 
        ...user, 
        jogos_realizados: (user.jogos_realizados || 0) + 1,
        total_ganho: (user.total_ganho || 0) + (gameResult.premio || 0),
        pontos_sorteio: (user.pontos_sorteio || 0) + 10 
      };
      
      users[userIndex] = updatedUser;
      
      localStorage.setItem('raspou_users', JSON.stringify(users));
      setUser(updatedUser);
      localStorage.setItem('raspou_user', JSON.stringify(updatedUser));
      console.log('✅ AuthContext: Game result added');

      const gameHistory = JSON.parse(localStorage.getItem('raspou_game_history') || '[]');
      const newGameRecord = {
        id: Date.now(),
        user_id: user.id,
        game_name: gameResult.game_name,
        cost: gameResult.cost,
        prize: gameResult.premio || 0,
        won: gameResult.ganhou,
        date: new Date().toISOString()
      };
      
      gameHistory.push(newGameRecord);
      localStorage.setItem('raspou_game_history', JSON.stringify(gameHistory));
      
      // Forçar re-renderização
      triggerUpdate();
    }
  };

  const getTotalBalance = () => {
    const total = (user?.saldo_real || 0) + (user?.saldo_bonus || 0);
    return total;
  };

  const getGameHistory = () => {
    const gameHistory = JSON.parse(localStorage.getItem('raspou_game_history') || '[]');
    const userHistory = gameHistory.filter(game => game.user_id === user?.id);
    return userHistory;
  };

  const getTransactionHistory = () => {
    const transactions = JSON.parse(localStorage.getItem('raspou_transactions') || '[]');
    const userTransactions = transactions.filter(transaction => transaction.user_id === user?.id);
    return userTransactions;
  };

  // Verificar se o usuário está logado
  const isAuthenticated = () => {
    return !!user && !loading;
  };

  const value = {
    user,
    loading,
    forceUpdate, // Para componentes que precisam forçar re-renderização
    login,
    register,
    logout,
    updateUser,
    updateBalance,
    addGameResult,
    getTotalBalance,
    getGameHistory,
    getTransactionHistory,
    isAuthenticated,
    triggerUpdate
  };

  console.log('🎯 AuthContext: Providing context value - User:', !!user, 'Loading:', loading, 'ForceUpdate:', forceUpdate);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

