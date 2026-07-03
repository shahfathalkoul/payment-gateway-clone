import { Router } from 'express';
import { getSettlements, triggerManualSettlement } from './controller';

const router = Router();

router.get('/', getSettlements);
router.post('/trigger', triggerManualSettlement);

export { router as settlementRouter };
