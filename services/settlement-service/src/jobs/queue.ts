import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const SETTLEMENT_QUEUE_NAME = 'settlement-queue';

export const settlementQueue = new Queue(SETTLEMENT_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
