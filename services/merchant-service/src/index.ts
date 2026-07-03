import { app } from './server';
import { createLogger, initDefaultMetrics } from '@payment-gateway/shared-utils';
import { prisma } from './config/prisma';

const logger = createLogger({ service: 'merchant-service' });
const PORT = process.env.PORT || 3001;

async function bootstrap() {
  try {
    // Initialize Prometheus default metrics
    initDefaultMetrics('merchant_service_');

    // Test DB connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');

    app.listen(PORT, () => {
      logger.info(`Merchant Service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { error: err });
  process.exit(1);
});

bootstrap();
