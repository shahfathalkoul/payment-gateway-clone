import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { SETTLEMENT_QUEUE_NAME } from './queue';
import { SettlementService } from '../services/settlement.service';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'settlement-worker' });
const settlementService = new SettlementService();

export const worker = new Worker(
  SETTLEMENT_QUEUE_NAME,
  async (job: Job) => {
    switch (job.name) {
      case 'process-daily-settlements':
        await settlementService.processDailySettlements();
        break;
      case 'process-merchant-settlement':
        await settlementService.processMerchantSettlement(job.data);
        break;
      default:
        logger.warn(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} of type ${job.name} completed successfully`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} of type ${job?.name} failed`, { error: err.message });
});
