import { supabaseAdmin } from '../config/database.js';
import pixService from '../services/pixService.js';
import { v4 as uuidv4 } from 'uuid';

export const createPixDeposit = async (req, res) => {
  console.log('🟢 Entrou em createPixDeposit no controller');

  try {
    const { amount } = req.body;
    const userId = req.user?.user_id;

    console.log('🟡 Iniciando criação de depósito PIX...');
    console.log('🔢 Valor recebido:', amount);
    console.log('👤 ID do usuário autenticado:', userId);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    if (!amount || isNaN(amount) || parseFloat(amount) < 20) {
      return res.status(400).json({ success: false, error: 'Valor mínimo para depósito é R$ 20,00' });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('❌ Usuário não encontrado:', userError);
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    const orderId = `DEP_${Date.now()}_${uuidv4().slice(0, 8)}`;

    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        method: 'PIX',
        amount: parseFloat(amount),
        net_amount: parseFloat(amount),
        status: 'pending',
        payment_provider: 'fastsoft',
        external_id: orderId,
        metadata: {
          order_id: orderId,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Erro ao inserir transação:', transactionError);
      return res.status(500).json({ success: false, error: 'Erro ao criar transação no banco de dados' });
    }

    const customerData = {
  name: user.nome,
  email: user.email,
  phone: user.telefone,
  cpf: user.cpf,
  externalRef: user.id
};


    const pixResult = await pixService.createPixTransaction(amount, customerData, orderId);

    if (!pixResult.success) {
      console.error('❌ Erro na API da FastSoft:', pixResult.error);
      await supabaseAdmin.from('transactions').update({ status: 'failed' }).eq('id', transaction.id);
      return res.status(400).json({ success: false, error: pixResult.error });
    }

    await supabaseAdmin
      .from('transactions')
      .update({
        external_id: pixResult.data.id,
        metadata: {
          ...transaction.metadata,
          fastsoft_transaction_id: pixResult.data.id,
          qr_code: pixResult.data.qr_code,
          qr_code_text: pixResult.data.qr_code_text,
          expires_at: pixResult.data.expires_at
        }
      })
      .eq('id', transaction.id);

    console.log('✅ PIX gerado com sucesso!');
    res.json({
      success: true,
      data: {
        transaction_id: transaction.id,
        fastsoft_transaction_id: pixResult.data.id,
        qr_code: pixResult.data.qr_code,
        qr_code_text: pixResult.data.qr_code_text,
        amount: parseFloat(amount),
        expires_at: pixResult.data.expires_at,
        order_id: orderId
      }
    });

  } catch (error) {
    console.error('❌ Erro geral ao criar depósito PIX:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};


export const checkPixStatus = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const userId = req.user.user_id;

    // Buscar transação no banco
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .eq('user_id', userId)
      .single();

    if (transactionError || !transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transação não encontrada' 
      });
    }

    // Se já foi processada, retornar status atual
    if (transaction.status === 'completed' || transaction.status === 'failed') {
      return res.json({
        success: true,
        data: {
          status: transaction.status,
          amount: parseFloat(transaction.amount)
        }
      });
    }

    // Consultar status na FastSoft
    const fastsoftTransactionId = transaction.metadata?.fastsoft_transaction_id;
    if (!fastsoftTransactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID da transação FastSoft não encontrado' 
      });
    }

    const statusResult = await pixService.getTransactionStatus(fastsoftTransactionId);

    if (!statusResult.success) {
      return res.status(400).json({
        success: false,
        error: statusResult.error
      });
    }

    // Atualizar status no banco se necessário
    if (statusResult.data.status !== transaction.status) {
      await supabaseAdmin
        .from('transactions')
        .update({ 
          status: statusResult.data.status,
          processed_at: statusResult.data.status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', transaction.id);

      // Se foi aprovado, processar o depósito
      if (statusResult.data.status === 'completed') {
        await processApprovedDeposit(transaction);
      }
    }

    res.json({
      success: true,
      data: {
        status: statusResult.data.status,
        amount: parseFloat(transaction.amount)
      }
    });

  } catch (error) {
    console.error('Check PIX status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

export const handlePixWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const payload = JSON.stringify(req.body);

    // Verificar assinatura do webhook
    if (!pixService.verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({ error: 'Assinatura inválida' });
    }

    const webhookResult = await pixService.processWebhook(req.body);

    if (!webhookResult.success) {
      return res.status(400).json({ error: webhookResult.error });
    }

    const { transactionId, status, amount, orderId } = webhookResult.data;

    // Buscar transação no banco pelo external_id
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('external_id', transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction not found for webhook:', orderId);
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Atualizar status da transação
    await supabaseAdmin
      .from('transactions')
      .update({ 
        status: status,
        processed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', transaction.id);

    // Se foi aprovado, processar o depósito
    if (status === 'completed') {
      await processApprovedDeposit(transaction);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('PIX webhook error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Função auxiliar para processar depósito aprovado
async function processApprovedDeposit(transaction) {
  try {
    // Buscar usuário
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', transaction.user_id)
      .single();

    if (userError || !user) {
      console.error('User not found for approved deposit:', transaction.user_id);
      return;
    }

    const depositAmount = parseFloat(transaction.amount);
    const bonus = depositAmount >= 100 ? depositAmount * 0.1 : 0; // 10% bônus para depósitos acima de R$ 100

    // Atualizar saldo do usuário
    const newRealBalance = parseFloat(user.saldo_real || 0) + depositAmount;
    const newBonusBalance = parseFloat(user.saldo_bonus || 0) + bonus;

    await supabaseAdmin
      .from('users')
      .update({
        saldo_real: newRealBalance,
        saldo_bonus: newBonusBalance
      })
      .eq('id', transaction.user_id);

    // Registrar movimentações de saldo
    const movements = [
      {
        user_id: transaction.user_id,
        transaction_id: transaction.id,
        type: 'credit',
        balance_type: 'real',
        amount: depositAmount,
        previous_balance: parseFloat(user.saldo_real || 0),
        new_balance: newRealBalance,
        description: 'Depósito via PIX'
      }
    ];

    if (bonus > 0) {
      movements.push({
        user_id: transaction.user_id,
        transaction_id: transaction.id,
        type: 'credit',
        balance_type: 'bonus',
        amount: bonus,
        previous_balance: parseFloat(user.saldo_bonus || 0),
        new_balance: newBonusBalance,
        description: 'Bônus de depósito'
      });
    }

    await supabaseAdmin
      .from('balance_movements')
      .insert(movements);

    console.log(`Depósito processado com sucesso: ${depositAmount} + ${bonus} bônus para usuário ${transaction.user_id}`);

  } catch (error) {
    console.error('Error processing approved deposit:', error);
  }
}