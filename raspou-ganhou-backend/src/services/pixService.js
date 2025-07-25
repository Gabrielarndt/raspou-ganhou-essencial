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
  console.log('PIX Service – API URL:', this.apiUrl);
  console.log('PAYLOAD PIX:', JSON.stringify({
    amount, payment_method: 'pix', customer: customerData,
    order_id: orderId, description: `...`, notification_url: ..., return_url: ...
  }, null, 2));

  try {
    const response = await axios.post(
      `${this.apiUrl}/api/user/transactions`,
      payload,
      { headers: this.getHeaders() }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('PIX Service error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

  // Consultar status da transação
  async getTransactionStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/transactions/${transactionId}`,
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