import { createLogger } from '@payment-gateway/shared-utils';
import { app } from './server';
import { worker } from './jobs/worker';
import { setupScheduler } from './jobs/scheduler';

const logger = createLogger({ service: 'settlement-service-main' });
const port = process.env.PORT || 3004;

const startServer = async () => {
  try {
    // Start BullMQ Scheduler
    await setupScheduler();

    app.listen(port, () => {
      logger.info(`Settlement Service is running on port ${port}`);
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      await worker.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      await worker.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start Settlement Service', { error });
    process.exit(1);
  }
};

startServer();
