@@ .. @@
 import React, { useEffect } from 'react';
 import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
 import { AuthProvider } from './contexts/AuthContext';
-import Header from './components/layout/Header';
-import BottomNav from './components/layout/BottomNav';
-import Footer from './components/layout/Footer';
 import Home from './pages/Home';
 import Raspadinhas from './pages/Raspadinhas';
 import Numeros from './pages/Numeros';
@@ .. @@
 import SuperAdminLogin from './pages/SuperAdminLogin';
 import HistoricoFinanceiro from './pages/HistoricoFinanceiro';
 import HistoricoJogos from './pages/HistoricoJogos';
+import Header from './components/layout/Header';
+import BottomNav from './components/layout/BottomNav';
+import Footer from './components/layout/Footer';
 import initAdmin from './utils/initAdmin';
 import initSuperAdmin from './utils/initSuperAdmin';
 import './App.css';

@@ .. @@
   return (
     <AuthProvider>
       <Router>
-        <div className="min-h-screen bg-black flex flex-col">
-          <Header />
-          <main className="flex-1">
-            <Routes>
-              <Route path="/" element={<Home />} />
-              <Route path="/raspadinhas" element={<Raspadinhas />} />
-              <Route path="/numeros" element={<Numeros />} />
-              <Route path="/jogo/:id" element={<GamePage />} />
-              <Route path="/login" element={<Login />} />
-              <Route path="/registro" element={<Register />} />
-              <Route path="/minha-conta" element={<Profile />} />
-              <Route path="/deposito" element={<Deposit />} />
-              <Route path="/saque" element={<Withdraw />} />
-              <Route path="/admin" element={<Admin />} />
-              <Route path="/super-admin" element={<SuperAdmin />} />
-              <Route path="/super-admin-login" element={<SuperAdminLogin />} />
-              <Route path="/historico-financeiro" element={<HistoricoFinanceiro />} />
-              <Route path="/historico-jogos" element={<HistoricoJogos />} />
-            </Routes>
-          </main>
-          <Footer />
-          <BottomNav />
-        </div>
+        <Routes>
+          {/* Rotas administrativas - SEM layout do site */}
+          <Route path="/admin" element={<Admin />} />
+          <Route path="/super-admin" element={<SuperAdmin />} />
+          <Route path="/super-admin-login" element={<SuperAdminLogin />} />
+          
+          {/* Rotas do site principal - COM layout */}
+          <Route path="/*" element={
+            <div className="min-h-screen bg-black flex flex-col">
+              <Header />
+              <main className="flex-1">
+                <Routes>
+                  <Route path="/" element={<Home />} />
+                  <Route path="/raspadinhas" element={<Raspadinhas />} />
+                  <Route path="/numeros" element={<Numeros />} />
+                  <Route path="/jogo/:id" element={<GamePage />} />
+                  <Route path="/login" element={<Login />} />
+                  <Route path="/registro" element={<Register />} />
+                  <Route path="/minha-conta" element={<Profile />} />
+                  <Route path="/deposito" element={<Deposit />} />
+                  <Route path="/saque" element={<Withdraw />} />
+                  <Route path="/historico-financeiro" element={<HistoricoFinanceiro />} />
+                  <Route path="/historico-jogos" element={<HistoricoJogos />} />
+                </Routes>
+              </main>
+              <Footer />
+              <BottomNav />
+            </div>
+          } />
+        </Routes>
       </Router>
     </AuthProvider>
   );