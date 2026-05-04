/**
 * Base class for any expected, business-level error.
 *
 * - `statusCode`: HTTP status the API should respond with.
 * - `code`: machine-readable identifier the frontend can switch on
 *   (e.g. show a specific UI for INSUFFICIENT_STOCK).
 * - `details`: optional structured payload (e.g. { productId, requested, available }).
 *
 * Anything that isn't a `DomainError` is treated as a 500 by the error handler.
 */
export class DomainError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
