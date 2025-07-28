import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Play, 
  Trophy, 
  Users, 
  Star, 
  TrendingUp, 
  Gift, 
  Zap, 
  Crown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Target,
  Shield,
  User
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Banners do carousel
  const banners = [
    {
      id: 1,
      title: "Raspadinha Premium",
      subtitle: "Ganhe até R$ 10.000",
      description: "Prêmios instantâneos todos os dias",
      image: "https://images.pexels.com/photos/3279691/pexels-photo-3279691.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      cta: "Jogar Agora",
      action: () => navigate('/raspadinhas')
    },
    {
      id: 2,
      title: "Sorteio Diário",
      subtitle: "R$ 5.000 todos os dias",
      description: "Participe automaticamente jogando",
      image: "https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      cta: "Ver Sorteios",
      action: () => navigate('/numeros')
    },
    {
      id: 3,
      title: "Bônus de Boas-vindas",
      subtitle: "R$ 10 Grátis",
      description: "Para novos jogadores",
      image: "https://images.pexels.com/photos/3279667/pexels-photo-3279667.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      cta: "Registrar",
      action: () => navigate('/registro')
    }
  ];

  // Auto-play do carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const ganhadores = [
    { nome: 'João S.', premio: 'R$ 5.000', jogo: 'Jackpot Premium', tempo: '2 min atrás', avatar: 'J' },
    { nome: 'Maria L.', premio: 'R$ 1.250', jogo: 'Diamante Negro', tempo: '5 min atrás', avatar: 'M' },
    { nome: 'Carlos M.', premio: 'R$ 800', jogo: 'Tesouro Escondido', tempo: '8 min atrás', avatar: 'C' },
    { nome: 'Ana P.', premio: 'R$ 500', jogo: 'Fortuna Real', tempo: '12 min atrás', avatar: 'A' },
    { nome: 'Pedro R.', premio: 'R$ 250', jogo: 'Sorte Dourada', tempo: '15 min atrás', avatar: 'P' },
  ];

  const features = [
    {
      icon: Trophy,
      title: "Prêmios Instantâneos",
      description: "Ganhe até R$ 10.000 na hora",
      color: "text-yellow-400"
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Plataforma licenciada e auditada",
      color: "text-green-400"
    },
    {
      icon: Zap,
      title: "Pagamento Rápido",
      description: "PIX instantâneo para saques",
      color: "text-blue-400"
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Mais de 10.000 jogadores",
      color: "text-purple-400"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20 lg:pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Carousel de Banners */}
        <section className="relative mb-12 lg:mb-16">
          <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
                
                <div className="absolute inset-0 flex items-center justify-center lg:justify-start lg:pl-12">
                  <div className="text-center lg:text-left max-w-lg">
                    <h2 className="text-white text-3xl lg:text-5xl font-bold mb-2 lg:mb-4">
                      {banner.title}
                    </h2>
                    <p className="text-white text-xl lg:text-2xl font-semibold mb-2 lg:mb-4">
                      {banner.subtitle}
                    </p>
                    <p className="text-white/90 text-sm lg:text-lg mb-6 lg:mb-8">
                      {banner.description}
                    </p>
                    <button
                      onClick={banner.action}
                      className="bg-white text-black font-bold py-3 px-8 lg:py-4 lg:px-12 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto lg:mx-0"
                    >
                      <span>{banner.cta}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Controles do Carousel */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 lg:p-3 rounded-full transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 lg:p-3 rounded-full transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
            
            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12 lg:mb-16">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-4xl font-bold mb-4">
              Por que escolher o <span className="text-yellow-400">RaspouGanhou</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A plataforma mais confiável e divertida para ganhar prêmios instantâneos
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-3 md:p-6 text-center hover:bg-gray-700 transition-all duration-200 transform hover:scale-105">
                <div className={`w-10 h-10 md:w-16 md:h-16 ${feature.color.replace('text-', 'bg-').replace('-400', '-500/20')} rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4`}>
                  <feature.icon className={`w-5 h-5 md:w-8 md:h-8 ${feature.color}`} />
                </div>
                <h3 className="text-white font-bold text-sm md:text-lg mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-tight">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ganhadores e Estatísticas */}
        <section className="grid lg:grid-cols-2 gap-6 lg:gap-12 mb-12 lg:mb-16">
          
          {/* Ganhadores Recentes */}
          <div className="bg-gray-800 rounded-xl p-4 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-green-400 font-bold text-lg md:text-xl">Ganhadores Recentes</h3>
                  <p className="text-gray-400 text-xs md:text-sm">Prêmios pagos em tempo real</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium hidden md:inline">AO VIVO</span>
              </div>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              {ganhadores.map((ganhador, index) => (
                <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-xs md:text-sm">{ganhador.avatar}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm md:text-base">{ganhador.nome}</p>
                      <p className="text-gray-400 text-xs md:text-sm">{ganhador.jogo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm md:text-base">{ganhador.premio}</p>
                    <p className="text-gray-400 text-xs hidden md:block">{ganhador.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-600">
              <button
                onClick={() => navigate('/numeros')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 md:py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Ver Todos os Ganhadores</span>
              </button>
            </div>
          </div>

          {/* Estatísticas e CTA */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 md:p-6">
              <h3 className="text-yellow-400 font-bold text-lg md:text-xl mb-4 md:mb-6 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                <span>Estatísticas em Tempo Real</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="text-center">
                  <p className="text-xl md:text-3xl font-bold text-white mb-1">R$ 50K+</p>
                  <p className="text-yellow-400 text-xs md:text-sm">Prêmios Pagos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-3xl font-bold text-white mb-1">10K+</p>
                  <p className="text-yellow-400 text-xs md:text-sm">Jogadores</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-3xl font-bold text-white mb-1">4.9</p>
                  <p className="text-yellow-400 text-xs md:text-sm">Avaliação</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-3xl font-bold text-white mb-1">24/7</p>
                  <p className="text-yellow-400 text-xs md:text-sm">Suporte</p>
                </div>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-black" />
              </div>
              <h3 className="text-white font-bold text-lg md:text-xl mb-2">Pronto para Ganhar?</h3>
              <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6">
                Milhares de jogadores já ganharam prêmios incríveis. Sua vez pode ser agora!
              </p>
              
              {user ? (
                <div className="space-y-2 md:space-y-3">
                  <button
                    onClick={() => navigate('/raspadinhas')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Jogar Raspadinhas
                  </button>
                  <p className="text-gray-400 text-xs md:text-sm">
                    Saldo: R$ {((user.saldo_real || 0) + (user.saldo_bonus || 0)).toFixed(2)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  <button
                    onClick={() => navigate('/registro')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Criar Conta Grátis
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold py-2 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-200"
                  >
                    Já Tenho Conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="mb-12 lg:mb-16">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-4xl font-bold mb-4">
              Como <span className="text-yellow-400">Funciona</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              É muito simples começar a ganhar prêmios no RaspouGanhou
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 mt-4">
                <User className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-base md:text-lg mb-2">Crie sua Conta</h3>
              <p className="text-gray-400 text-xs md:text-sm">
                Cadastro rápido e seguro em menos de 2 minutos
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 mt-4">
                <Gift className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-base md:text-lg mb-2">Escolha sua Raspadinha</h3>
              <p className="text-gray-400 text-xs md:text-sm">
                Diversos jogos com prêmios de até R$ 10.000
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 mt-4">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
              </div>
              <h3 className="text-white font-bold text-base md:text-lg mb-2">Raspe e Ganhe</h3>
              <p className="text-gray-400 text-xs md:text-sm">
                Descubra se você ganhou e receba na hora!
              </p>
            </div>
          </div>
        </section>

        {/* Promoções */}
        <section className="mb-12 lg:mb-16">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-4xl font-bold mb-4">
              <span className="text-yellow-400">Promoções</span> Especiais
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Aproveite nossas ofertas exclusivas e ganhe ainda mais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Bônus de Boas-vindas */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 md:p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <Gift className="w-10 h-10 md:w-12 md:h-12 text-white mx-auto mb-3 md:mb-4" />
                <h4 className="text-white font-bold text-base md:text-lg mb-2">Bônus de Boas-vindas</h4>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4">
                  Ganhe R$ 10 grátis no seu primeiro cadastro!
                </p>
                <button 
                  onClick={() => navigate('/registro')}
                  className="bg-white text-purple-600 font-bold py-2 px-4 md:px-6 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
                >
                  Resgatar Agora
                </button>
              </div>
            </div>

            {/* Cashback VIP */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 md:p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <Star className="w-10 h-10 md:w-12 md:h-12 text-white mx-auto mb-3 md:mb-4" />
                <h4 className="text-white font-bold text-base md:text-lg mb-2">Cashback VIP</h4>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4">
                  Receba 5% de volta em todas as suas jogadas!
                </p>
                <button 
                  onClick={() => navigate('/raspadinhas')}
                  className="bg-white text-blue-600 font-bold py-2 px-4 md:px-6 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
                >
                  Saiba Mais
                </button>
              </div>
            </div>

            {/* Sorteio Diário */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4 md:p-6 text-center relative overflow-hidden md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-white mx-auto mb-3 md:mb-4" />
                <h4 className="text-white font-bold text-base md:text-lg mb-2">Sorteio Diário</h4>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4">
                  Concorra a R$ 5.000 todos os dias às 20h!
                </p>
                <button 
                  onClick={() => navigate('/numeros')}
                  className="bg-white text-green-600 font-bold py-2 px-4 md:px-6 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
                >
                  Participar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Final */}
        <section className="text-center py-8 md:py-12 lg:py-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Crown className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mx-auto mb-4 md:mb-6" />
            <h3 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6">
              Sua <span className="text-yellow-400">Sorte</span> Está Esperando
            </h3>
            <p className="text-gray-300 text-sm md:text-lg lg:text-xl mb-6 md:mb-8">
              Junte-se a milhares de jogadores que já transformaram suas vidas com o RaspouGanhou. 
              Comece agora e descubra o que a sorte preparou para você!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/raspadinhas')}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 md:py-4 px-6 md:px-8 lg:px-12 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6" />
                <span>Começar a Jogar</span>
              </button>
              
              {!user && (
                <button
                  onClick={() => navigate('/registro')}
                  className="w-full sm:w-auto bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold py-3 md:py-4 px-6 md:px-8 lg:px-12 rounded-xl transition-all duration-200"
                >
                  Criar Conta Grátis
                </button>
              )}
            </div>
            
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Pagamento Instantâneo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Prêmios Reais</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;