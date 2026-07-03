import { Router } from 'express';
import { acquireCard, acquireUpi, acquireWallet, acquireNetBanking } from './controller';
import { simulationMiddleware } from '../../middleware/simulation.middleware';
import { circuitBreakerMiddleware } from '../../middleware/circuit-breaker.middleware';

const router = Router();

// Apply simulation middlewares to all acquire routes
router.use(simulationMiddleware);
router.use(circuitBreakerMiddleware);

router.post('/card', acquireCard);
router.post('/upi', acquireUpi);
router.post('/wallet', acquireWallet);
router.post('/netbanking', acquireNetBanking);

export { router as acquireRouter };
