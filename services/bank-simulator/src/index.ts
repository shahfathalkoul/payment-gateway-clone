import 'dotenv/config';
import { app } from './server';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'bank-simulator' });
const PORT = process.env.PORT || 3003;

const start = async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`Bank Simulator Server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Bank Simulator', { error });
    process.exit(1);
  }
};

start();
