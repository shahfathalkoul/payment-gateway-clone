import { PrismaClient, Prisma, Settlement, Transaction, Merchant, Payment } from '@payment-gateway/database';

const prisma = new PrismaClient();

export class SettlementRepository {
  async getActiveMerchants(): Promise<Merchant[]> {
    return prisma.merchant.findMany({
      where: { isActive: true },
    });
  }

  async getCapturedPaymentsForMerchant(merchantId: string, periodStart: Date, periodEnd: Date): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: {
        merchantId,
        status: 'CAPTURED',
        capturedAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });
  }

  async executeSettlementTransaction(data: {
    merchantId: string;
    grossAmount: number;
    gatewayFee: number;
    gst: number;
    netAmount: number;
    transactionCount: number;
    periodStart: Date;
    periodEnd: Date;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Settlement Record
      const settlementId = `stl_${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
      const settlement = await tx.settlement.create({
        data: {
          id: settlementId,
          merchantId: data.merchantId,
          grossAmount: data.grossAmount,
          gatewayFee: data.gatewayFee,
          gst: data.gst,
          netAmount: data.netAmount,
          transactionCount: data.transactionCount,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          status: 'COMPLETED',
          settledAt: new Date(),
        },
      });

      // 2. Fetch current balance
      const balance = await tx.balance.findUnique({
        where: { merchantId: data.merchantId },
      });

      if (!balance) {
        throw new Error(`Balance not found for merchant ${data.merchantId}`);
      }

      // 3. Create Transaction Ledger Entry (CREDIT to Merchant)
      const newAvailable = balance.available + data.netAmount;
      // We assume pending balance is decreased by grossAmount since payments were captured
      const newPending = Math.max(0, balance.pending - data.grossAmount);

      await tx.transaction.create({
        data: {
          merchantId: data.merchantId,
          settlementId: settlement.id,
          type: 'CREDIT',
          amount: data.netAmount,
          balanceAfter: newAvailable,
          description: `Settlement for period ${data.periodStart.toISOString()} to ${data.periodEnd.toISOString()}`,
        },
      });

      // 4. Create Transaction Ledger Entry (DEBIT for Fees)
      await tx.transaction.create({
        data: {
          merchantId: data.merchantId,
          settlementId: settlement.id,
          type: 'DEBIT',
          amount: data.gatewayFee + data.gst,
          balanceAfter: newAvailable, // The balanceAfter represents the merchant's balance after the whole settlement, or we can sequence it.
          description: 'Gateway Fee & GST Deduction',
        },
      });

      // 5. Update Merchant Balance
      await tx.balance.update({
        where: { merchantId: data.merchantId, version: balance.version },
        data: {
          available: newAvailable,
          pending: newPending,
          version: { increment: 1 },
        },
      });

      return settlement;
    });
  }

  async getSettlementHistory(merchantId: string, limit: number = 20, offset: number = 0): Promise<Settlement[]> {
    return prisma.settlement.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}
