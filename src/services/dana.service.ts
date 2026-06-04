import { danaConfig } from '@/config/dana';
import { winstonLogger } from '@/lib/logger';
import crypto from 'crypto';

export class DanaService {
  private generateSignature(payload: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(payload);
    return sign.sign(danaConfig.privateKey, 'base64');
  }

  private async executeRequest(endpoint: string, body: any) {
    const timestamp = new Date().toISOString();
    const payloadStr = JSON.stringify(body);
    const signatureStr = `${danaConfig.partnerId}|${timestamp}|${payloadStr}`;
    const signature = this.generateSignature(signatureStr);

    const headers = {
      'Content-Type': 'application/json',
      'X-PARTNER-ID': danaConfig.partnerId,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-MERCHANT-ID': danaConfig.merchantId
    };

    const targetUrl = `${danaConfig.apiBaseUrl}${endpoint}`;
    
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: payloadStr
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DANA API Exception [${response.status}]: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      winstonLogger.error('DANA SDK execution failure:', error);
      throw error;
    }
  }

  async createPaymentLink(params: {
    orderId: string;
    amount: number;
    description: string;
    customerName: string;
    customerEmail: string;
  }) {
    const endpoint = '/api/v1/payment/payment-link';
    const body = {
      partnerReferenceNo: params.orderId,
      amount: {
        value: params.amount.toFixed(2),
        currency: 'IDR'
      },
      payToId: danaConfig.merchantId,
      description: params.description,
      additionalInfo: {
        customerName: params.customerName,
        customerEmail: params.customerEmail
      }
    };
    return await this.executeRequest(endpoint, body);
  }

  async generateQrisDynamic(params: {
    orderId: string;
    amount: number;
    expiryPeriod: number; // in seconds
  }) {
    const endpoint = '/api/v1/payment/qris-acquire';
    const body = {
      partnerReferenceNo: params.orderId,
      amount: {
        value: params.amount.toFixed(2),
        currency: 'IDR'
      },
      merchantId: danaConfig.merchantId,
      validPeriod: params.expiryPeriod
    };
    return await this.executeRequest(endpoint, body);
  }
}
