import { Request, Response } from 'express';
import { PaymentsService, CapturePaymentDTO } from './payments.service';
import { successResponse, getContext } from '@payment-gateway/shared-utils';
import { CreatePaymentDTO } from '@payment-gateway/shared-types';

export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  createPayment = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId;
    const dto: CreatePaymentDTO = req.body;
    
    const payment = await this.service.createPayment(merchantId, dto);
    
    const requestId = getContext().requestId || 'req_unknown';
    res.status(201).json(successResponse(payment, requestId));
  };

  getPayment = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId;
    const { id } = req.params;
    
    const payment = await this.service.getPayment(id, merchantId);
    
    const requestId = getContext().requestId || 'req_unknown';
    res.status(200).json(successResponse(payment, requestId));
  };

  capturePayment = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId;
    const { id } = req.params;
    const dto: CapturePaymentDTO = req.body;
    
    const payment = await this.service.capturePayment(id, merchantId, dto);
    
    const requestId = getContext().requestId || 'req_unknown';
    res.status(200).json(successResponse(payment, requestId));
  };
}
