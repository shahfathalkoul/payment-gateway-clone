import Redis from 'ioredis';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'merchant-service' });

export const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});
