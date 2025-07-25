import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class PixService {
  constructor() {
    this.apiKey = process.env.FASTSOFT_API_KEY;
    this.baseUrl = process.env.FASTSOFT_API_URL;
    this.publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://your-domain.com';
    
    if (!this.apiKey || !this.baseUrl) {
      throw new Error('FastSoft API credentials not configured');
    }
  }

  async createPixTransaction(amount, userId, transactionId) {
    try {
      const payload = {
        amount: amount,
        description: `Depósito RaspouGanhou - ${transactionId}`,
        external_id: transactionId,
        webhook_url: `${this.publicBaseUrl}/api/webhook/pix`,
        return_url: `${this.publicBaseUrl}/deposito?status=success`,
        cancel_url: `${this.publicBaseUrl}/deposito?status=cancel`
      };

      const response = await axios.post(`${this.baseUrl}/transactions`, payload, {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('FastSoft API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async checkTransactionStatus(transactionId) {
    try {
      const response = await axios.get(`${this.baseUrl}/transactions/${transactionId}`, {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('FastSoft Status Check Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

export default new PixService();