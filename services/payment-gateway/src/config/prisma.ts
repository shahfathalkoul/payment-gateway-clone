import { PrismaClient } from '@payment-gateway/database';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'prisma-client' });

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error', { message: e.message });
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning', { message: e.message });
});
