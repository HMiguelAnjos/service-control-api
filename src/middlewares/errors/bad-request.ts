import { DomainError } from './domain-error';

/**
 * Legacy generic error class. Keeps existing call sites compiling.
 * Prefer the specific subclasses in `./errors.ts` for new code:
 *   - ValidationError, NotFoundError, ConflictError,
 *   - ForbiddenError, UnauthorizedError, InsufficientStockError,
 *   - PlanFeatureRequiredError, PlanLimitExceededError.
 */
export class BadRequest extends DomainError {
  constructor(statusCode: number, message: string) {
    const code = statusCodeToCode(statusCode);
    super(statusCode, code, message);
    this.name = 'BadRequest';
  }
}

function statusCodeToCode(status: number): string {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 402:
      return 'PAYMENT_REQUIRED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    default:
      return 'BAD_REQUEST';
  }
}
