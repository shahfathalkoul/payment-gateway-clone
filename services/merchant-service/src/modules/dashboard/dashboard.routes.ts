import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { asyncHandler } from '@payment-gateway/shared-utils';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';

const router = Router();

const updateProfileSchema = z.object({
  body: z.object({
    businessName: z.string().trim().min(2).optional(),
    businessUrl: z.union([z.string().trim().url(), z.literal(''), z.null()]).optional(),
    webhookUrl: z.union([z.string().trim().url(), z.literal(''), z.null()]).optional(),
    webhookSecret: z.union([z.string().trim().min(8), z.literal(''), z.null()]).optional(),
  }),
});

// DI
const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

router.use(requireAuth); // All dashboard ops require auth

router.get('/profile', asyncHandler(dashboardController.getProfile));
router.put('/profile', validateRequest(updateProfileSchema), asyncHandler(dashboardController.updateProfile));
router.get('/analytics', asyncHandler(dashboardController.getAnalytics));

export default router;
