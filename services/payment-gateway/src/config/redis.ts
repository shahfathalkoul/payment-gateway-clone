import Redis from 'ioredis';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'redis-client' });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});
