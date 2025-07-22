import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  QrCode,
  DollarSign,
  Plus,
  Minus,
  Check,
  Clock,
  AlertCircle,
  Gift
} from 'lucide-react';

const Deposit = () => {
  const navigate = useNavigate();
  const { user, updateBalance, getTotalBalance } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('pix');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const paymentMethods = [
    {
      id: 'pix',
      name: 'PIX',
      icon: QrCode,
      description: 'Transferência instantânea',
      fee: 0,
      minAmount: 10,
      maxAmount: 5000,
      processingTime: 'Instantâneo'
    },
    {
      id: 'credit',
      name: 'Cartão de Crédito',
      icon: CreditCard,
      description: 'Visa, Mastercard, Elo',
      fee: 3.99,
      minAmount: 20,
      maxAmount: 2000,
      processingTime: 'Até 5 minutos'
    },
    {
      id: 'debit',
      name: 'Cartão de Débito',
      icon: CreditCard,
      description: 'Débito online',
      fee: 1.99,
      minAmount: 10,
      maxAmount: 1000,
      processingTime: 'Até 2 minutos'
    }
  ];

  const quickAmounts = [10, 25, 50, 100, 200, 500];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const selectedPayment = paymentMethods.find(method => method.id === selectedMethod);
  const numericAmount = parseFloat(amount) || 0;
  const feeAmount = selectedPayment ? (numericAmount * selectedPayment.fee / 100) : 0;
  const totalAmount = numericAmount + feeAmount;
  const bonusAmount = numericAmount >= 100 ? numericAmount * 0.1 : 0; // 10% bônus para depósitos acima de R$ 100

  const handleAmountChange = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setAmount('');
    } else {
      setAmount(value);
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleDeposit = async () => {
    if (!selectedPayment || numericAmount < selectedPayment.minAmount) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar saldo do usuário
      const newBalance = {
        saldo_real: user.saldo_real + numericAmount,
        saldo_bonus: user.saldo_bonus + bonusAmount
      };

      updateBalance(newBalance);

      // Salvar transação no histórico
      const transactions = JSON.parse(localStorage.getItem('raspou_transactions') || '[]');
      const newTransaction = {
        id: Date.now(),
        user_id: user.id,
        type: 'deposit',
        method: selectedPayment.name,
        amount: numericAmount,
        fee: feeAmount,
        bonus: bonusAmount,
        status: 'completed',
        date: new Date().toISOString()
      };
      
      transactions.push(newTransaction);
      localStorage.setItem('raspou_transactions', JSON.stringify(transactions));

      setShowSuccess(true);
      setAmount('');
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/minha-conta');
      }, 3000);

    } catch (error) {
      console.error('Erro no depósito:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidAmount = numericAmount >= (selectedPayment?.minAmount || 0) && 
                       numericAmount <= (selectedPayment?.maxAmount || 0);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20 lg:pb-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/minha-conta')}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-yellow-400">Adicionar Saldo</h1>
          <div className="w-10" />
        </div>

        {/* Saldo Atual */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-white/80 text-lg mb-2">Saldo Atual</h2>
          <p className="text-white text-3xl lg:text-4xl font-bold mb-2">
            {formatCurrency(getTotalBalance())}
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <span className="text-white/80">
              Real: {formatCurrency(user.saldo_real)}
            </span>
            <span className="text-white/80">
              Bônus: {formatCurrency(user.saldo_bonus)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Formulário de Depósito */}
          <div className="space-y-6">
            
            {/* Métodos de Pagamento */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">Método de Pagamento</h3>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <method.icon className={`w-6 h-6 ${
                        selectedMethod === method.id ? 'text-yellow-400' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${
                          selectedMethod === method.id ? 'text-yellow-400' : 'text-white'
                        }`}>
                          {method.name}
                        </p>
                        <p className="text-gray-400 text-sm">{method.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          Taxa: {method.fee > 0 ? `${method.fee}%` : 'Grátis'}
                        </p>
                        <p className="text-xs text-gray-500">{method.processingTime}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Valor do Depósito */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">Valor do Depósito</h3>
              
              {/* Valores Rápidos */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleQuickAmount(value)}
                    className="bg-gray-700 hover:bg-yellow-600 hover:text-black text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {formatCurrency(value)}
                  </button>
                ))}
              </div>

              {/* Input Personalizado */}
              <div className="relative mb-4">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Digite o valor"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  min={selectedPayment?.minAmount || 0}
                  max={selectedPayment?.maxAmount || 0}
                />
              </div>

              {/* Limites */}
              {selectedPayment && (
                <div className="text-sm text-gray-400 mb-4">
                  Limite: {formatCurrency(selectedPayment.minAmount)} - {formatCurrency(selectedPayment.maxAmount)}
                </div>
              )}

              {/* Resumo */}
              {numericAmount > 0 && (
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Valor do depósito:</span>
                    <span className="text-white">{formatCurrency(numericAmount)}</span>
                  </div>
                  
                  {feeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Taxa ({selectedPayment.fee}%):</span>
                      <span className="text-red-400">{formatCurrency(feeAmount)}</span>
                    </div>
                  )}
                  
                  {bonusAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-400">Bônus (10%):</span>
                      <span className="text-green-400">+{formatCurrency(bonusAmount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-600 pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Total a pagar:</span>
                      <span className="text-yellow-400">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Você receberá:</span>
                      <span className="text-green-400">{formatCurrency(numericAmount + bonusAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Depósito */}
            <button
              onClick={handleDeposit}
              disabled={!isValidAmount || isProcessing}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Depositar {numericAmount > 0 ? formatCurrency(totalAmount) : ''}</span>
                </>
              )}
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Promoção Bônus */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-center">
              <Gift className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Bônus de Depósito</h3>
              <p className="text-white/90 text-sm mb-4">
                Ganhe 10% de bônus em depósitos acima de R$ 100!
              </p>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-white text-xs">
                  Exemplo: Deposite R$ 100 e receba R$ 110 para jogar!
                </p>
              </div>
            </div>

            {/* Informações de Segurança */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">🔒 Segurança</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Transações criptografadas SSL</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Dados protegidos PCI DSS</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Processamento instantâneo</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Suporte 24/7</span>
                </div>
              </div>
            </div>

            {/* Dúvidas Frequentes */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">❓ Dúvidas Frequentes</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">Quanto tempo demora?</p>
                  <p className="text-gray-300 text-xs">PIX é instantâneo, cartões até 5 minutos.</p>
                </div>
                
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">Posso cancelar?</p>
                  <p className="text-gray-300 text-xs">Sim, antes da confirmação do pagamento.</p>
                </div>
                
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">É seguro?</p>
                  <p className="text-gray-300 text-xs">100% seguro com criptografia bancária.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Sucesso */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Depósito Realizado!</h3>
              <p className="text-gray-300 mb-4">
                Seu saldo foi atualizado com sucesso.
              </p>
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-green-400 font-bold text-lg">
                  +{formatCurrency(numericAmount + bonusAmount)}
                </p>
                <p className="text-gray-400 text-sm">adicionado à sua conta</p>
              </div>
              <p className="text-gray-400 text-sm">
                Redirecionando para seu perfil...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposit;

