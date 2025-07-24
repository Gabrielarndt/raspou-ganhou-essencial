import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

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

  useEffect(() => {
    console.log('🚀 AuthContext: Initializing...');
    loadUserFromToken();
  }, []);

  const loadUserFromToken = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await apiClient.getProfile();
      setUser(userData.user);
    } catch (error) {
      console.warn('Error loading user profile:', error);
      apiClient.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    console.log('🔐 AuthContext: Attempting login for email:', email);

    try {
      const result = await apiClient.login(email, senha);
      setUser(result.user);
      return { success: true };
    } catch (error) {
      console.log('❌ AuthContext: Login failed for email:', email);
      return { success: false, message: error.message || 'Email ou senha incorretos' };
    }
  };

  const register = async (userData) => {
    console.log('📝 AuthContext: Attempting registration for user:', userData.email);

    try {
      await apiClient.register(userData);
      return { success: true };
    } catch (error) {
      console.log('❌ AuthContext: Registration failed:', error.message);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out user:', user?.email);
    apiClient.logout();
    setUser(null);
  };

  const updateUser = async (updatedData) => {
    console.log('🔄 AuthContext: Attempting to update user:', user?.email);

    try {
      await apiClient.updateProfile(updatedData);
      const userData = await apiClient.getProfile();
      setUser(userData.user);
      return { success: true };
    } catch (error) {
      console.log('❌ AuthContext: Failed to update user:', error.message);
      return { success: false, message: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getProfile();
      setUser(userData.user);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const getTotalBalance = () => {
    const total = (user?.saldo_real || 0) + (user?.saldo_bonus || 0);
    return total;
  };

  const getGameHistory = async () => {
    try {
      const data = await apiClient.getGameHistory();
      return data.history || [];
    } catch (error) {
      console.error('Error loading game history:', error);
      return [];
    }
  };

  const getTransactionHistory = async () => {
    try {
      const data = await apiClient.getTransactionHistory();
      return data.transactions || [];
    } catch (error) {
      console.error('Error loading transaction history:', error);
      return [];
    }
  };

  // Verificar se o usuário está logado
  const isAuthenticated = !!user && !loading;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    getTotalBalance,
    getGameHistory,
    getTransactionHistory,
    isAuthenticated
  };

  console.log('🎯 AuthContext: Providing context value - User:', !!user, 'Loading:', loading);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

