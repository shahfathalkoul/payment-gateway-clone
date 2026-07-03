/**
 * @module interfaces
 * @description Core domain entity interfaces for the payment gateway.
 * These interfaces represent the canonical shape of database records
 * and are consumed by repositories, services, and API serialisation layers.
 */

import {
  AuditAction,
  ApiKeyType,
  MerchantStatus,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  RefundType,
  SettlementStatus,
  TransactionType,
  WebhookDeliveryStatus,
  WebhookEventType,
} from './enums';

/**
 * Represents a registered merchant account on the platform.
 * Merchants are the primary tenants; all payments, settlements, and
 * API keys are scoped to a single merchant.
 */
export interface IMerchant {
  /** Unique merchant identifier (UUID v4). */
  id: string;
  /** Foreign key to the owning user account. */
  userId: string;
  /** Registered business / trading name. */
  businessName: string;
  /** Public website URL of the merchant, if provided. */
  businessUrl: string | null;
  /** URL to the merchant's logo image, if uploaded. */
  logoUrl: string | null;
  /** HTTPS endpoint that receives webhook event deliveries. */
  webhookUrl: string | null;
  /** HMAC secret used to sign outgoing webhook payloads. */
  webhookSecret: string | null;
  /** Current onboarding / compliance status of the merchant. */
  status: MerchantStatus;
  /** Platform fee percentage charged on each captured payment (e.g. 2.0 = 2%). */
  feePercentage: number;
  /** Timestamp when the merchant account was created. */
  createdAt: Date;
  /** Timestamp of the last update to the merchant record. */
  updatedAt: Date;
}

/**
 * Represents a single payment intent created by a merchant.
 * A payment may go through multiple attempts before reaching a terminal status.
 */
export interface IPayment {
  /** Unique payment identifier (UUID v4). */
  id: string;
  /** Foreign key to the merchant who initiated this payment. */
  merchantId: string;
  /** Optional customer identifier supplied by the merchant. */
  customerId: string | null;
  /** Merchant-supplied order reference for reconciliation. */
  orderId: string | null;
  /** Payment amount in the smallest currency unit (e.g. paise for INR). */
  amount: number;
  /** ISO 4217 currency code (e.g. 'INR', 'USD'). */
  currency: string;
  /** Current lifecycle status of the payment. */
  status: PaymentStatus;
  /** Payment method selected by the customer, if known. */
  method: PaymentMethod | null;
  /** Human-readable description of what the payment is for. */
  description: string | null;
  /** Arbitrary key-value metadata attached by the merchant. */
  metadata: Record<string, unknown>;
  /** Client-supplied idempotency key to prevent duplicate payments. */
  idempotencyKey: string | null;
  /** Internal notes associated with this payment. */
  notes: string | null;
  /** Optimistic concurrency version counter. */
  version: number;
  /** Timestamp when the payment was created. */
  createdAt: Date;
  /** Timestamp of the last update to the payment record. */
  updatedAt: Date;
}

/**
 * Records an individual attempt to process a payment through a bank or gateway.
 * Each payment may have multiple attempts (e.g. retries with different methods).
 */
export interface IPaymentAttempt {
  /** Unique attempt identifier (UUID v4). */
  id: string;
  /** Foreign key to the parent payment. */
  paymentId: string;
  /** Payment method used for this specific attempt. */
  method: PaymentMethod;
  /** Outcome status of this attempt. */
  status: PaymentStatus;
  /** Raw response payload returned by the acquiring bank / PSP. */
  gatewayResponse: Record<string, unknown> | null;
  /** Bank-assigned reference number for this transaction. */
  bankRef: string | null;
  /** Standardised error code if the attempt failed. */
  errorCode: string | null;
  /** Human-readable error description if the attempt failed. */
  errorMessage: string | null;
  /** Timestamp when this attempt was initiated. */
  createdAt: Date;
}

/**
 * Represents a refund issued against a previously captured payment.
 * Supports both full and partial refunds.
 */
export interface IRefund {
  /** Unique refund identifier (UUID v4). */
  id: string;
  /** Foreign key to the original payment being refunded. */
  paymentId: string;
  /** Foreign key to the merchant who owns the original payment. */
  merchantId: string;
  /** Refund amount in the smallest currency unit. */
  amount: number;
  /** Whether this is a full or partial refund. */
  type: RefundType;
  /** Current processing status of the refund. */
  status: RefundStatus;
  /** Merchant-supplied reason for the refund. */
  reason: string | null;
  /** Bank-assigned reference number for the refund transaction. */
  bankRef: string | null;
  /** Timestamp when the refund was created. */
  createdAt: Date;
  /** Timestamp of the last update to the refund record. */
  updatedAt: Date;
}

/**
 * Immutable ledger entry recording a financial movement.
 * Every captured payment and refund produces one or more transaction records.
 */
export interface ITransaction {
  /** Unique transaction identifier (UUID v4). */
  id: string;
  /** Foreign key to the related payment. */
  paymentId: string;
  /** Foreign key to the merchant. */
  merchantId: string;
  /** Whether this entry is a debit or credit. */
  type: TransactionType;
  /** Transaction amount in the smallest currency unit. */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Merchant's account balance after this transaction was applied. */
  balanceAfter: number;
  /** Human-readable description of the transaction. */
  description: string | null;
  /** Timestamp when the transaction was recorded. */
  createdAt: Date;
}

/**
 * Represents a settlement batch that aggregates captured payments
 * and disburses the net amount to a merchant's bank account.
 */
