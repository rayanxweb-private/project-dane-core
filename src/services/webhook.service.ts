import { connectDB, Transaction } from '@/config/database';
import { redis } from '@/config/redis';
import { winstonLogger } from '@/lib/logger';
import crypto from 'crypto';

export class WebhookService {
  private generateOutboundSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  async dispatchWebhook(merchantWebhookUrl: string, merchantSecret: string, eventType: string, transactionPayload: any): Promise<boolean> {
    const timestamp = Date.now().toString();
    const bodyStr = JSON.stringify({
      event: eventType,
      timestamp,
      data: transactionPayload
    });

    const signature = this.generateOutboundSignature(bodyStr, merchantSecret);

    try {
      const response = await fetch(merchantWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DANA-Enterprise-Event': eventType,
          'X-DANA-Enterprise-Signature': signature,
          'X-DANA-Enterprise-Timestamp': timestamp
        },
        body: bodyStr,
        signal: AbortSignal.timeout(10000) // Strict 10-second request timeout boundary
      });

      if (response.ok) {
        winstonLogger.info(`Outbound Webhook Delivery Successful for order ${transactionPayload.orderId}`);
        return true;
      }

      throw new Error(`Merchant Server responded with status code: ${response.status}`);
    } catch (error: any) {
      winstonLogger.warn(`Outbound Webhook Delivery Failure for order ${transactionPayload.orderId}. Enqueueing to Dead-Letter Queue.`);
      await this.enqueueFailedWebhook(merchantWebhookUrl, merchantSecret, eventType, transactionPayload, 1);
      return false;
    }
  }

  private async enqueueFailedWebhook(url: string, secret: string, event: string, payload: any, attempt: number) {
    const queueKey = '@dana-enterprise/webhook-retry-queue';
    const retryItem = {
      url,
      secret,
      event,
      payload,
      attempt,
      nextRetryTimestamp: Date.now() + Math.pow(2, attempt) * 60 * 1000 // Exponential Backoff Strategy Matrix (2^attempt minutes)
    };

    await redis.rpush(queueKey, JSON.stringify(retryItem));
  }

  async processRetryQueue(): Promise<void> {
    const queueKey = '@dana-enterprise/webhook-retry-queue';
    const items = await redis.lrange(queueKey, 0, -1);
    
    if (items.length === 0) return;

    // Clear queue items for batch processing run cycle
    await redis.del(queueKey);

    for (const itemStr of items) {
      const item = JSON.parse(itemStr);
      
      if (Date.now() >= item.nextRetryTimestamp) {
        try {
          const timestamp = Date.now().toString();
          const bodyStr = JSON.stringify({ event: item.event, timestamp, data: item.payload });
          const signature = this.generateOutboundSignature(bodyStr, item.secret);

          const response = await fetch(item.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-DANA-Enterprise-Signature': signature,
              'X-DANA-Enterprise-Timestamp': timestamp
            },
            body: bodyStr,
            signal: AbortSignal.timeout(5000)
          });

          if (!response.ok && item.attempt < 5) { // Maximum 5 incremental retries allowed per transaction ledger boundary
            await this.enqueueFailedWebhook(item.url, item.secret, item.event, item.payload, item.attempt + 1);
          }
        } catch {
          if (item.attempt < 5) {
            await this.enqueueFailedWebhook(item.url, item.secret, item.event, item.payload, item.attempt + 1);
          } else {
            winstonLogger.error(`Catastrophic Outbound Webhook Delivery Drop for order ${item.payload.orderId} post maximum retry cycles completion.`);
          }
        }
      } else {
        // Re-enqueue item if wait period has not elapsed yet
        await redis.rpush(queueKey, JSON.stringify(item));
      }
    }
  }
        }
