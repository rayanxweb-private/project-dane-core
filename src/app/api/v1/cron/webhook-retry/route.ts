import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/services/webhook.service';
import { winstonLogger } from '@/lib/logger';

const webhookService = new WebhookService();

export async function GET(req: NextRequest) {
  // Enforce Vercel Auth Header Token Match Safeguard Check
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized Automated Operations Framework Call' }, { status: 401 });
  }

  try {
    winstonLogger.info('Initializing automated background cron execution for transaction webhook retries.');
    await webhookService.processRetryQueue();
    return NextResponse.json({ status: 'RETRY_QUEUE_EXECUTION_COMPLETED' }, { status: 200 });
  } catch (error: any) {
    winstonLogger.error('Catastrophic Failure processing system retry queue loop:', error);
    return NextResponse.json({ error: 'Internal Queue Processing Exception', details: error.message }, { status: 500 });
  }
}
