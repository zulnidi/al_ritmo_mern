const { z } = require('zod');

const objectId = (label = 'identificador') =>
  z.string().regex(/^[a-f\d]{24}$/i, `El ${label} no es válido`);

const idParams = z.object({ id: objectId() });

/** Texto obligatorio con trim y límites, con mensajes en español. */
const requiredText = (label, { min = 2, max = 100, article = 'El' } = {}) =>
  z
    .string({ error: `${article} ${label} es requerido` })
    .trim()
    .min(1, `${article} ${label} es requerido`)
    .min(min, `${article} ${label} debe tener al menos ${min} caracteres`)
    .max(max, `${article} ${label} no puede exceder ${max} caracteres`);

const pagination = {
  page: z.coerce.number().int().min(1, 'La página debe ser >= 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'El límite debe ser >= 1')
    .max(100, 'El límite máximo es 100')
    .default(50),
};

/** Exige al menos un campo en actualizaciones parciales (PUT). */
const atLeastOneField = (obj) => Object.keys(obj).length > 0;

module.exports = { objectId, idParams, requiredText, pagination, atLeastOneField };
