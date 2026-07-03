import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@payment-gateway/shared-utils';
import { requireApiKey } from '../../middleware/api-key.middleware';
import { idempotencyMiddleware } from '../../middleware/idempotency.middleware';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';

// Note: validation.middleware wasn't explicitly implemented in payment-gateway yet, 
// so we will create a lightweight one locally or rely on Zod parsing inside the controller. 
// For production, we should import validation middleware.

// A quick validation middleware wrapper
const validateBody = (schema: z.ZodTypeAny) => {
  return (req: any, _res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      next(e); // Let error middleware catch ZodError
    }
  };
};

const createPaymentSchema = z.object({
  amount: z.number().int().positive('Amount must be positive in smallest currency unit'),
  currency: z.string().length(3).optional().default('INR'),
  description: z.string().optional(),
  orderId: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

const capturePaymentSchema = z.object({
  amount: z.number().int().positive().optional(),
});

const router = Router();

const repo = new PaymentsRepository();
const service = new PaymentsService(repo);
const controller = new PaymentsController(service);

router.use(requireApiKey); // All routes require API Key

router.post(
  '/',
  idempotencyMiddleware, // Protect payment creation with idempotency
  validateBody(createPaymentSchema),
  asyncHandler(controller.createPayment)
);

router.get(
  '/:id',
  asyncHandler(controller.getPayment)
);

router.post(
  '/:id/capture',
  idempotencyMiddleware,
  validateBody(capturePaymentSchema),
  asyncHandler(controller.capturePayment)
);

export default router;
