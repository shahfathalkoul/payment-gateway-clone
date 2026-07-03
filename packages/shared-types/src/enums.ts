/**
 * @module enums
 * @description Canonical enumeration types used across all payment gateway services.
 * Every service should reference these enums rather than defining ad-hoc string literals
 * to ensure type-safe, consistent status tracking throughout the system.
 */

/**
 * Lifecycle status of a payment from creation through final settlement or failure.
 *
 * Transitions follow a directed graph:
 * ```
 * CREATED → PENDING → AUTHORIZED → CAPTURED
 *                  ↘ FAILED        ↗ REFUNDED / PARTIALLY_REFUNDED
 *                  ↘ EXPIRED
 * ```
 */
export enum PaymentStatus {
  /** Payment record created but no processing has begun. */
  CREATED = 'created',
  /** Payment is being processed by the acquiring bank / gateway. */
  PENDING = 'pending',
  /** Funds have been authorized but not yet captured. */
  AUTHORIZED = 'authorized',
  /** Funds have been successfully captured from the customer's account. */
  CAPTURED = 'captured',
  /** Payment processing failed at any stage. */
  FAILED = 'failed',
  /** Payment expired before completion (e.g. customer abandoned checkout). */
  EXPIRED = 'expired',
  /** Full refund has been issued for this payment. */
  REFUNDED = 'refunded',
  /** A partial refund has been issued; remaining amount is still captured. */
  PARTIALLY_REFUNDED = 'partially_refunded',
}

/**
 * Supported payment method types.
 * Each method type may have its own sub-flow and required fields.
 */
export enum PaymentMethod {
  /** Credit or debit card payment. */
  CARD = 'card',
  /** Unified Payments Interface (India). */
  UPI = 'upi',
  /** Internet / net banking transfer. */
  NET_BANKING = 'net_banking',
  /** Digital wallet payment (e.g. Paytm, PhonePe). */
  WALLET = 'wallet',
}

/**
 * Card network brands supported for card-based payments.
 */
export enum CardNetwork {
  /** Visa card network. */
  VISA = 'visa',
  /** Mastercard network. */
  MASTERCARD = 'mastercard',
  /** American Express network. */
  AMEX = 'amex',
  /** RuPay network (India domestic). */
  RUPAY = 'rupay',
  /** Discover card network. */
  DISCOVER = 'discover',
}

/**
 * Direction of a ledger transaction entry.
 * Every payment operation produces at least one debit and one credit entry.
 */
export enum TransactionType {
  /** Money debited (outflow) from an account. */
  DEBIT = 'debit',
  /** Money credited (inflow) to an account. */
  CREDIT = 'credit',
}

/**
 * Lifecycle status of a refund request.
 */
export enum RefundStatus {
  /** Refund record created but not yet submitted to the bank. */
  CREATED = 'created',
  /** Refund submitted and awaiting bank confirmation. */
  PENDING = 'pending',
  /** Refund successfully processed; funds returned to customer. */
  PROCESSED = 'processed',
  /** Refund processing failed. */
  FAILED = 'failed',
}

/**
 * Whether a refund covers the full captured amount or only a portion.
 */
export enum RefundType {
  /** Refund for the entire captured payment amount. */
  FULL = 'full',
  /** Refund for less than the full captured amount. */
  PARTIAL = 'partial',
}

/**
 * Lifecycle status of a merchant settlement batch.
 * Settlements aggregate captured payments and disburse net amounts to merchants.
 */
export enum SettlementStatus {
  /** Settlement calculated but not yet initiated. */
  PENDING = 'pending',
  /** Settlement transfer is in progress. */
  PROCESSING = 'processing',
  /** Settlement funds have been disbursed to the merchant. */
  COMPLETED = 'completed',
  /** Settlement transfer failed; requires investigation. */
  FAILED = 'failed',
}

/**
 * Event types emitted via merchant webhook notifications.
 * Follows a `resource.action` naming convention.
 */
