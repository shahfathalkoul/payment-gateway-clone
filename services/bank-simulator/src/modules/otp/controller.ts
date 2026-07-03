import { Request, Response } from 'express';
import { generateRequestId } from '@payment-gateway/shared-utils';

// Simple in-memory store for OTPs for simulation purposes
const otpStore = new Map<string, string>();

export const generateOtp = (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, error: { message: 'Identifier is required' } });
  }

  const transactionId = generateRequestId();
  const mockOtp = '123456'; // We use a hardcoded OTP for simulation testing ease
  otpStore.set(transactionId, mockOtp);

  res.status(200).json({
    success: true,
    data: {
      transactionId,
      message: 'OTP sent successfully (mock: 123456)',
    },
  });
};

export const verifyOtp = (req: Request, res: Response) => {
  const { transactionId, otp } = req.body;
  
  if (!transactionId || !otp) {
    return res.status(400).json({ success: false, error: { message: 'transactionId and otp are required' } });
  }

  const storedOtp = otpStore.get(transactionId);
  
  if (!storedOtp) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_TRANSACTION', message: 'Transaction ID not found or expired' } });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_OTP', message: 'The provided OTP is incorrect' } });
  }

  // Clear OTP after successful verification
  otpStore.delete(transactionId);

  res.status(200).json({
    success: true,
    data: {
      verified: true,
      message: 'OTP verified successfully',
    },
  });
};
