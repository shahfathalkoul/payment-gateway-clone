import { Request, Response } from 'express';
import { generateRequestId } from '@payment-gateway/shared-utils';

const generateAcquirerReference = () => `ARN${Date.now()}${Math.floor(Math.random() * 1000)}`;

const handleSimulatedOutcome = (req: Request, res: Response, paymentMethod: string) => {
  const outcome = (req as any).simulatedOutcome || 'SUCCESS';
  const amount = req.body.amount || 0;
  
  // Base response structure
  const baseResponse = {
    success: true, // HTTP success
    data: {
      transactionId: generateRequestId(),
      acquirerReference: generateAcquirerReference(),
      amount,
      currency: req.body.currency || 'INR',
      paymentMethod,
    },
  };

  switch (outcome) {
    case 'SUCCESS':
      return res.status(200).json({
        ...baseResponse,
        data: { ...baseResponse.data, status: 'SUCCESS' },
      });
    case 'FAILURE':
      return res.status(200).json({
        ...baseResponse,
        data: { ...baseResponse.data, status: 'FAILURE', errorCode: 'PAYMENT_FAILED', errorMessage: 'Transaction declined by issuer' },
      });
    case 'PENDING':
      return res.status(200).json({
        ...baseResponse,
        data: { ...baseResponse.data, status: 'PENDING' },
      });
    case 'INSUFFICIENT_BALANCE':
      return res.status(200).json({
        ...baseResponse,
        data: { ...baseResponse.data, status: 'FAILURE', errorCode: 'INSUFFICIENT_BALANCE', errorMessage: 'Insufficient funds in account' },
      });
    case 'DUPLICATE_TRANSACTION':
      return res.status(200).json({
        ...baseResponse,
        data: { ...baseResponse.data, status: 'FAILURE', errorCode: 'DUPLICATE_TRANSACTION', errorMessage: 'Duplicate transaction detected' },
      });
    default:
      // Fallback for success
      return res.status(200).json({
        ...baseResponse,
        data: { ...baseResponse.data, status: 'SUCCESS' },
      });
  }
};

export const acquireCard = (req: Request, res: Response) => {
  handleSimulatedOutcome(req, res, 'CARD');
};

export const acquireUpi = (req: Request, res: Response) => {
  handleSimulatedOutcome(req, res, 'UPI');
};

export const acquireWallet = (req: Request, res: Response) => {
  handleSimulatedOutcome(req, res, 'WALLET');
};

export const acquireNetBanking = (req: Request, res: Response) => {
  handleSimulatedOutcome(req, res, 'NET_BANKING');
};
