/**
 * ForbiddenError - thrown when a user is authenticated but lacks
 * the required permissions/scopes to access a resource.
 *
 * Returns HTTP 403 Forbidden.
 */
export class ForbiddenError extends Error {
  public status: number;
  public code: string;

  constructor(code: string, error: { message: string }) {
    super(error.message);
    this.status = 403;
    this.name = 'ForbiddenError';
    this.code = code;
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

