import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Calendar, Users, Coins, Star } from 'lucide-react';

const Numeros = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sorteios');
  const [lotteries, setLotteries] = useState([]);
  const [lotteryHistory, setLotteryHistory] = useState([]);

  useEffect(() => {
    loadActiveLotteries();
  }, []);

  const loadActiveLotteries = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/lotteries/active`);
      
      if (response.ok) {
        const data = await response.json();
        setLotteries(data.active_lotteries || []);
        setLotteryHistory(data.finished_lotteries || []);
      } else {
        console.error('Erro ao carregar sorteios');
        setLotteries([]);
        setLotteryHistory([]);
      }
    } catch (error) {
      console.error('Erro ao carregar sorteios:', error);
      setLotteries([]);
      setLotteryHistory([]);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeRemaining = (drawDate) => {
    const now = new Date();
    const draw = new Date(drawDate);
    const diff = draw - now;
    
    if (diff <= 0) return 'Finalizado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTotalParticipants = () => {
    // Simular participantes baseado nos pontos dos usuários
    const users = JSON.parse(localStorage.getItem('raspou_users') || '[]');
    return users.reduce((total, user) => total + (user.pontos_sorteio || 0), 0);
  };
  // Dados simulados dos ganhadores
  const ganhadores = [
    { id: 1, nome: 'João S.', premio: 1500.00, data: new Date('2024-01-18'), tipo: 'Sorteio Diário' },
    { id: 2, nome: 'Maria L.', premio: 500.00, data: new Date('2024-01-18'), tipo: 'Raspadinha Premium' },
    { id: 3, nome: 'Pedro M.', premio: 2000.00, data: new Date('2024-01-17'), tipo: 'Sorteio Diário' },
    { id: 4, nome: 'Ana C.', premio: 750.00, data: new Date('2024-01-17'), tipo: 'Jackpot Premium' },
    { id: 5, nome: 'Carlos R.', premio: 300.00, data: new Date('2024-01-17'), tipo: 'Tesouro Escondido' },
    { id: 6, nome: 'Lucia F.', premio: 1200.00, data: new Date('2024-01-16'), tipo: 'Sorteio Diário' },
    { id: 7, nome: 'Roberto S.', premio: 450.00, data: new Date('2024-01-16'), tipo: 'Diamante Negro' },
    { id: 8, nome: 'Fernanda O.', premio: 800.00, data: new Date('2024-01-16'), tipo: 'Fortuna Real' },
    { id: 9, nome: 'Miguel A.', premio: 1800.00, data: new Date('2024-01-15'), tipo: 'Sorteio Diário' },
    { id: 10, nome: 'Carla B.', premio: 600.00, data: new Date('2024-01-15'), tipo: 'Sorte Dourada' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Números & Sorteios
          </h1>
          <p className="text-gray-400">
            Acompanhe seus números e os últimos ganhadores
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('sorteios')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'sorteios'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sorteios
          </button>
          <button
            onClick={() => setActiveTab('ganhadores')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'ganhadores'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ganhadores
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'sorteios' && (
          <div className="space-y-6">
            {/* Saldo de Sorteio do Usuário */}
            {user && (
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Coins className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Meu Saldo de Sorteio</h3>
                      <p className="text-gray-400 text-sm">Acumulado das suas raspadinhas</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400 mb-2">
                    {user.pontos_sorteio || 0} pontos
                  </p>
                  <p className="text-gray-400 text-sm">
                    A cada raspadinha você ganha pontos para o sorteio diário!
                  </p>
                </div>
              </div>
            )}

            {/* Próximos Sorteios */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Próximos Sorteios</h3>
                  <p className="text-gray-400 text-sm">Sorteios programados</p>
                </div>
              </div>
              
              {lotteries.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum sorteio programado</p>
                  <p className="text-gray-500 text-sm">Novos sorteios aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lotteries.map((lottery) => (
                    <div key={lottery.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold">{lottery.title}</h4>
                        <span className="text-yellow-400 font-bold text-lg">
                          {formatCurrency(lottery.prize)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-white">{getTotalParticipants()}</p>
                          <p className="text-gray-400 text-xs">Participantes</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">{formatTimeRemaining(lottery.draw_date)}</p>
                          <p className="text-gray-400 text-xs">Tempo restante</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-gray-400 text-sm">
                          Sorteio: {formatDate(new Date(lottery.draw_date))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Como Participar */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-400">Como Participar</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <p>Jogue qualquer raspadinha para ganhar pontos de sorteio</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <p>Seus pontos são automaticamente convertidos em números</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <p>O sorteio acontece todos os dias às 20:00</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ganhadores' && (
          <div className="space-y-4">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">R$ 12.450</p>
                <p className="text-gray-400 text-sm">Pagos Hoje</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">23</p>
                <p className="text-gray-400 text-sm">Ganhadores</p>
              </div>
            </div>

            {/* Histórico de Sorteios */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Histórico de Sorteios</h3>
              
              {lotteryHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum sorteio finalizado</p>
                  <p className="text-gray-500 text-sm">Sorteios concluídos aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lotteryHistory.map((lottery) => (
                    <div key={lottery.id} className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{lottery.title}</p>
                            <p className="text-gray-400 text-sm">Sorteio finalizado</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">
                            {formatCurrency(lottery.prize)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {formatDate(new Date(lottery.draw_date))}
                          </p>
                        </div>
                      </div>
                      {lottery.winner && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-green-400 text-sm">
                            Ganhador: {lottery.winner}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Lista de Ganhadores Recentes */}
              <h3 className="text-lg font-bold text-white mt-8">Ganhadores Recentes</h3>
              <div className="space-y-3">
                {ganhadores.map((ganhador) => (
                  <div key={ganhador.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{ganhador.nome}</p>
                          <p className="text-gray-400 text-sm">{ganhador.tipo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">
                          {formatCurrency(ganhador.premio)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatDate(ganhador.data)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Numeros;

