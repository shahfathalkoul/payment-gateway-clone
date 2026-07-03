import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { asyncHandler } from '@payment-gateway/shared-utils';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysRepository } from './api-keys.repository';

const router = Router();

// DI
const apiKeysRepository = new ApiKeysRepository();
const apiKeysService = new ApiKeysService(apiKeysRepository);
const apiKeysController = new ApiKeysController(apiKeysService);

// Validation
const createKeySchema = z.object({
  body: z.object({
    mode: z.enum(['test', 'live']),
    name: z.string().optional(),
  }),
});

router.use(requireAuth); // All API key operations require merchant auth

router.post(
  '/',
  validateRequest(createKeySchema),
  asyncHandler(apiKeysController.createApiKey)
);

router.get(
  '/',
  asyncHandler(apiKeysController.listApiKeys)
);

router.post(
  '/:id/revoke',
  asyncHandler(apiKeysController.revokeApiKey)
);

export default router;
