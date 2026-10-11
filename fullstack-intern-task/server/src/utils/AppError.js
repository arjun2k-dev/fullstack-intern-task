/** Operational error with an HTTP status, handled centrally by errorHandler. */
export class AppError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    // Optional field-level details, e.g. { email: 'Email is invalid' }
    this.errors = errors;
  }
}
