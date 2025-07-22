import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, Trophy, Users, Star, TrendingUp, Gift, Zap, Crown } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ganhadores');

  const ganhadores = [
    { nome: 'João S.', premio: 'R$ 5.000', jogo: 'Jackpot Premium', tempo: '2 min atrás' },
    { nome: 'Maria L.', premio: 'R$ 1.250', jogo: 'Diamante Negro', tempo: '5 min atrás' },
    { nome: 'Carlos M.', premio: 'R$ 800', jogo: 'Tesouro Escondido', tempo: '8 min atrás' },
    { nome: 'Ana P.', premio: 'R$ 500', jogo: 'Fortuna Real', tempo: '12 min atrás' },
    { nome: 'Pedro R.', premio: 'R$ 250', jogo: 'Sorte Dourada', tempo: '15 min atrás' },
  ];

  const estatisticas = [
    { icon: Trophy, label: 'Prêmios Pagos', valor: 'R$ 50K+', cor: 'text-yellow-400' },
    { icon: Users, label: 'Jogadores', valor: '10K+', cor: 'text-blue-400' },
    { icon: Star, label: 'Avaliação', valor: '4.9', cor: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20 lg:pb-8">
      {/* Container responsivo */}
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Hero Section */}
        <section className="text-center py-8 lg:py-16">
          {/* Banner Principal */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl lg:rounded-2xl p-6 lg:p-8 mb-8 lg:mb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Crown className="w-8 h-8 lg:w-12 lg:h-12 text-black" />
                <span className="text-black font-bold text-lg lg:text-2xl">Prêmio de R$ 10.000</span>
              </div>
              <h2 className="text-black font-bold text-xl lg:text-3xl mb-2">Raspadinha Premium</h2>
              <p className="text-black/80 text-sm lg:text-lg mb-4">Ganhe até R$ 10.000 em prêmios instantâneos</p>
              <div className="flex justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 lg:mb-6">
            Bem-vindo ao <span className="text-yellow-400">RaspouGanhou</span>
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl mb-8 lg:mb-12 max-w-3xl mx-auto">
            O melhor site de raspadinhas online do Brasil. 
            Raspe, ganhe prêmios instantâneos e concorra a sorteios diários!
          </p>

          {/* CTA Principal */}
          <button
            onClick={() => navigate('/raspadinhas')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-8 lg:px-12 rounded-xl lg:rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto text-lg lg:text-xl"
          >
            <Play className="w-6 h-6 lg:w-8 lg:h-8" />
            <span>Jogar Agora</span>
          </button>
        </section>

        {/* Estatísticas */}
        <section className="mb-12 lg:mb-16">
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-8 max-w-4xl mx-auto">
            {estatisticas.map((stat, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-4 lg:p-6 text-center">
                <stat.icon className={`w-8 h-8 lg:w-12 lg:h-12 ${stat.cor} mx-auto mb-2 lg:mb-4`} />
                <p className="text-2xl lg:text-4xl font-bold text-white mb-1 lg:mb-2">{stat.valor}</p>
                <p className="text-gray-400 text-sm lg:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Seção Principal - Layout Responsivo */}
        <section className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
          
          {/* Sobre o RaspouGanhou */}
          <div className="bg-gray-800 rounded-xl p-6 lg:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-yellow-400 font-bold text-xl lg:text-2xl">Sobre o RaspouGanhou</h3>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                O RaspouGanhou é a plataforma de raspadinhas online mais confiável do Brasil, 
                oferecendo uma experiência única de jogos com prêmios reais e instantâneos.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm lg:text-base">Prêmios instantâneos de até R$ 10.000</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm lg:text-base">Sorteios diários com prêmios especiais</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm lg:text-base">Plataforma 100% segura e licenciada</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm lg:text-base">Suporte 24/7 para todos os jogadores</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ganhadores Recentes */}
          <div className="bg-gray-800 rounded-xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-green-400 font-bold text-xl lg:text-2xl">Ganhadores Recentes</h3>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs lg:text-sm">AO VIVO</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {ganhadores.map((ganhador, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">{ganhador.nome.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm lg:text-base">{ganhador.nome}</p>
                      <p className="text-gray-400 text-xs lg:text-sm">{ganhador.jogo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm lg:text-base">{ganhador.premio}</p>
                    <p className="text-gray-400 text-xs">{ganhador.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Promoções e Ofertas - Desktop Full Width */}
        <section className="mb-12 lg:mb-16">
          <h3 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12">
            <span className="text-yellow-400">Promoções</span> Especiais
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Bônus de Boas-vindas */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 lg:p-8 text-center">
              <Gift className="w-12 h-12 lg:w-16 lg:h-16 text-white mx-auto mb-4" />
              <h4 className="text-white font-bold text-lg lg:text-xl mb-2">Bônus de Boas-vindas</h4>
              <p className="text-white/90 text-sm lg:text-base mb-4">
                Ganhe R$ 10 grátis no seu primeiro depósito!
              </p>
              <button className="bg-white text-purple-600 font-bold py-2 px-4 lg:px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Resgatar Agora
              </button>
            </div>

            {/* Sorteio Diário */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 lg:p-8 text-center">
              <TrendingUp className="w-12 h-12 lg:w-16 lg:h-16 text-white mx-auto mb-4" />
              <h4 className="text-white font-bold text-lg lg:text-xl mb-2">Sorteio Diário</h4>
              <p className="text-white/90 text-sm lg:text-base mb-4">
                Concorra a R$ 5.000 todos os dias às 20h!
              </p>
              <button className="bg-white text-blue-600 font-bold py-2 px-4 lg:px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Participar
              </button>
            </div>

            {/* Cashback */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 lg:p-8 text-center md:col-span-2 lg:col-span-1">
              <Star className="w-12 h-12 lg:w-16 lg:h-16 text-white mx-auto mb-4" />
              <h4 className="text-white font-bold text-lg lg:text-xl mb-2">Cashback VIP</h4>
              <p className="text-white/90 text-sm lg:text-base mb-4">
                Receba 5% de volta em todas as suas jogadas!
              </p>
              <button className="bg-white text-green-600 font-bold py-2 px-4 lg:px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Saiba Mais
              </button>
            </div>
          </div>
        </section>

        {/* Call to Action Final */}
        <section className="text-center py-8 lg:py-12 bg-gray-800 rounded-xl lg:rounded-2xl">
          <h3 className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6">
            Pronto para <span className="text-yellow-400">Ganhar</span>?
          </h3>
          <p className="text-gray-300 text-lg lg:text-xl mb-6 lg:mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de jogadores que já ganharam prêmios incríveis no RaspouGanhou!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/raspadinhas')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-8 lg:px-12 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Começar a Jogar
            </button>
            <button
              onClick={() => navigate('/numeros')}
              className="bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold py-3 px-8 lg:px-12 rounded-xl transition-all duration-200"
            >
              Ver Sorteios
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

