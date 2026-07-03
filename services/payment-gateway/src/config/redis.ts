import Redis from 'ioredis';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'redis-client' });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    if (times > 3 && (redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1'))) {
      logger.warn('Redis unreachable on localhost after 3 retries. Disabling further reconnection retries.');
      return null; // Stop retrying
    }
    return Math.min(times * 200, 2000);
  },
});

redisClient.on('error', (err) => {
  // Catch silent error to avoid unhandled crash
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});
