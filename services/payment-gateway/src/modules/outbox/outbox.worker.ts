import { Worker, Job } from 'bullmq';
import { QUEUES } from '../../config/queues';
import { redisClient } from '../../config/redis';
import { prisma } from '../../config/prisma';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'webhook-worker' });

export const startWebhookWorker = () => {
  const worker = new Worker(QUEUES.WEBHOOK_DISPATCH, async (job: Job) => {
    const event = job.data;
    logger.info(`Processing Webhook Event: ${event.eventType} for Payment: ${event.aggregateId}`);

    // In a real system:
    // 1. Find the merchantId from the payload (e.g. event.payload.merchantId)
    const merchantId = event.payload.merchantId;
    if (!merchantId) {
      logger.warn('Skipping webhook dispatch: No merchantId in payload', { eventId: event.id });
      return;
    }

    // 2. Find merchant's registered webhooks
    const webhooks = await prisma.webhook.findMany({
      where: { merchantId, isActive: true },
    });

    if (webhooks.length === 0) {
      logger.debug(`No active webhooks found for merchant ${merchantId}`);
      return;
    }

    // 3. Dispatch to each URL (Simulated here)
    for (const wh of webhooks) {
      // Create WebhookEvent record in DB to track delivery
      const whEvent = await prisma.webhookEvent.create({
        data: {
          webhookId: wh.id,
          merchantId,
          eventType: event.eventType,
          payload: event.payload,
          status: 'PENDING',
        } as any,
      });

      try {
        // Simulate HTTP POST
        logger.info(`[SIMULATED HTTP POST] -> ${wh.url}`, { payload: event.payload });
        
        // 90% chance of success for simulation purposes
        const success = Math.random() > 0.1;
        
        if (!success) {
          throw new Error('Simulated network timeout');
        }

        // Update tracking to DELIVERED
        await prisma.webhookEvent.update({
          where: { id: whEvent.id },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date(),
            attempts: { increment: 1 },
            lastResponseCode: 200,
            lastResponseBody: 'OK',
          },
        });
      } catch (error: any) {
        logger.error(`Failed to dispatch webhook to ${wh.url}`, { error: error.message });
        
        await prisma.webhookEvent.update({
          where: { id: whEvent.id },
          data: {
            status: 'FAILED', // Or DEAD_LETTER if max attempts reached
            attempts: { increment: 1 },
            lastResponseCode: 500,
            lastResponseBody: error.message,
            nextRetryAt: new Date(Date.now() + 60000), // Retry in 1m (managed by another poller usually)
          },
        });

        // Throw error so BullMQ knows the job failed and will backoff/retry
        throw error;
      }
    }
  }, {
    connection: redisClient,
    concurrency: 5, // Process 5 webhooks concurrently
  });

  worker.on('failed', (job, err) => {
    logger.error(`Webhook Job ${job?.id} failed`, { error: err.message });
  });

  worker.on('completed', (job) => {
    logger.debug(`Webhook Job ${job.id} completed successfully`);
  });

  logger.info(`Webhook Worker listening on queue ${QUEUES.WEBHOOK_DISPATCH}`);
  return worker;
};
