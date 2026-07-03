import { settlementQueue } from './queue';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'settlement-scheduler' });

export const setupScheduler = async () => {
  // Clear any existing repeatable jobs to avoid duplicates if schedule changes
  const repeatableJobs = await settlementQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await settlementQueue.removeRepeatableByKey(job.key);
  }

  // Schedule the daily settlement process at 2 AM UTC every day
  await settlementQueue.add(
    'process-daily-settlements',
    {},
    {
      repeat: {
        pattern: '0 2 * * *',
      },
    }
  );

  logger.info('Settlement scheduler initialized');
};
