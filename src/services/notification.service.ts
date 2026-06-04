import { adminMessaging } from '@/config/firebase-admin';
import { winstonLogger } from '@/lib/logger';
import { Resend } from 'resend';

// Inisialisasi Resend SDK menggunakan API Key, bukan SMTP Credentials
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_sandbox_api_key_12345');

export class NotificationService {
  
  /**
   * 1. Jalur Notifikasi Push - Firebase Cloud Messaging (FCM)
   */
  async sendBroadcastTransactionPush(deviceToken: string, title: string, bodyStr: string, transactionId: string): Promise<void> {
    const payload = {
      token: deviceToken,
      notification: { title, body: bodyStr },
      data: {
        transactionId,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        navigationRoute: `/dashboard/transactions/${transactionId}`
      },
      android: { priority: 'high' as const },
      apns: { payload: { aps: { sound: 'default' } } }
    };

    try {
      const response = await adminMessaging.send(payload);
      winstonLogger.info(`[FCM REST API] Notification successfully dispatched to device: ${response}`);
    } catch (error) {
      winstonLogger.error('[FCM REST API] Network pipeline failure:', error);
    }
  }

  /**
   * 2. Jalur Notifikasi Email - HTTP REST API (Tanpa SMTP)
   */
  async sendFinancialSettlementEmail(recipientEmail: string, merchantName: string, totalSettlementAmount: number): Promise<void> {
    const htmlBody = `
      <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #2563eb; margin-bottom: 4px;">DANA Enterprise Platform</h2>
        <p style="font-size: 12px; color: #64748b; margin-top: 0;">Automated Clearing Ledger Statement Document</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p>Dear Valued Partner, <strong>${merchantName}</strong>,</p>
        <p>We are pleased to inform you that your automated operational settlement allocation cycle has been processed completely.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 14px; margin: 20px 0; border: 1px solid #cbd5e1;">
          Settlement Dispatched Value: <strong style="color: #10b981;">IDR ${totalSettlementAmount.toLocaleString()}</strong><br/>
          Processing Status Code: CLEARING_SETTLED_SUCCESS
        </div>
        <p style="font-size: 11px; color: #94a3b8; line-height: 1.5;">This email is an automatically generated financial legal record. Please do not reply directly to this thread channel address.</p>
      </div>
    `;

    try {
      // Menembak REST API endpoint Resend via HTTPS POST secara asinkronus
      const { data, error } = await resend.emails.send({
        from: 'DANA Enterprise Clearing <settlements@enterprise.dana.id>',
        to: [recipientEmail],
        subject: `[FINANCIAL SETTLEMENT] Clearing Ledger Statement Update`,
        html: htmlBody,
      });

      if (error) {
        throw new Error(`Resend REST API Engine returned error code: ${error.message}`);
      }

      winstonLogger.info(`[HTTP REST EMAIL] Ledger statement successfully delivered via Resend API. ID: ${data?.id}`);
    } catch (error: any) {
      winstonLogger.error('[HTTP REST EMAIL] Transmission execution exception through API node:', error.message);
    }
  }
}
