import { prisma } from '../../config/prisma';
import { Payment, Prisma, PaymentStatus, WebhookEventType } from '@payment-gateway/database';
import { generateUUID } from '@payment-gateway/shared-utils';

export class PaymentsRepository {
  /**
   * Creates a payment and records an outbox event in a single transaction.
   */
  async createPaymentWithEvent(
    data: Prisma.PaymentUncheckedCreateInput,
    eventType: WebhookEventType
  ): Promise<Payment> {
    return prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.create({
        data,
      });

      // Outbox Pattern: Save event to be published by worker
      await tx.outboxEvent.create({
        data: {
          id: generateUUID(),
          aggregateType: 'PAYMENT',
          aggregateId: payment.id,
          eventType,
          payload: payment, // Snapshot of the payment
        },
      });

      return payment;
    });
  }

  async findPaymentByIdAndMerchant(id: string, merchantId: string): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: { id, merchantId },
    });
  }

  async findPaymentsByMerchant(merchantId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async updatePaymentStatus(
    id: string,
    merchantId: string,
    status: PaymentStatus,
    eventType: WebhookEventType,
    additionalData?: Prisma.PaymentUncheckedUpdateInput
  ): Promise<Payment> {
    return prisma.$transaction(async (tx: any) => {
      // 1. Update Payment
      const payment = await tx.payment.update({
        where: { id },
        data: {
          status,
          ...additionalData,
        },
      });

      // 2. Publish outbox event
      await tx.outboxEvent.create({
        data: {
          id: generateUUID(),
          aggregateType: 'PAYMENT',
          aggregateId: payment.id,
          eventType,
          payload: payment,
        },
      });

      return payment;
    });
  }
}
