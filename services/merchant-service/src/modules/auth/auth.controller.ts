import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { successResponse, getContext } from '@payment-gateway/shared-utils';
import { MerchantRegistrationDTO, LoginDTO } from '@payment-gateway/shared-types';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const data: MerchantRegistrationDTO = req.body;
    const result = await this.authService.register(data);
    const requestId = getContext().requestId || 'req_unknown';
    res.status(201).json(successResponse(result, requestId));
  };

  login = async (req: Request, res: Response) => {
    const data: LoginDTO = req.body;
    const tokens = await this.authService.login(data);
    const requestId = getContext().requestId || 'req_unknown';
    res.status(200).json(successResponse(tokens, requestId));
  };
}
