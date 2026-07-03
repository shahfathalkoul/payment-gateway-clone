/**
 * @module date
 * @description Date/time utility functions for the payment gateway.
 *
 * All internal date operations use UTC to avoid timezone-related bugs
 * in settlement calculations and event ordering.
 */

/**
 * Returns the current UTC timestamp as an ISO 8601 string.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Returns the current time as a Date object.
 */
export function now(): Date {
  return new Date();
}

/**
 * Converts a Date to an ISO 8601 string.
 * Returns null for null/undefined inputs.
 */
export function toISO(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Parses an ISO 8601 string into a Date object.
 *
 * @param isoString - ISO 8601 date string.
 * @returns Parsed Date object.
 * @throws {Error} If the string is not a valid date.
 */
export function fromISO(isoString: string): Date {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string: '${isoString}'`);
  }
  return date;
}

/**
 * Returns the start of the day (00:00:00.000 UTC) for a given date.
 * Used as the inclusive start of a settlement period.
 *
 * @param date - Input date.
 * @returns New Date set to the start of the UTC day.
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the end of the day (23:59:59.999 UTC) for a given date.
 * Used as the exclusive boundary of a settlement period.
 *
 * @param date - Input date.
 * @returns New Date set to the end of the UTC day.
 */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/**
 * Adds a number of days to a date.
 *
 * @param date - Input date.
 * @param days - Number of days to add (can be negative).
 * @returns New Date with days added.
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Adds a number of hours to a date.
 *
 * @param date - Input date.
 * @param hours - Number of hours to add (can be negative).
 * @returns New Date with hours added.
 */
export function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setUTCHours(d.getUTCHours() + hours);
  return d;
}

/**
 * Adds a number of minutes to a date.
 *
 * @param date - Input date.
 * @param minutes - Number of minutes to add (can be negative).
 * @returns New Date with minutes added.
 */
export function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d;
}

/**
 * Checks if a date is in the past (before the current time).
 *
 * @param date - The date to check.
 * @returns `true` if the date is in the past.
 */
export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Checks if a date is in the future (after the current time).
 *
 * @param date - The date to check.
 * @returns `true` if the date is in the future.
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Calculates the difference between two dates in milliseconds.
 *
 * @param a - First date.
 * @param b - Second date.
 * @returns Absolute difference in milliseconds.
 */
export function diffMs(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime());
}

/**
 * Formats a duration in milliseconds to a human-readable string.
 *
 * @param ms - Duration in milliseconds.
 * @returns Human-readable string (e.g. '2.5s', '150ms', '1m 30s').
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Creates a Date object representing N minutes from now.
 * Useful for setting expiry times (e.g. idempotency keys, JWT).
 *
 * @param minutes - Number of minutes from now.
 * @returns Future Date.
 */
export function minutesFromNow(minutes: number): Date {
  return addMinutes(new Date(), minutes);
}

/**
 * Creates a Date object representing N hours from now.
 *
 * @param hours - Number of hours from now.
 * @returns Future Date.
 */
export function hoursFromNow(hours: number): Date {
  return addHours(new Date(), hours);
}

/**
 * Creates a Date object representing N days from now.
 *
 * @param days - Number of days from now.
 * @returns Future Date.
 */
export function daysFromNow(days: number): Date {
  return addDays(new Date(), days);
}
