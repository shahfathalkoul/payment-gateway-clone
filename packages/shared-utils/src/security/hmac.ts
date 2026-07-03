/**
 * @module hmac
 * @description HMAC-SHA256 signing and verification for webhook payloads.
 *
 * When the payment gateway dispatches a webhook to a merchant's endpoint,
 * the payload is signed with the merchant's webhook secret using HMAC-SHA256.
 * The merchant can verify the signature to confirm:
 *   1. The payload was sent by the payment gateway (authenticity).
 *   2. The payload was not tampered with in transit (integrity).
 *
 * Verification uses constant-time comparison to prevent timing attacks.
 */

import crypto from 'crypto';
import { constantTimeEqual } from './timing';

/**
 * Signs a string payload using HMAC-SHA256.
 *
 * @param secret - The HMAC secret key (e.g. merchant's webhook secret).
 * @param payload - The string payload to sign (typically JSON.stringify'd body).
 * @returns Lowercase hex-encoded HMAC-SHA256 signature.
 *
 * @example
 * ```typescript
 * const signature = signPayload(webhookSecret, JSON.stringify(event));
 * // Set header: X-Signature: sha256=<signature>
 * ```
 */
export function signPayload(secret: string, payload: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Verifies an HMAC-SHA256 signature against a payload.
 *
 * This function recomputes the HMAC from the secret and payload, then
 * performs a constant-time comparison with the provided signature.
 *
 * @param secret - The HMAC secret key.
 * @param payload - The original string payload.
 * @param signature - The hex-encoded signature to verify.
 * @returns `true` if the signature is valid, `false` otherwise.
 *
 * @example
 * ```typescript
 * const isValid = verifySignature(
 *   webhookSecret,
 *   req.body,
 *   req.headers['x-signature'],
 * );
 * if (!isValid) {
 *   throw new AuthenticationError('Invalid webhook signature');
 * }
 * ```
 */
export function verifySignature(
  secret: string,
  payload: string,
  signature: string,
): boolean {
  const computed = signPayload(secret, payload);
  return constantTimeEqual(computed, signature);
}

/**
 * Creates a complete webhook signature header value.
 * Includes a timestamp to prevent replay attacks.
 *
 * Format: `t=<unix_timestamp>,v1=<hmac_hex>`
 *
 * The payload signed is: `<timestamp>.<payload>`
 *
 * @param secret - The HMAC secret key.
 * @param payload - The string payload.
 * @param timestamp - Unix timestamp in seconds (defaults to current time).
 * @returns The complete signature header value.
 */
export function createWebhookSignature(
  secret: string,
  payload: string,
  timestamp?: number,
): string {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const signature = signPayload(secret, signedPayload);
  return `t=${ts},v1=${signature}`;
}

/**
 * Verifies a webhook signature header value.
 * Extracts the timestamp and signature, verifies both freshness and authenticity.
 *
 * @param secret - The HMAC secret key.
 * @param payload - The raw string payload.
 * @param signatureHeader - The signature header value (format: `t=...,v1=...`).
 * @param toleranceSeconds - Maximum age of the signature in seconds (default: 300 = 5 minutes).
 * @returns `true` if the signature is valid and fresh.
 */
export function verifyWebhookSignature(
  secret: string,
  payload: string,
  signatureHeader: string,
  toleranceSeconds: number = 300,
): boolean {
  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((p) => p.startsWith('t='));
  const signaturePart = parts.find((p) => p.startsWith('v1='));

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = parseInt(timestampPart.slice(2), 10);
  const signature = signaturePart.slice(3);

  if (isNaN(timestamp)) {
    return false;
  }

  // Check timestamp freshness
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return false;
  }

  // Verify HMAC
  const signedPayload = `${timestamp}.${payload}`;
  const expected = signPayload(secret, signedPayload);
  return constantTimeEqual(expected, signature);
}
