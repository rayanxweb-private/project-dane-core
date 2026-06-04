import { winstonLogger } from '@/lib/logger';

export interface DanaConfig {
  partnerId: string;
  clientSecret: string;
  privateKey: string;
  merchantId: string;
  apiBaseUrl: string;
}

export const danaConfig: DanaConfig = {
  partnerId: process.env.DANA_PARTNER_ID || '',
  clientSecret: process.env.DANA_CLIENT_SECRET || '',
  privateKey: process.env.DANA_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  merchantId: process.env.DANA_MERCHANT_ID || '',
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.dana.id' 
    : 'https://api.sandbox.dana.id'
};

if (!danaConfig.partnerId || !danaConfig.privateKey) {
  winstonLogger.warn('DANA SDK configurations are missing or incomplete.');
}
