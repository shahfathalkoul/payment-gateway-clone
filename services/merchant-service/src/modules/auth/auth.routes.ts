import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';
import { asyncHandler } from '@payment-gateway/shared-utils';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { merchantRateLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();

// Dependency Injection
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

// Validation Schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    businessName: z.string().min(2, 'Business name is required'),
    businessUrl: z.string().url().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post(
  '/register',
  merchantRateLimiter,
  validateRequest(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  merchantRateLimiter,
  validateRequest(loginSchema),
  asyncHandler(authController.login)
);

export default router;
