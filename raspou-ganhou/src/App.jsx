import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Raspadinhas from './pages/Raspadinhas';
import Numeros from './pages/Numeros';
import GamePage from './pages/GamePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Admin from './pages/Admin';
import SuperAdmin from './pages/SuperAdmin';
import SuperAdminLogin from './pages/SuperAdminLogin';
import HistoricoFinanceiro from './pages/HistoricoFinanceiro';
import HistoricoJogos from './pages/HistoricoJogos';
import './App.css';

function App() {
  useEffect(() => {
    // Inicializar sistema administrativo
    try {
      console.log('🔧 Inicializando sistema administrativo...');
      
      // Limpar admins da lista de usuários se existirem
      const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
      const filteredUsers = users.filter(u => 
        u.email !== 'admin@raspouganhou.com' && 
        u.email !== 'superadmin@raspouganhou.com' &&
        !u.is_admin &&
        !u.is_super_admin
      );
      
      if (users.length !== filteredUsers.length) {
        localStorage.setItem('raspou_users', JSON.stringify(filteredUsers));
        console.log('🧹 Admins removidos da lista de usuários');
      }

      // Criar sistema de super administradores
      const superAdmins = JSON.parse(localStorage.getItem('raspou_super_admins') || '[]');
      if (!superAdmins.find(sa => sa.email === 'superadmin@raspouganhou.com')) {
        const superAdminUser = {
          id: 1,
          name: 'Super Administrador',
          email: 'superadmin@raspouganhou.com',
          password: 'super123',
          permissions: ['all'],
          created_at: new Date().toISOString(),
          is_super_admin: true,
          role: 'super_admin'
        };
        
        superAdmins.push(superAdminUser);
        localStorage.setItem('raspou_super_admins', JSON.stringify(superAdmins));
        console.log('✅ Super Admin criado no sistema administrativo');
      }

      // Criar sistema de administradores
      const admins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
      if (!admins.find(a => a.email === 'admin@raspouganhou.com')) {
        const adminUser = {
          id: 1,
          name: 'Administrador',
          email: 'admin@raspouganhou.com',
          password: 'admin123',
          permissions: ['dashboard', 'users', 'transactions', 'games', 'settings'],
          created_at: new Date().toISOString(),
          is_admin: true,
          role: 'admin'
        };
        
        admins.push(adminUser);
        localStorage.setItem('raspou_admins', JSON.stringify(admins));
        console.log('✅ Admin criado no sistema administrativo');
      }

      // Inicializar dados de exemplo para afiliados
      const affiliates = JSON.parse(localStorage.getItem('raspou_affiliates') || '[]');
      if (affiliates.length === 0) {
        const exampleAffiliates = [
          {
            id: 1,
            name: 'João Afiliado',
            email: 'joao@afiliado.com',
            password: 'afiliado123',
            commission: 10,
            cpa: 50,
            total_clients: 15,
            total_deposits: 5000,
            total_commission: 500,
            created_at: new Date().toISOString(),
            is_affiliate: true
          },
          {
            id: 2,
            name: 'Maria Parceira',
            email: 'maria@parceira.com',
            password: 'parceira123',
            commission: 15,
            cpa: 75,
            total_clients: 8,
            total_deposits: 3200,
            total_commission: 480,
            created_at: new Date().toISOString(),
            is_affiliate: true
          }
        ];
        
        localStorage.setItem('raspou_affiliates', JSON.stringify(exampleAffiliates));
        console.log('✅ Afiliados de exemplo criados');
      }

      console.log('🎉 Sistema administrativo inicializado com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao inicializar sistema administrativo:', error);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* SISTEMA ADMINISTRATIVO - COMPLETAMENTE SEPARADO */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="/super-admin-login" element={<SuperAdminLogin />} />
          
          {/* SITE DA RASPADINHA - COM LAYOUT COMPLETO */}
          <Route path="/*" element={
            <div className="min-h-screen bg-black flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/raspadinhas" element={<Raspadinhas />} />
                  <Route path="/numeros" element={<Numeros />} />
                  <Route path="/jogo/:id" element={<GamePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Register />} />
                  <Route path="/minha-conta" element={<Profile />} />
                  <Route path="/deposito" element={<Deposit />} />
                  <Route path="/saque" element={<Withdraw />} />
                  <Route path="/historico-financeiro" element={<HistoricoFinanceiro />} />
                  <Route path="/historico-jogos" element={<HistoricoJogos />} />
                </Routes>
              </main>
              <Footer />
              <BottomNav />
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;