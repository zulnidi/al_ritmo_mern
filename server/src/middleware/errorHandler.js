const AppError = require('../errors/AppError');

/** Convierte errores de Mongoose / body-parser en AppError conocidos. */
function normalizeError(err) {
  if (err instanceof AppError) return err;

  if (err?.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => e.message);
    const fields = Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message]));
    return AppError.badRequest('Datos inválidos', { errors, fields });
  }
  if (err?.name === 'CastError') {
    return AppError.badRequest(`Identificador inválido: ${err.value}`);
  }
  if (err?.code === 11000) {
    return AppError.conflict('El recurso ya existe');
  }
  if (err?.type === 'entity.parse.failed') {
    return AppError.badRequest('El cuerpo de la petición no es JSON válido');
  }
  if (err?.type === 'entity.too.large') {
    return new AppError(413, 'El cuerpo de la petición es demasiado grande');
  }
  return null;
}

/** Ruta inexistente -> 404 con el mismo formato de error. */
const notFoundHandler = (req, _res, next) => {
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

/**
 * Handler centralizado. Nunca expone el stack ni el mensaje de errores
 * inesperados en producción.
 */
const createErrorHandler =
  ({ isProduction = false, logger = console } = {}) =>
  (err, _req, res, _next) => {
    const known = normalizeError(err);
    if (known) {
      return res.status(known.statusCode).json({
        message: known.message,
        errors: known.errors,
        fields: known.fields,
      });
    }

    logger.error(err);
    return res.status(500).json({
      message: isProduction ? 'Error interno del servidor' : err.message,
      errors: [],
      fields: {},
      ...(isProduction ? {} : { stack: err.stack }),
    });
  };

module.exports = { createErrorHandler, notFoundHandler, normalizeError };
