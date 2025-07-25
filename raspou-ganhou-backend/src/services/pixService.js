import axios from 'axios';

class PixService {
  constructor() {
    this.apiUrl = process.env.FASTSOFT_API_URL;
    this.apiKey = process.env.FASTSOFT_API_KEY;
    this.webhookSecret = process.env.FASTSOFT_WEBHOOK_SECRET;

    if (!this.apiUrl) {
      throw new Error('FASTSOFT_API_URL environment variable is required');
    }
    if (!this.apiKey) {
      throw new Error('FASTSOFT_API_KEY environment variable is required');
    }
  }

  // Headers padrão para autenticação
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Criar transação PIX
  async createPixTransaction(amount, customerData, orderId) {
    try {
      const payload = {
        amount: parseFloat(amount),
        currency: 'BRL',
        payment_method: 'pix',
        customer: {
          name: customerData.name,
          email: customerData.email,
          document: customerData.cpf,
          phone: customerData.phone
        },
        order_id: orderId,
        description: `Depósito RaspouGanhou - ${amount}`,
        expires_in: 900, // 15 minutos
        notification_url: `${process.env.CORS_ORIGIN}/api/webhook/pix`,
        return_url: `${process.env.CORS_ORIGIN}/deposito/sucesso`
      };

      const response = await axios.post(
        `${this.apiUrl}/transactions`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('PIX Service - Create transaction error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar transação PIX'
      };
    }
  }

  // Consultar status da transação
  async getTransactionStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/transactions/${transactionId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('PIX Service - Get transaction error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao consultar transação'
      };
    }
  }

  // Verificar webhook signature
  verifyWebhookSignature(payload, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  // Processar webhook de pagamento
  async processWebhook(webhookData) {
    try {
      const { transaction_id, status, amount, order_id } = webhookData;

      return {
        success: true,
        data: {
          transactionId: transaction_id,
          status,
          amount: parseFloat(amount),
          orderId: order_id
        }
      };

    } catch (error) {
      console.error('PIX Service - Process webhook error:', error);
      return {
        success: false,
        error: 'Erro ao processar webhook'
      };
    }
  }

  // Obter taxas
  async getFees(amount) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/fees?amount=${amount}&payment_method=pix`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('PIX Service - Get fees error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Erro ao consultar taxas'
      };
    }
  }
}

export default new PixService();