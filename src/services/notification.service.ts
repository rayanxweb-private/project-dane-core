import { adminMessaging } from '@/config/firebase-admin';
import { winstonLogger } from '@/lib/logger';
import nodemailer from 'nodemailer';

export class NotificationService {
  private mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailgun.org',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });

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
      winstonLogger.info(`FCM Node pushing notification transaction broadcast successfully dispatched: ${response}`);
    } catch (error) {
      winstonLogger.error('FCM Transmission pipeline network error:', error);
    }
  }

  async sendFinancialSettlementEmail(recipientEmail: string, merchantName: string, totalSettlementAmount: number): Promise<void> {
    const htmlBody = `
      <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
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
      await this.mailTransporter.sendMail({
        from: '"DANA Enterprise Clearing Platform" <settlements@enterprise.dana.id>',
        to: recipientEmail,
        subject: `[FINANCIAL SETTLEMENT] Clearing Ledger Statement Update`,
        html: htmlBody
      });
      winstonLogger.info(`Operational Settlement distribution ledger document email notification successfully transmitted to: ${recipientEmail}`);
    } catch (error) {
      winstonLogger.error('SMTP Transmission execution exception:', error);
    }
  }
}
