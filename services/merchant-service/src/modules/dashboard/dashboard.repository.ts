import { prisma } from '../../config/prisma';
import { Merchant, Balance } from '@payment-gateway/database';

export class DashboardRepository {
  async getMerchantProfile(merchantId: string): Promise<(Merchant & { balance: Balance | null }) | null> {
    return prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { balance: true },
    });
  }

  async getRevenueAnalytics(merchantId: string, startDate: Date, endDate: Date) {
    // Aggregate captured payments within date range
    const result = await prisma.payment.aggregate({
      where: {
        merchantId,
        status: 'CAPTURED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalRevenue: result._sum.amount || 0,
      paymentCount: result._count.id || 0,
    };
  }

  async getPaymentStatusAnalytics(merchantId: string, startDate: Date, endDate: Date) {
    const statuses = await prisma.payment.groupBy({
      by: ['status'],
      where: {
        merchantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    return statuses.map((s: any) => ({ status: s.status, count: s._count.id }));
  }

  async getRecentSettlements(merchantId: string, limit: number = 10) {
    return prisma.settlement.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
