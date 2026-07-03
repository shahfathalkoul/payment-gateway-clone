import Redis from 'ioredis';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'settlement-redis' });

export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});
