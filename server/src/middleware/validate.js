const AppError = require('../errors/AppError');

/** Convierte un ZodError en AppError 400 con mensajes y mapa campo -> mensaje. */
function toValidationError(zodError) {
  const errors = [];
  const fields = {};
  for (const issue of zodError.issues) {
    const field = issue.path.join('.') || 'body';
    errors.push(issue.message);
    if (!fields[field]) fields[field] = issue.message;
  }
  return AppError.badRequest('Datos inválidos', { errors, fields });
}

/**
 * Middleware de validación. `schemas` puede traer body, params y/o query
 * (esquemas Zod). Los valores validados reemplazan a los originales, de modo
 * que los controladores reciben datos ya limpios (trim, números, defaults).
 */
const validate = (schemas) => (req, _res, next) => {
  try {
    for (const key of ['params', 'body', 'query']) {
      if (!schemas[key]) continue;
      const result = schemas[key].safeParse(req[key] ?? {});
      if (!result.success) return next(toValidationError(result.error));
      // req.query es un getter en Express 5: se guarda en req.validated.
      req.validated = { ...(req.validated || {}), [key]: result.data };
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = validate;
