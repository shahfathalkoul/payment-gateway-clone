import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { successResponse, getContext } from '@payment-gateway/shared-utils';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getProfile = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId!;
    const profile = await this.dashboardService.getProfile(merchantId);
    const requestId = getContext().requestId || 'req_unknown';
    
    res.status(200).json(successResponse(profile, requestId));
  };

  getAnalytics = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId!;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    
    const analytics = await this.dashboardService.getAnalytics(merchantId, days);
    const requestId = getContext().requestId || 'req_unknown';
    
    res.status(200).json(successResponse(analytics, requestId));
  };
}
