@@ .. @@
 import React, { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext';
 import { Play, Trophy, Users, Star, TrendingUp, Gift, Zap, Crown } from 'lucide-react';

 const Home = () => {
   const navigate = useNavigate();
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState('ganhadores');

+  console.log('🏠 Home: Component rendered');
+
   const ganhadores = [