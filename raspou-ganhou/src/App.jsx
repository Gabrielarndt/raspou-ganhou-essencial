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
import HistoricoFinanceiro from './pages/HistoricoFinanceiro';
import HistoricoJogos from './pages/HistoricoJogos';
import initAdmin from './utils/initAdmin';
import './App.css';

function App() {
  useEffect(() => {
    initAdmin();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/raspadinhas" element={<Raspadinhas />} />
              <Route path="/numeros" element={<Numeros />} />
              <Route path="/jogo/:id" element={<GamePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/minha-conta" element={<Profile />} />
              <Route path="/deposito" element={<Deposit />} />
              <Route path="/saque" element={<Withdraw />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/historico-financeiro" element={<HistoricoFinanceiro />} />
              <Route path="/historico-jogos" element={<HistoricoJogos />} />
            </Routes>
          </main>
          <Footer />
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


