import 'dotenv/config';
import { app } from './server';
import { startWorker } from './worker';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'payment-gateway' });
const PORT = process.env.PORT || 3002;

const start = async () => {
  try {
    // Start Express Server
    app.listen(PORT, () => {
      logger.info(`Payment Gateway Server listening on port ${PORT}`);
    });

    // Start Background Workers in the same process for simplicity
    // In a high-throughput production environment, this should be run in a separate container/process.
    if (process.env.DISABLE_WORKERS !== 'true') {
      await startWorker();
    }
  } catch (error) {
    logger.error('Failed to start Payment Gateway', { error });
    process.exit(1);
  }
};

start();
