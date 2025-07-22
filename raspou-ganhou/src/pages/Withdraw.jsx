import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  CreditCard, 
  QrCode,
  DollarSign,
  Minus,
  Check,
  Clock,
  AlertCircle,
  Shield,
  Info
} from 'lucide-react';

const Withdraw = () => {
  const navigate = useNavigate();
  const { user, updateBalance, getTotalBalance } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('pix');
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [bankData, setBankData] = useState({
    bank: '',
    agency: '',
    account: '',
    accountType: 'corrente'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const withdrawMethods = [
    {
      id: 'pix',
      name: 'PIX',
      icon: QrCode,
      description: 'Transferência instantânea',
      fee: 0,
      minAmount: 20,
      maxAmount: 5000,
      processingTime: 'Até 30 minutos'
    },
    {
      id: 'bank',
      name: 'Transferência Bancária',
      icon: CreditCard,
      description: 'TED/DOC',
      fee: 5.00,
      minAmount: 50,
      maxAmount: 10000,
      processingTime: 'Até 24 horas'
    }
  ];

  const quickAmounts = [50, 100, 200, 500, 1000];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const selectedPayment = withdrawMethods.find(method => method.id === selectedMethod);
  const numericAmount = parseFloat(amount) || 0;
  const feeAmount = selectedPayment?.fee || 0;
  const totalReceived = numericAmount - feeAmount;
  const availableBalance = user?.saldo_real || 0; // Só pode sacar saldo real

  const handleAmountChange = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setAmount('');
    } else if (numValue > availableBalance) {
      setAmount(availableBalance.toString());
    } else {
      setAmount(value);
    }
  };

  const handleQuickAmount = (value) => {
    if (value <= availableBalance) {
      setAmount(value.toString());
    }
  };

  const handleWithdraw = async () => {
    if (!selectedPayment || numericAmount < selectedPayment.minAmount || numericAmount > availableBalance) {
      return;
    }

    // Validar dados específicos do método
    if (selectedMethod === 'pix' && !pixKey.trim()) {
      alert('Por favor, informe sua chave PIX');
      return;
    }

    if (selectedMethod === 'bank' && (!bankData.bank || !bankData.agency || !bankData.account)) {
      alert('Por favor, preencha todos os dados bancários');
      return;
    }

    setIsProcessing(true);

    try {
      // Simular processamento do saque
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar saldo do usuário
      const newBalance = {
        saldo_real: user.saldo_real - numericAmount,
        saldo_bonus: user.saldo_bonus
      };

      updateBalance(newBalance);

      // Salvar transação no histórico
      const transactions = JSON.parse(localStorage.getItem('raspou_transactions') || '[]');
      const newTransaction = {
        id: Date.now(),
        user_id: user.id,
        type: 'withdraw',
        method: selectedPayment.name,
        amount: numericAmount,
        fee: feeAmount,
        net_amount: totalReceived,
        status: 'processing',
        date: new Date().toISOString(),
        details: selectedMethod === 'pix' ? { pix_key: pixKey } : bankData
      };
      
      transactions.push(newTransaction);
      localStorage.setItem('raspou_transactions', JSON.stringify(transactions));

      setShowSuccess(true);
      setAmount('');
      setPixKey('');
      setBankData({ bank: '', agency: '', account: '', accountType: 'corrente' });
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/minha-conta');
      }, 3000);

    } catch (error) {
      console.error('Erro no saque:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidAmount = numericAmount >= (selectedPayment?.minAmount || 0) && 
                       numericAmount <= availableBalance &&
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
          <h1 className="text-2xl lg:text-3xl font-bold text-yellow-400">Sacar Dinheiro</h1>
          <div className="w-10" />
        </div>

        {/* Saldo Disponível */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-white/80 text-lg mb-2">Saldo Disponível para Saque</h2>
          <p className="text-white text-3xl lg:text-4xl font-bold mb-2">
            {formatCurrency(availableBalance)}
          </p>
          <p className="text-white/80 text-sm">
            * Apenas saldo real pode ser sacado
          </p>
        </div>

        {/* Aviso Importante */}
        <div className="bg-yellow-600/20 border border-yellow-600 rounded-xl p-4 mb-8 flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium text-sm mb-1">Importante:</p>
            <p className="text-yellow-200 text-sm">
              Saques são processados apenas em dias úteis. O valor mínimo é R$ 20,00 e você pode sacar apenas o saldo real (não inclui bônus).
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Formulário de Saque */}
          <div className="space-y-6">
            
            {/* Métodos de Saque */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">Método de Saque</h3>
              
              <div className="space-y-3">
                {withdrawMethods.map((method) => (
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
                          Taxa: {method.fee > 0 ? formatCurrency(method.fee) : 'Grátis'}
                        </p>
                        <p className="text-xs text-gray-500">{method.processingTime}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dados do Método Selecionado */}
            {selectedMethod === 'pix' && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Dados PIX</h3>
                
                <div className="relative">
                  <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Digite sua chave PIX (CPF, email, telefone ou chave aleatória)"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  A chave PIX deve estar no mesmo CPF da conta
                </p>
              </div>
            )}

            {selectedMethod === 'bank' && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Dados Bancários</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Banco</label>
                    <select
                      value={bankData.bank}
                      onChange={(e) => setBankData({...bankData, bank: e.target.value})}
                      className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">Selecione o banco</option>
                      <option value="001">Banco do Brasil</option>
                      <option value="104">Caixa Econômica Federal</option>
                      <option value="341">Itaú</option>
                      <option value="033">Santander</option>
                      <option value="237">Bradesco</option>
                      <option value="260">Nu Pagamentos</option>
                      <option value="077">Inter</option>
                      <option value="212">Banco Original</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Agência</label>
                    <input
                      type="text"
                      value={bankData.agency}
                      onChange={(e) => setBankData({...bankData, agency: e.target.value})}
                      placeholder="0000"
                      className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Conta</label>
                    <input
                      type="text"
                      value={bankData.account}
                      onChange={(e) => setBankData({...bankData, account: e.target.value})}
                      placeholder="00000-0"
                      className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Conta</label>
                    <select
                      value={bankData.accountType}
                      onChange={(e) => setBankData({...bankData, accountType: e.target.value})}
                      className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="corrente">Conta Corrente</option>
                      <option value="poupanca">Conta Poupança</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Valor do Saque */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">Valor do Saque</h3>
              
              {/* Valores Rápidos */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleQuickAmount(value)}
                    disabled={value > availableBalance}
                    className="bg-gray-700 hover:bg-yellow-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
                  max={Math.min(availableBalance, selectedPayment?.maxAmount || 0)}
                />
              </div>

              {/* Limites */}
              {selectedPayment && (
                <div className="text-sm text-gray-400 mb-4">
                  Limite: {formatCurrency(selectedPayment.minAmount)} - {formatCurrency(Math.min(availableBalance, selectedPayment.maxAmount))}
                </div>
              )}

              {/* Resumo */}
              {numericAmount > 0 && (
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Valor do saque:</span>
                    <span className="text-white">{formatCurrency(numericAmount)}</span>
                  </div>
                  
                  {feeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Taxa:</span>
                      <span className="text-red-400">-{formatCurrency(feeAmount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-600 pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Você receberá:</span>
                      <span className="text-green-400">{formatCurrency(totalReceived)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Saque */}
            <button
              onClick={handleWithdraw}
              disabled={!isValidAmount || isProcessing || (selectedMethod === 'pix' && !pixKey.trim()) || (selectedMethod === 'bank' && (!bankData.bank || !bankData.agency || !bankData.account))}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Minus className="w-5 h-5" />
                  <span>Sacar {numericAmount > 0 ? formatCurrency(numericAmount) : ''}</span>
                </>
              )}
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Informações de Segurança */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Segurança</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Verificação de identidade</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Dados criptografados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Processamento seguro</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Monitoramento 24/7</span>
                </div>
              </div>
            </div>

            {/* Regras de Saque */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">📋 Regras de Saque</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">Horário de Processamento</p>
                  <p className="text-gray-300 text-xs">Segunda a sexta, das 9h às 18h</p>
                </div>
                
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">Documentação</p>
                  <p className="text-gray-300 text-xs">CPF deve estar regularizado</p>
                </div>
                
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">Limite Diário</p>
                  <p className="text-gray-300 text-xs">Até R$ 5.000 por dia</p>
                </div>
                
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">Conta Bancária</p>
                  <p className="text-gray-300 text-xs">Deve estar no mesmo CPF</p>
                </div>
              </div>
            </div>

            {/* Suporte */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">💬 Precisa de Ajuda?</h3>
              
              <p className="text-gray-300 text-sm mb-4">
                Nossa equipe está pronta para ajudar com qualquer dúvida sobre saques.
              </p>
              
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                Falar com Suporte
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Sucesso */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Saque Solicitado!</h3>
              <p className="text-gray-300 mb-4">
                Sua solicitação foi enviada para processamento.
              </p>
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-blue-400 font-bold text-lg">
                  {formatCurrency(totalReceived)}
                </p>
                <p className="text-gray-400 text-sm">será transferido em breve</p>
              </div>
              <p className="text-gray-400 text-sm">
                Você receberá uma confirmação por email...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;

