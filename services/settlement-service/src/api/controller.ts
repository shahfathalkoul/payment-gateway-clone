import { Request, Response } from 'express';
import { SettlementService } from '../services/settlement.service';
import { settlementQueue } from '../jobs/queue';

const settlementService = new SettlementService();

export const getSettlements = async (req: Request, res: Response) => {
  try {
    const merchantId = req.headers['x-merchant-id'] as string;
    
    if (!merchantId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized. Merchant ID missing.' } });
    }

    const limit = parseInt((req.query.limit as string) || '20', 10);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    const settlements = await settlementService.getSettlementHistory(merchantId, limit, offset);

    return res.status(200).json({
      success: true,
      data: settlements,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const triggerManualSettlement = async (req: Request, res: Response) => {
  try {
    // Admin only or internal route ideally
    await settlementService.processDailySettlements();
    return res.status(200).json({ success: true, message: 'Settlement process triggered.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};
