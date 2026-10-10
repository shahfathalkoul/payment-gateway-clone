import { DashboardRepository } from './dashboard.repository';
import { NotFoundError, ValidationError } from '@payment-gateway/shared-utils';

export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

  async getProfile(merchantId: string) {
    const profile = await this.dashboardRepo.getMerchantProfile(merchantId);
    if (!profile) {
      throw new NotFoundError('Merchant', merchantId);
    }
    return profile;
  }

  async updateProfile(merchantId: string, data: {
    businessName?: string;
    businessUrl?: string | null;
    webhookUrl?: string | null;
    webhookSecret?: string | null;
  }) {
    const updates: Record<string, string | null> = {};

    if (data.businessName !== undefined) {
      const businessName = data.businessName.trim();
      if (!businessName) {
        throw new ValidationError('Business name is required');
      }
      updates.businessName = businessName;
    }

    if (data.businessUrl !== undefined) {
      const businessUrl = data.businessUrl?.trim();
      updates.businessUrl = businessUrl ? businessUrl : null;
    }

    if (data.webhookUrl !== undefined) {
      const webhookUrl = data.webhookUrl?.trim();
      updates.webhookUrl = webhookUrl ? webhookUrl : null;
    }

    if (data.webhookSecret !== undefined) {
      const webhookSecret = data.webhookSecret?.trim();
      updates.webhookSecret = webhookSecret ? webhookSecret : null;
    }

    const profile = await this.dashboardRepo.updateMerchantProfile(merchantId, updates);
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