export interface ISettlement {
  /** Unique settlement identifier (UUID v4). */
  id: string;
  /** Foreign key to the merchant receiving the settlement. */
  merchantId: string;
  /** Total gross amount before fees (smallest currency unit). */
  grossAmount: number;
  /** Platform fee deducted from the gross amount. */
  gatewayFee: number;
  /** Goods and Services Tax levied on the gateway fee. */
  gst: number;
  /** Net amount disbursed to the merchant (gross − fee − GST). */
  netAmount: number;
  /** Current status of the settlement batch. */
  status: SettlementStatus;
  /** Number of individual transactions included in this settlement. */
  transactionCount: number;
  /** Start of the settlement aggregation period (inclusive). */
  periodStart: Date;
  /** End of the settlement aggregation period (exclusive). */
  periodEnd: Date;
  /** Timestamp when funds were actually disbursed, or null if not yet settled. */
  settledAt: Date | null;
  /** Timestamp when the settlement record was created. */
  createdAt: Date;
}

/**
 * Tracks an individual webhook event delivery to a merchant's endpoint.
 * Failed deliveries are retried with exponential back-off.
 */
export interface IWebhookEvent {
  /** Unique event identifier (UUID v4). */
  id: string;
  /** Foreign key to the webhook configuration. */
  webhookId: string;
  /** Foreign key to the target merchant. */
  merchantId: string;
  /** Type of event that triggered this webhook delivery. */
  eventType: WebhookEventType;
  /** JSON payload delivered to the merchant's webhook endpoint. */
  payload: Record<string, unknown>;
  /** Current delivery status (pending → delivered | failed → dead_letter). */
  status: WebhookDeliveryStatus;
  /** Number of delivery attempts made so far. */
  attempts: number;
  /** Maximum number of delivery attempts before moving to dead-letter. */
  maxAttempts: number;
  /** Timestamp of the most recent delivery attempt, if any. */
  lastAttemptAt: Date | null;
  /** Scheduled time for the next retry, or null if no retry is pending. */
  nextRetryAt: Date | null;
  /** Timestamp when the event was created. */
  createdAt: Date;
}

/**
 * Represents a merchant API key (public key + hashed secret).
 * Keys are scoped to either live or test environments.
 */
export interface IApiKey {
  /** Unique API key record identifier (UUID v4). */
  id: string;
  /** Foreign key to the merchant who owns this key. */
  merchantId: string;
  /** Non-secret prefix of the key for display purposes (e.g. 'rzp_live_'). */
  keyPrefix: string;
  /** Bcrypt / Argon2 hash of the full secret key. */
  keyHash: string;
  /** Whether this key targets live or test environment. */
  type: ApiKeyType;
  /** Human-readable label for the key (e.g. 'Production Key'). */
  label: string;
  /** Whether this key is currently active and usable. */
  isActive: boolean;
  /** Timestamp of the last API request authenticated with this key. */
  lastUsedAt: Date | null;
  /** Expiration timestamp, or null for non-expiring keys. */
  expiresAt: Date | null;
  /** Timestamp when the key was created. */
  createdAt: Date;
}

/**
 * Immutable audit log entry capturing a significant system action.
 * Used for compliance, debugging, and security forensics.
 */
export interface IAuditLog {
  /** Unique audit log entry identifier (UUID v4). */
  id: string;
  /** Type of entity affected (e.g. 'payment', 'merchant', 'api_key'). */
  entityType: string;
  /** Identifier of the affected entity. */
  entityId: string;
  /** The action that was performed. */
  action: AuditAction;
  /** Identifier of the user or system actor who performed the action. */
  actorId: string;
  /** Before/after snapshot of changed fields. */
  changes: Record<string, unknown>;
  /** IP address of the actor at the time of the action. */
  ipAddress: string | null;
  /** User-Agent header of the actor's HTTP request. */
  userAgent: string | null;
  /** Timestamp when the action occurred. */
  createdAt: Date;
}

/**
 * Real-time balance snapshot for a merchant account.
 * Updated transactionally with every payment capture, refund, and settlement.
 */
export interface IBalance {
  /** Unique balance record identifier (UUID v4). */
  id: string;
  /** Foreign key to the merchant. */
  merchantId: string;
  /** Available balance that can be settled (smallest currency unit). */
  available: number;
  /** Pending balance from authorized but uncaptured payments. */
  pending: number;
  /** Reserved balance held for disputes or compliance holds. */
  reserved: number;
  /** ISO 4217 currency code for this balance. */
  currency: string;
  /** Timestamp of the last balance mutation. */
  updatedAt: Date;
}

/**
 * Server-side idempotency key record used to guarantee exactly-once
 * processing of API requests. Cached responses are returned for
 * duplicate requests within the expiry window.
 */
export interface IIdempotencyKey {
  /** Unique record identifier (UUID v4). */
  id: string;
  /** The idempotency key string supplied by the client. */
  key: string;
  /** Foreign key to the merchant who sent the request. */
  merchantId: string;
  /** The API path of the original request. */
  requestPath: string;
  /** HTTP method of the original request (e.g. 'POST'). */
  requestMethod: string;
  /** HTTP status code of the cached response. */
  responseCode: number;
  /** Serialised JSON body of the cached response. */
  responseBody: string;
  /** Timestamp after which this idempotency record is no longer valid. */
  expiresAt: Date;
  /** Timestamp when the idempotency record was created. */
  createdAt: Date;
}
