/**
 * @module timing
 * @description Constant-time string comparison to prevent timing side-channel attacks.
 *
 * Standard string comparison (=== or Buffer.compare) returns early on the
 * first differing byte, leaking information about how many bytes match.
 * An attacker can use this to reconstruct a secret byte-by-byte.
 *
 * This module wraps Node.js `crypto.timingSafeEqual` with a length-check
 * guard that itself does not leak length information (both inputs are
 * hashed to fixed-length digests before comparison when lengths differ).
 */

import crypto from 'crypto';

/**
 * Performs a constant-time comparison of two strings.
 *
 * If the inputs are different lengths, they are first hashed to SHA-256
 * digests (fixed 32-byte length) so that the comparison time does not
 * reveal whether lengths matched.
 *
 * @param a - First string.
 * @param b - Second string.
 * @returns `true` if the strings are identical, `false` otherwise.
 *
 * @example
 * ```typescript
 * const isValid = constantTimeEqual(computedSignature, providedSignature);
 * ```
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    // Hash both to fixed-length digests to prevent length-based timing leaks.
    // The comparison will always return false, but the time taken is constant.
    const hashA = crypto.createHash('sha256').update(bufA).digest();
    const hashB = crypto.createHash('sha256').update(bufB).digest();
    crypto.timingSafeEqual(hashA, hashB);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}
