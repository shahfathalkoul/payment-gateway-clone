/**
 * @module dto
 * @description Data Transfer Objects (DTOs) define the shape of data
 * flowing through API boundaries — request bodies and response payloads.
 * They are intentionally separate from domain entity interfaces to allow
 * independent evolution of the API contract and internal storage schema.
 */

import { ApiKeyType, PaymentMethod, PaymentStatus, RefundType, WebhookEventType } from './enums';
import { IPaymentAttempt } from './interfaces';

/**
 * Request body for creating a new payment intent.
 * Only `amount` and `currency` are required; all other fields are optional
 * and can be enriched later or via the dashboard.
 */
export interface CreatePaymentDTO {
  /** Payment amount in the smallest currency unit (e.g. 100 = ₹1.00). */
  amount: number;
  /** ISO 4217 currency code (e.g. 'INR', 'USD'). */
  currency: string;
  /** Preferred payment method; if omitted, the customer can choose at checkout. */
  method?: PaymentMethod;
  /** Human-readable description of what this payment is for. */
  description?: string;
  /** Merchant-supplied order identifier for reconciliation. */
  orderId?: string;
  /** Merchant-supplied customer identifier. */
  customerId?: string;
  /** Arbitrary key-value metadata to attach to the payment. */
  metadata?: Record<string, unknown>;
  /** Free-text notes visible in the dashboard. */
  notes?: string;
  /** URL to redirect the customer after payment completion. */
  callbackUrl?: string;
}

/**
 * Serialised payment response returned by the API.
 * Includes nested payment attempts for full visibility into processing history.
 */
export interface PaymentResponseDTO {
  /** Unique payment identifier. */
  id: string;
  /** Identifier of the merchant who created this payment. */
  merchantId: string;
  /** Merchant-supplied order reference, or null if not provided. */
  orderId: string | null;
  /** Payment amount in the smallest currency unit. */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Current lifecycle status of the payment. */
  status: PaymentStatus;
  /** Payment method used, or null if not yet determined. */
  method: PaymentMethod | null;
  /** Human-readable description, or null. */
  description: string | null;
  /** Ordered list of processing attempts for this payment. */
  attempts: IPaymentAttempt[];
  /** Arbitrary metadata attached by the merchant. */
  metadata: Record<string, unknown>;
  /** Free-text notes, or null. */
  notes: string | null;
  /** Timestamp when the payment was created. */
  createdAt: Date;
  /** Timestamp of the last status change. */
  updatedAt: Date;
}

/**
 * Request body for initiating a refund against a captured payment.
 * If `amount` is omitted for a `FULL` refund, the entire captured amount is refunded.
 */
export interface CreateRefundDTO {
  /** Identifier of the payment to refund. */
  paymentId: string;
  /** Refund amount in the smallest currency unit; required for partial refunds. */
  amount?: number;
  /** Reason for the refund (displayed to the customer). */
  reason?: string;
  /** Whether this is a full or partial refund. */
  type: RefundType;
}

/**
 * Request body for merchant self-registration.
 * After registration the merchant enters `PENDING_VERIFICATION` status.
 */
export interface MerchantRegistrationDTO {
  /** Email address used for login and communication. */
  email: string;
  /** Plain-text password (hashed server-side before storage). */
  password: string;
  /** Registered business / trading name. */
  businessName: string;
  /** Public website URL of the business, if available. */
  businessUrl?: string;
}

/**
 * Request body for user authentication (login).
 */
export interface LoginDTO {
  /** Registered email address. */
  email: string;
  /** Plain-text password to verify. */
  password: string;
}

/**
 * Request body for generating a new API key pair.
 * The response will contain the full secret key exactly once;
 * subsequent retrievals only show the prefix.
 */
export interface CreateApiKeyDTO {
  /** Human-readable label for the key (e.g. 'Mobile App Production'). */
  label: string;
  /** Environment type: live keys hit real banks, test keys use the sandbox. */
  type: ApiKeyType;
}

/**
 * Request body for configuring a merchant's webhook endpoint.
 * Merchants can subscribe to a subset of event types.
 */
export interface WebhookConfigDTO {
  /** HTTPS endpoint that will receive POST requests for each event. */
  url: string;
  /** List of event types the merchant wants to subscribe to. */
  events: WebhookEventType[];
  /** Optional HMAC secret for signing payloads; auto-generated if omitted. */
  secret?: string;
}
