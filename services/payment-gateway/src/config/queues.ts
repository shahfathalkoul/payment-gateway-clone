import { Queue } from 'bullmq';
import { redisClient } from './redis';

export const QUEUES = {
  WEBHOOK_DISPATCH: 'webhook-dispatch-queue',
  REFUND_PROCESSING: 'refund-processing-queue',
};

// Queue Definitions
export const webhookQueue = new Queue(QUEUES.WEBHOOK_DISPATCH, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 8,
    backoff: {
      type: 'exponential',
      delay: 2000, // Starts at 2s, then 4s, 8s, 16s...
    },
    removeOnComplete: true, // Auto-cleanup successful jobs
    removeOnFail: false,    // Keep failed jobs for inspection/Dead Letter Queue
  },
});

export const refundQueue = new Queue(QUEUES.REFUND_PROCESSING, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: true,
  },
});
