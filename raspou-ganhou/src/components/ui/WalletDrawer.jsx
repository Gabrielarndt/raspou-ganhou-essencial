import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { X, Plus, Minus, Coins, Gift } from 'lucide-react';

const WalletDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDeposit = () => {
    onClose();
    navigate('/deposito');
  };

  const handleWithdraw = () => {
    onClose();
    navigate('/saque');
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md mx-auto bg-gray-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Minha Carteira</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saldos */}
        <div className="space-y-4 mb-8">
          {/* Saldo Real */}
          <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Saldo Real</p>
                <p className="text-white font-bold">{formatCurrency(user.saldo_real)}</p>
              </div>
            </div>
          </div>

          {/* Saldo Bônus */}
          <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Bônus</p>
                <p className="text-white font-bold">{formatCurrency(user.saldo_bonus)}</p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium">Total Disponível</p>
                <p className="text-yellow-400 font-bold text-xl">
                  {formatCurrency(user.saldo_real + user.saldo_bonus)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleDeposit}
            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Depositar</span>
          </button>
          
          <button
            onClick={handleWithdraw}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <Minus className="w-5 h-5" />
            <span>Sacar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDrawer;

