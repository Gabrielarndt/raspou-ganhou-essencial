const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async adminLogin(email, password) {
    const data = await this.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async affiliateLogin(email, password) {
    const data = await this.request('/auth/affiliate-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.success && data.token) {
      this.setToken(data.token);
      // Store affiliate user data for AuthContext
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    
    return data;
  }

  // User endpoints
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(userData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getBalanceMovements() {
    return this.request('/user/balance-movements');
  }

  // Game endpoints
  async getGames() {
    return this.request('/games');
  }

  async playGame(gameId) {
    return this.request('/games/play', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId }),
    });
  }

  async getGameHistory() {
    return this.request('/games/history');
  }

  // Transaction endpoints
  async deposit(amount, method, details = {}) {
    return this.request('/transactions/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, method, details }),
    });
  }

  async withdraw(amount, method, details = {}) {
    return this.request('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, method, details }),
    });
  }

  async getTransactionHistory() {
    return this.request('/transactions/history');
  }

  // PIX endpoints
  async createPixDeposit(amount) {
    return this.request('/pix/create-deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async checkPixStatus(transactionId) {
    return this.request(`/pix/status/${transactionId}`);
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminUsers() {
    return this.request('/admin/users');
  }

  async getAdminTransactions() {
    return this.request('/admin/transactions');
  }

  async approveWithdraw(transactionId) {
    return this.request('/admin/approve-withdraw', {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId }),
    });
  }

  async rejectWithdraw(transactionId) {
    return this.request('/admin/reject-withdraw', {
      method: 'POST',
      body: JSON.stringify({ admin_id: adminId })
    });
  }

  // Affiliate management endpoints
  async getAffiliates() {
    return this.request('/admin/affiliates');
  }

  async createAffiliate(affiliateData) {
    return this.request('/admin/create-affiliate', {
      method: 'POST',
      body: JSON.stringify(affiliateData),
    });
  }

  async updateAffiliate(affiliateId, affiliateData) {
    return this.request('/admin/update-affiliate', {
      method: 'PUT',
      body: JSON.stringify({ affiliate_id: affiliateId, ...affiliateData }),
    });
  }

  async deleteAffiliate(affiliateId) {
    return this.request('/admin/delete-affiliate', {
      method: 'DELETE',
      body: JSON.stringify({ affiliate_id: affiliateId }),
    });
  }

  logout() {
    this.setToken(null);
  }
}

export const apiClient = new ApiClient();