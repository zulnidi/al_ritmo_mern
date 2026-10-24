/**
 * Error operacional con código HTTP. Los servicios lanzan AppError y el
 * middleware errorHandler lo traduce a una respuesta JSON consistente.
 */
class AppError extends Error {
  /**
   * @param {number} statusCode Código HTTP.
   * @param {string} message Mensaje legible para el cliente.
   * @param {{errors?: string[], fields?: Record<string,string>}} [details]
   */
  constructor(statusCode, message, details = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = details.errors || [];
    this.fields = details.fields || {};
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, details) {
    return new AppError(400, message, details);
  }

  static notFound(message) {
    return new AppError(404, message);
  }

  static conflict(message, details) {
    return new AppError(409, message, details);
  }
}

module.exports = AppError;
