import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Shield,
  Award,
  Clock
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8 mb-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logoGanhou.png" 
                alt="RaspouGanhou Logo" 
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div>
                <h3 className="text-yellow-400 font-bold text-lg">RaspouGanhou</h3>
                <p className="text-gray-400 text-xs">Raspe e Ganhe</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              O melhor site de raspadinhas online do Brasil. Prêmios instantâneos, 
              sorteios diários e a melhor experiência de jogo.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/raspadinhas" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Raspadinhas
                </Link>
              </li>
              <li>
                <Link to="/numeros" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Números & Sorteios
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Como Jogar
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Ganhadores
                </a>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="text-white font-bold mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Jogo Responsável
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-sm">contato@raspouganhou.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-sm">(11) 9999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-sm">Suporte 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6 mb-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img 
                src="/logoGanhou.png" 
                alt="RaspouGanhou Logo" 
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div>
                <h3 className="text-yellow-400 font-bold text-lg">RaspouGanhou</h3>
                <p className="text-gray-400 text-xs">Raspe e Ganhe</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              O melhor site de raspadinhas online do Brasil.
            </p>
          </div>

          {/* Links em Grid */}
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <h4 className="text-white font-bold mb-3">Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Início
                  </Link>
                </li>
                <li>
                  <Link to="/raspadinhas" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Raspadinhas
                  </Link>
                </li>
                <li>
                  <Link to="/numeros" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Sorteios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Suporte</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Termos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="text-center">
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Certificações e Segurança */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex flex-wrap justify-center lg:justify-between items-center gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">SSL Seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm">Licenciado</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Suporte 24/7</span>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              +18 | Jogue com responsabilidade
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} RaspouGanhou. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Este site é destinado apenas para maiores de 18 anos. Jogue com responsabilidade.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

