import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { asyncHandler } from '@payment-gateway/shared-utils';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';

const router = Router();

// DI
const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

router.use(requireAuth); // All dashboard ops require auth

router.get('/profile', asyncHandler(dashboardController.getProfile));
router.get('/analytics', asyncHandler(dashboardController.getAnalytics));

export default router;
