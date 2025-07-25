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
      'Authorization': `${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Criar transação PIX
  async createPixTransaction(amount, customerData, orderId) {
    const payload = {
      amount: parseFloat(amount),
      payment_method: 'pix',
      customer: {
        name: customerData.name,
        email: customerData.email,
        cpf: customerData.cpf,
        phone: customerData.phone
      },
      order_id: orderId,
      description: `Depósito RaspouGanhou - ${orderId}`,
      notification_url: `${process.env.PUBLIC_BASE_URL}/api/webhook/pix`,
      return_url: `${process.env.PUBLIC_BASE_URL}/deposito`
    };

    console.log('PIX Service – API URL:', this.apiUrl);
    console.log('PAYLOAD PIX:', JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(
        `${this.apiUrl}/transactions`,
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