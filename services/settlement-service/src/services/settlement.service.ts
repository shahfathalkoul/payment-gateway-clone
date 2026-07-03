import { createLogger } from '@payment-gateway/shared-utils';
import { SettlementRepository } from '../repositories/settlement.repository';
import { settlementQueue } from '../jobs/queue';
import { Merchant } from '@payment-gateway/database';

const logger = createLogger({ service: 'settlement-service' });
const repository = new SettlementRepository();

export class SettlementService {
  /**
   * Triggers the daily settlement process. 
   * Fetches all merchants and enqueues a settlement job for each.
   */
  async processDailySettlements() {
    logger.info('Starting daily settlement process');
    try {
      const merchants = await repository.getActiveMerchants();
      
      const periodEnd = new Date();
      // Settling for the last 24 hours
      const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000);

      for (const merchant of merchants) {
        await settlementQueue.add('process-merchant-settlement', {
          merchantId: merchant.id,
          feePercentage: Number(merchant.feePercentage),
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
        });
      }

      logger.info(`Enqueued settlement jobs for ${merchants.length} merchants`);
    } catch (error) {
      logger.error('Failed to process daily settlements', { error });
      throw error;
    }
  }

  /**
   * Processes settlement for a single merchant for a specific time period.
   */
  async processMerchantSettlement(data: { merchantId: string; feePercentage: number; periodStart: string; periodEnd: string }) {
    const { merchantId, feePercentage, periodStart, periodEnd } = data;
    logger.info(`Processing settlement for merchant ${merchantId}`);

    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    try {
      const payments = await repository.getCapturedPaymentsForMerchant(merchantId, start, end);

      if (payments.length === 0) {
        logger.info(`No captured payments found for merchant ${merchantId} in this period.`);
        return;
      }

      const grossAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const transactionCount = payments.length;

      // Gateway Fee (e.g. 2%)
      const gatewayFee = Math.round(grossAmount * (feePercentage / 100));
      // GST (18% on fee)
      const gst = Math.round(gatewayFee * 0.18);
      // Net Settlement
      const netAmount = grossAmount - gatewayFee - gst;

      const settlement = await repository.executeSettlementTransaction({
        merchantId,
        grossAmount,
        gatewayFee,
        gst,
        netAmount,
        transactionCount,
        periodStart: start,
        periodEnd: end,
      });

      logger.info(`Successfully settled merchant ${merchantId}. Net Amount: ${netAmount}`, { settlementId: settlement.id });
      return settlement;
    } catch (error) {
      logger.error(`Failed to process settlement for merchant ${merchantId}`, { error });
      throw error;
    }
  }

  async getSettlementHistory(merchantId: string, limit: number = 20, offset: number = 0) {
    return repository.getSettlementHistory(merchantId, limit, offset);
  }
}
