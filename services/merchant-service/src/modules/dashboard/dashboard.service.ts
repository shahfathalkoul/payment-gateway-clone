import { DashboardRepository } from './dashboard.repository';
import { NotFoundError } from '@payment-gateway/shared-utils';

export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

  async getProfile(merchantId: string) {
    const profile = await this.dashboardRepo.getMerchantProfile(merchantId);
    if (!profile) {
      throw new NotFoundError('Merchant', merchantId);
    }
    return profile;
  }

  async getAnalytics(merchantId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [revenue, statuses, recentSettlements] = await Promise.all([
      this.dashboardRepo.getRevenueAnalytics(merchantId, startDate, endDate),
      this.dashboardRepo.getPaymentStatusAnalytics(merchantId, startDate, endDate),
      this.dashboardRepo.getRecentSettlements(merchantId),
    ]);

    return {
      period: { startDate, endDate },
      revenue,
      paymentStatuses: statuses,
      recentSettlements,
    };
  }
}
