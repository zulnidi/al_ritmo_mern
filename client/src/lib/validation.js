/** Reglas de validación reutilizables; devuelven el mensaje de error o ''. */
export const required = (label) => (value) =>
  String(value ?? '').trim() ? '' : `${label} es requerido`;
export const minLength = (label, min) => (value) =>
  String(value ?? '').trim().length < min ? `${label} debe tener al menos ${min} caracteres` : '';
export const maxLength = (label, max) => (value) =>
  String(value ?? '').trim().length > max ? `${label} no puede exceder ${max} caracteres` : '';

/** Compone reglas: devuelve el primer error encontrado. */
export const compose =
  (...rules) =>
  (value) => {
    for (const rule of rules) {
      const message = rule(value);
      if (message) return message;
    }
    return '';
  };

/** Aplica un esquema { campo: regla } a los valores y devuelve { campo: error } solo con errores. */
export function validate(schema, values) {
  const errors = {};
  for (const [field, rule] of Object.entries(schema)) {
    const message = rule(values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}
