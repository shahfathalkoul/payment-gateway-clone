import { createLogger } from '@payment-gateway/shared-utils';
import { OutboxService } from './modules/outbox/outbox.service';
import { startWebhookWorker } from './modules/outbox/outbox.worker';

const logger = createLogger({ service: 'payment-gateway-worker' });

export const startWorker = async () => {
  logger.info('Starting BullMQ Workers and Outbox Poller...');
  
  // 1. Start BullMQ Workers
  startWebhookWorker();

  // 2. Start Poller
  const outboxService = new OutboxService();
  outboxService.startPolling(2000); // Poll every 2s
};