export enum WebhookEventType {
  /** Fired when a new payment is created. */
  PAYMENT_CREATED = 'payment.created',
  /** Fired when a payment is authorized by the issuing bank. */
  PAYMENT_AUTHORIZED = 'payment.authorized',
  /** Fired when authorized funds are captured. */
  PAYMENT_CAPTURED = 'payment.captured',
  /** Fired when a payment attempt fails. */
  PAYMENT_FAILED = 'payment.failed',
  /** Fired when a payment expires without completion. */
  PAYMENT_EXPIRED = 'payment.expired',
  /** Fired when a refund request is created. */
  REFUND_CREATED = 'refund.created',
  /** Fired when a refund is successfully processed. */
  REFUND_PROCESSED = 'refund.processed',
  /** Fired when a refund processing fails. */
  REFUND_FAILED = 'refund.failed',
  /** Fired when a settlement batch completes disbursement. */
  SETTLEMENT_COMPLETED = 'settlement.completed',
}

/**
 * Delivery status of an individual webhook event dispatch.
 * Failed deliveries are retried with exponential back-off up to `maxAttempts`.
 */
export enum WebhookDeliveryStatus {
  /** Delivery not yet attempted. */
  PENDING = 'pending',
  /** Webhook delivered and acknowledged (2xx response). */
  DELIVERED = 'delivered',
  /** Delivery attempt failed (non-2xx or timeout). */
  FAILED = 'failed',
  /** All retry attempts exhausted; event moved to dead-letter queue. */
  DEAD_LETTER = 'dead_letter',
}

/**
 * Onboarding and compliance status of a merchant account.
 */
export enum MerchantStatus {
  /** Merchant is fully verified and can process payments. */
  ACTIVE = 'active',
  /** Merchant account has been suspended (e.g. policy violation). */
  SUSPENDED = 'suspended',
  /** Merchant has registered but KYC / verification is incomplete. */
  PENDING_VERIFICATION = 'pending_verification',
}

/**
 * API key environment type.
 * Test keys operate against the sandbox; live keys operate against real banks.
 */
export enum ApiKeyType {
  /** Key for production / live environment. */
  LIVE = 'live',
  /** Key for sandbox / test environment. */
  TEST = 'test',
}

/**
 * Role assigned to an authenticated user within the system.
 */
export enum UserRole {
  /** A merchant user who manages payments and settlements. */
  MERCHANT = 'merchant',
  /** An internal administrator with elevated privileges. */
  ADMIN = 'admin',
}

/**
 * Standardised response codes returned by the acquiring bank or payment network.
 * These are mapped from raw bank-specific codes into a canonical set.
 */
export enum BankResponseCode {
  /** Transaction completed successfully. */
  SUCCESS = 'success',
  /** Transaction failed (generic). */
  FAILED = 'failed',
  /** Transaction is pending async confirmation. */
  PENDING = 'pending',
  /** Bank did not respond within the allowed time window. */
  TIMEOUT = 'timeout',
  /** Customer's account has insufficient funds. */
  INSUFFICIENT_BALANCE = 'insufficient_balance',
  /** Communication error between gateway and bank. */
  NETWORK_ERROR = 'network_error',
  /** Card number is invalid or unrecognised. */
  INVALID_CARD = 'invalid_card',
  /** Card has passed its expiration date. */
  EXPIRED_CARD = 'expired_card',
  /** Transaction was declined by the issuing bank. */
  DECLINED = 'declined',
}

/**
 * Actions tracked in the system-wide audit log.
 * Every state-changing operation should emit an audit entry with one of these actions.
 */
export enum AuditAction {
  /** A new entity was created. */
  CREATE = 'create',
  /** An existing entity was modified. */
  UPDATE = 'update',
  /** An entity was soft- or hard-deleted. */
  DELETE = 'delete',
  /** A user authenticated successfully. */
  LOGIN = 'login',
  /** A user ended their session. */
  LOGOUT = 'logout',
  /** A new API key was generated for a merchant. */
  API_KEY_GENERATED = 'api_key_generated',
  /** An existing API key was rotated (old key invalidated). */
  API_KEY_ROTATED = 'api_key_rotated',
  /** A new payment was created via the API. */
  PAYMENT_CREATED = 'payment_created',
  /** A payment was captured (funds collected). */
  PAYMENT_CAPTURED = 'payment_captured',
  /** A refund was initiated by the merchant. */
  REFUND_INITIATED = 'refund_initiated',
  /** A settlement batch was completed and disbursed. */
  SETTLEMENT_COMPLETED = 'settlement_completed',
}
