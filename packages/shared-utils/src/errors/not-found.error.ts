/**
 * @module not-found.error
 * @description Error thrown when a requested entity does not exist.
 *
 * HTTP 404 — Not Found.
 */

import { BaseError } from './base.error';

export class NotFoundError extends BaseError {
  constructor(
    entity: string,
    identifier?: string,
  ) {
    const message = identifier
      ? `${entity} '${identifier}' not found`
      : `${entity} not found`;

    super(message, 'NOT_FOUND', 404, true, { entity, identifier });
  }
}
