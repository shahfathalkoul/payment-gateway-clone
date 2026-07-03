/**
 * @module @payment-gateway/shared-types
 * @description Public barrel export for all shared type definitions.
 * Consumer packages should import exclusively from this entry point:
 *
 * ```typescript
 * import { PaymentStatus, IPayment, CreatePaymentDTO, ApiResponse } from '@payment-gateway/shared-types';
 * ```
 */

export * from './enums';
export * from './interfaces';
export * from './dto';
export * from './api';
