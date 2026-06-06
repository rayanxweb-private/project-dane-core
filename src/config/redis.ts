import { createClient } from 'redis';
import { winstonLogger } from '@/lib/logger';

// Membaca URL koneksi internal dari infrastruktur Railway
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Strategi reconect otomatis jika pipa jaringan internal Railway berkedip
      const delay = Math.min(retries * 50, 2000);
      return delay;
    }
  }
});

redis.on('error', (err) => winstonLogger.error('[RAILWAY REDIS CLIENT ERROR]', err));

// Pastikan koneksi terbuka di background runtime Node.js
if (!redis.isOpen) {
  redis.connect().then(() => {
    winstonLogger.info('Successfully established secure TCP connection to Railway Redis cluster node.');
  });
}

/**
 * Helper utilitas kompatibilitas sistem Webhook Retry Queue & Rate Limiter Project DANE.
 */
export const redisClientHelper = {
  async rpush(key: string, value: string): Promise<number> {
    return await redis.rPush(key, value);
  },

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await redis.lRange(key, start, stop);
  },

  async del(key: string): Promise<number> {
    return await redis.del(key);
  },

  async incr(key: string): Promise<number> {
    return await redis.incr(key);
  },

  async expire(key: string, seconds: number): Promise<boolean> {
    return await redis.expire(key, seconds);
  }
};
