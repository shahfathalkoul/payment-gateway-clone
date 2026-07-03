import { prisma } from '../../config/prisma';
import { webhookQueue } from '../../config/queues';
import { createLogger } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'outbox-poller' });

export class OutboxService {
  private isPolling = false;
  private intervalId?: NodeJS.Timeout;

  startPolling(intervalMs: number = 2000) {
    if (this.intervalId) return;

    logger.info(`Starting Outbox Poller (interval: ${intervalMs}ms)`);
    this.intervalId = setInterval(() => this.poll(), intervalMs);
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Stopped Outbox Poller');
    }
  }

  private async poll() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      // 1. Fetch unpublished events (limit 50 to prevent memory bloat)
      const events = await prisma.outboxEvent.findMany({
        where: { isProcessed: false },
        take: 50,
        orderBy: { createdAt: 'asc' },
      });

      if (events.length === 0) {
        this.isPolling = false;
        return;
      }

      logger.debug(`Found ${events.length} outbox events to publish`);

      // 2. Publish each event to BullMQ and mark as processed in a transaction
      for (const event of events) {
        await prisma.$transaction(async (tx: any) => {
          // Push to BullMQ
          await webhookQueue.add('dispatch-webhook', event, {
            jobId: `outbox-${event.id}`, // Deduplication at BullMQ level
          });

          // Mark processed
          await tx.outboxEvent.update({
            where: { id: event.id },
            data: { 
              isProcessed: true,
              processedAt: new Date()
            },
          });
        });
      }
    } catch (error: any) {
      logger.error('Error polling outbox events', { error: error.message });
    } finally {
      this.isPolling = false;
    }
  }
}
