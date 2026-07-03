import { PaymentsRepository } from './payments.repository';
import { BaseError, generateUUID } from '@payment-gateway/shared-utils';
import { CreatePaymentDTO } from '@payment-gateway/shared-types';

export type CapturePaymentDTO = { amount?: number };

export class PaymentStateError extends BaseError {
  constructor(current: string, intended: string) {
    super('PAYMENT_STATE_ERROR', `Cannot transition payment from ${current} to ${intended}`, 400);
  }
}

export class PaymentsService {
  constructor(private readonly repo: PaymentsRepository) {}

  async createPayment(merchantId: string, dto: CreatePaymentDTO) {
    const paymentId = `pay_${generateUUID().replace(/-/g, '').slice(0, 16)}`;
    
    const payment = await this.repo.createPaymentWithEvent(
      {
        id: paymentId,
        merchantId,
        amount: dto.amount,
        currency: dto.currency || 'INR',
        description: dto.description,
        orderId: dto.orderId,
        status: 'CREATED',
        customer: dto.customerId ? {
          connect: { id: dto.customerId }
        } : undefined,
      } as any, // Using any for relation shorthand; in prod, structure strictly
      'PAYMENT_CREATED'
    );

    return payment;
  }

  async getPayment(id: string, merchantId: string) {
    const payment = await this.repo.findPaymentByIdAndMerchant(id, merchantId);
    if (!payment) {
      throw new BaseError('NOT_FOUND', 'Payment not found', 404);
    }
    return payment;
  }

  async capturePayment(id: string, merchantId: string, dto: CapturePaymentDTO) {
    const payment = await this.getPayment(id, merchantId);

    // Only AUTHORIZED or CREATED (if auto-capture simulated) can be captured
    if (payment.status !== 'AUTHORIZED' && payment.status !== 'CREATED') {
      throw new PaymentStateError(payment.status, 'CAPTURED');
    }

    if (dto.amount && dto.amount > payment.amount) {
      throw new BaseError('VALIDATION_ERROR', 'Capture amount cannot exceed payment amount', 400);
    }

    const captureAmount = dto.amount || payment.amount;

    return this.repo.updatePaymentStatus(
      id,
      merchantId,
      'CAPTURED',
      'PAYMENT_CAPTURED',
      { capturedAt: new Date() } // Should realistically update balance via ledger
    );
  }

  async failPayment(id: string, merchantId: string) {
    const payment = await this.getPayment(id, merchantId);
    
    if (payment.status === 'CAPTURED' || payment.status === 'REFUNDED') {
      throw new PaymentStateError(payment.status, 'FAILED');
    }

    return this.repo.updatePaymentStatus(id, merchantId, 'FAILED', 'PAYMENT_FAILED');
  }
}
