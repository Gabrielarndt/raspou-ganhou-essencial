import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { 
  ArrowLeft, 
  QrCode,
  DollarSign,
  Check,
  Clock,
  AlertCircle,
  Gift,
  Copy,
  RefreshCw
} from 'lucide-react';

const Deposit = () => {
  const navigate = useNavigate();
  const { user, refreshUser, getTotalBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  // Timer para expiração do PIX
  React.useEffect(() => {
    if (pixData && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setPixData(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [pixData, timeRemaining]);

  // Verificar status do pagamento periodicamente
  React.useEffect(() => {
    if (pixData && !checkingStatus) {
      const statusTimer = setInterval(async () => {
        await checkPaymentStatus();
      }, 5000); // Verifica a cada 5 segundos
      
      return () => clearInterval(statusTimer);
    }
  }, [pixData, checkingStatus]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const numericAmount = parseFloat(amount) || 0;
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
    if (!pixData) setAmount(value.toString());
  };

  const handleGeneratePix = async () => {
    if (numericAmount < 20) {
      alert('Valor mínimo para depósito é R$ 20,00');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await apiClient.createPixDeposit(numericAmount);
      
      if (result.success) {
        setPixData(result.data);
        setTimeRemaining(15 * 60); // 15 minutos
      } else {
        alert('Erro ao gerar PIX: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      alert('Erro ao gerar PIX: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!pixData || checkingStatus) return;
    
    setCheckingStatus(true);
    
    try {
      const result = await apiClient.checkPixStatus(pixData.transaction_id);
      
      if (result.success && result.data.status === 'completed') {
        await refreshUser();
        setPixData(null);
        setShowSuccess(true);
        setAmount('');
        
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/minha-conta');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.qr_code_text) {
      navigator.clipboard.writeText(pixData.qr_code_text);
      alert('Código PIX copiado para a área de transferência!');
    }
  };

  const handleNewDeposit = () => {
    setPixData(null);
    setAmount('');
    setTimeRemaining(0);
  };

  const isValidAmount = numericAmount >= 20 && numericAmount <= 5000;

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
            {!pixData ? (
              <>
                {/* Método PIX */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Método de Pagamento</h3>
                  
                  <div className="p-4 rounded-lg border-2 border-green-400 bg-green-400/10">
                    <div className="flex items-center space-x-4">
                      <QrCode className="w-6 h-6 text-green-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-green-400">PIX</p>
                        <p className="text-gray-400 text-sm">Transferência instantânea</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Taxa: Grátis</p>
                        <p className="text-xs text-gray-500">Instantâneo</p>
                      </div>
                    </div>
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
                        className="bg-gray-700 hover:bg-green-600 hover:text-white text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
                      placeholder="Digite o valor (mín. R$ 20)"
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                      min={20}
                      max={5000}
                    />
                  </div>

                  {/* Limites */}
                  <div className="text-sm text-gray-400 mb-4">
                    Limite: {formatCurrency(20)} - {formatCurrency(5000)}
                  </div>

                  {/* Resumo */}
                  {numericAmount > 0 && (
                    <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Valor do depósito:</span>
                        <span className="text-white">{formatCurrency(numericAmount)}</span>
                      </div>
                      
                      {bonusAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-green-400">Bônus (10%):</span>
                          <span className="text-green-400">+{formatCurrency(bonusAmount)}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-600 pt-2">
                        <div className="flex justify-between font-bold">
                          <span className="text-white">Você receberá:</span>
                          <span className="text-green-400">{formatCurrency(numericAmount + bonusAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão de Gerar PIX */}
                <button
                  onClick={handleGeneratePix}
                  disabled={!isValidAmount || isProcessing}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      <span>Gerando PIX...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      <span>Gerar PIX {numericAmount > 0 ? formatCurrency(numericAmount) : ''}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* QR Code PIX */}
                <div className="bg-gray-800 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">PIX Gerado</h3>
                    <div className="flex items-center space-x-2 text-orange-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                    <img 
                      src={pixData.qr_code} 
                      alt="QR Code PIX" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    Escaneie o QR Code ou copie o código PIX
                  </p>
                  
                  {/* Código PIX */}
                  <div className="bg-gray-700 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-400 mb-1">Código PIX:</p>
                    <p className="text-white font-mono text-sm break-all">
                      {pixData.qr_code_text}
                    </p>
                  </div>
                  
                  {/* Botões */}
                  <div className="flex space-x-3">
                    <button
                      onClick={copyPixCode}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copiar Código</span>
                    </button>
                    
                    <button
                      onClick={checkPaymentStatus}
                      disabled={checkingStatus}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
                      <span>Verificar</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={handleNewDeposit}
                    className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Novo Depósito
                  </button>
                </div>

                {/* Informações do Pagamento */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Detalhes do Pagamento</h3>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor:</span>
                    <span className="text-white font-bold">{formatCurrency(pixData.amount)}</span>
                  </div>
                  
                  {bonusAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bônus:</span>
                      <span className="text-green-400 font-bold">+{formatCurrency(bonusAmount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total a receber:</span>
                      <span className="text-green-400 font-bold">{formatCurrency(pixData.amount + bonusAmount)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
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
                  <span className="text-gray-300 text-sm">PIX 100% seguro</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Criptografia bancária</span>
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
                  <p className="text-gray-300 text-xs">PIX é processado instantaneamente após o pagamento.</p>
                </div>
                
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">O PIX expira?</p>
                  <p className="text-gray-300 text-xs">Sim, você tem 15 minutos para efetuar o pagamento.</p>
                </div>
                
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">É seguro?</p>
                  <p className="text-gray-300 text-xs">Totalmente seguro, processado pelo Banco Central.</p>
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
                  +{formatCurrency((pixData?.amount || numericAmount) + bonusAmount)}
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

