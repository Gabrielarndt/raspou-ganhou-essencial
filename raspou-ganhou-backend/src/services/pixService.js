import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

class PixService {
  constructor() {
    this.apiKey = process.env.FASTSOFT_API_KEY;
    this.baseUrl = process.env.FASTSOFT_API_URL;
    this.publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://yourdomain.com';

    if (!this.apiKey || !this.baseUrl) {
      throw new Error('FastSoft API credentials not configured');
    }
  }

  async createPixTransaction(amount, customerData, transactionId) {
    try {
      const payload = {
        amount,
        paymentMethod: 'PIX',
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          externalRef: customerData.externalRef,
        document: {
  number: (customerData.cpf || '').replace(/\D/g, ''),
  type: 'CPF'
},
          address: {
            street: 'Avenida Paulista',
            streetNumber: '123',
            complement: 'Apto 101',
            zipCode: '01000-000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            country: 'BR'
          }
        },
        items: [
          {
            title: 'Depósito RaspouGanhou',
            unitPrice: amount,
            quantity: 1,
            tangible: false,
            externalRef: transactionId
          }
        ],
        traceable: true,
        ip: '127.0.0.1',
        postbackUrl: `${this.publicBaseUrl}/api/webhook/pix`,
        metadata: {
          order_id: transactionId
        },
        pix: {
          expiresInDays: 1
        }
      };

      console.log('📤 Enviando requisição para:', `${this.baseUrl}/user/transactions`);
      console.log('📦 FastSoft payload enviado:', payload);

      const response = await axios.post(`${this.baseUrl}/user/transactions`, payload, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
        }
      });

      console.log('📥 FastSoft resposta:', response.data);

     

// ✅ Aqui está o que estava faltando:
const transactionData = Array.isArray(response.data.data)
  ? response.data.data[0]
  : response.data.data;

console.log('🔍 PIX Data bruto:', transactionData);

return {
  success: true,
  data: {
    id: transactionData.id,
    amount: transactionData.amount,
    status: transactionData.status,
    qr_code: transactionData.pix?.qrcode || null,
    qr_code_text: transactionData.pix?.qrcode || null,
    expires_at: transactionData.pix?.expirationDate || null
  }
};


    } catch (error) {
      console.error('FastSoft API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async createPixWithdrawal(amount, pixKey, customerData, transactionId) {
    try {
      const payload = {
        amount,
        paymentMethod: 'PIX',
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          externalRef: customerData.externalRef,
          document: {
            number: (customerData.cpf || '').replace(/\D/g, ''),
            type: 'CPF'
          },
          address: {
            street: 'Avenida Paulista',
            streetNumber: '123',
            complement: 'Apto 101',
            zipCode: '01000-000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            country: 'BR'
          }
        },
        items: [
          {
            title: 'Saque RaspouGanhou',
            unitPrice: amount,
            quantity: 1,
            tangible: false,
            externalRef: transactionId
          }
        ],
        traceable: true,
        ip: '127.0.0.1',
        postbackUrl: `${this.publicBaseUrl}/api/webhook/pix-withdrawal`,
        metadata: {
          order_id: transactionId,
          pix_key: pixKey
        },
        pix: {
          key: pixKey
        }
      };

      console.log('📤 Enviando requisição de saque para:', `${this.baseUrl}/user/cashout`);
      console.log('📦 FastSoft cashout payload:', payload);

      const response = await axios.post(`${this.baseUrl}/user/cashout`, payload, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📥 FastSoft cashout resposta:', response.data);

      const transactionData = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;

      console.log('🔍 Cashout Data bruto:', transactionData);

      return {
        success: true,
        data: {
          id: transactionData.id,
          amount: transactionData.amount,
          status: transactionData.status,
          pix_key: pixKey
        }
      };

    } catch (error) {
      console.error('FastSoft Cashout API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getTransactionStatus(fastsoftTransactionId) {
    try {
      const response = await axios.get(`${this.baseUrl}/user/transactions/${fastsoftTransactionId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
        }
      });

      console.log('✅ PIX status resposta:', response.data);

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
