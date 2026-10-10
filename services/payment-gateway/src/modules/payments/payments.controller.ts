import { Request, Response } from 'express';
import { PaymentsService, CapturePaymentDTO } from './payments.service';
import { successResponse, getContext } from '@payment-gateway/shared-utils';
import { CreatePaymentDTO } from '@payment-gateway/shared-types';

export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  createPayment = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId;
    const dto: CreatePaymentDTO = req.body;
    const idempotencyKey = req.headers['idempotency-key'] as string;
    
    const payment = await this.service.createPayment(merchantId, dto, idempotencyKey);
    
    const requestId = getContext().requestId || 'req_unknown';
    
    // Set header to indicate if this was a replay
    if (payment._isReplay) {
      res.setHeader('x-idempotency-replay', 'true');
    }
    
    res.status(201).json(successResponse(payment, requestId));
  };

  listPayments = async (req: Request, res: Response) => {
    const merchantId = req.user!.merchantId;
    const payments = await this.service.listPayments(merchantId);
    
    const requestId = getContext().requestId || 'req_unknown';
    res.status(200).json(successResponse(payments, requestId));
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
