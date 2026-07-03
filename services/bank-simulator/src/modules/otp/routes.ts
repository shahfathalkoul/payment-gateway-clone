import { Router } from 'express';
import { generateOtp, verifyOtp } from './controller';
import { simulationMiddleware } from '../../middleware/simulation.middleware';

const router = Router();

// Apply simulation middleware for latency and basic outcomes, 
// though OTP usually has its own specific errors, standard network errors apply
router.use(simulationMiddleware);

router.post('/generate', generateOtp);
router.post('/verify', verifyOtp);

export { router as otpRouter };
