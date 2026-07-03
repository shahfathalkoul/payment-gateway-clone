import { Request, Response } from 'express';
import { ApiKeysService } from './api-keys.service';
import { successResponse, getContext } from '@payment-gateway/shared-utils';

export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  createApiKey = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId!;
    const { mode, name } = req.body;
    
    const result = await this.apiKeysService.createApiKey(merchantId, mode, name);
    const requestId = getContext().requestId || 'req_unknown';
    
    res.status(201).json(successResponse(result, requestId));
  };

  listApiKeys = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId!;
    const keys = await this.apiKeysService.getApiKeys(merchantId);
    const requestId = getContext().requestId || 'req_unknown';
    
    res.status(200).json(successResponse(keys, requestId));
  };

  revokeApiKey = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId!;
    const { id } = req.params;
    
    await this.apiKeysService.revokeApiKey(merchantId, id);
    const requestId = getContext().requestId || 'req_unknown';
    
    res.status(200).json(successResponse({ success: true }, requestId));
  };
}
