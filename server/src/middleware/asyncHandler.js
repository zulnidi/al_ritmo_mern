/**
 * Envuelve un handler async para que cualquier rechazo llegue a next().
 * (Express 5 ya lo hace, pero hacerlo explícito mantiene el contrato claro
 * y funciona también con handlers que no sean promesas.)
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve()
    .then(() => fn(req, res, next))
    .catch(next);
};

module.exports = asyncHandler;
