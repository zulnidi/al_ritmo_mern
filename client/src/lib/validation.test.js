import { compose, maxLength, minLength, required, validate } from './validation';

describe('validation', () => {
  it('required / minLength / maxLength usan trim', () => {
    expect(required('El título')('  ')).toBe('El título es requerido');
    expect(minLength('El título', 2)(' a ')).toMatch(/al menos 2/);
    expect(maxLength('El álbum', 3)('abcd')).toMatch(/exceder 3/);
    expect(required('x')('ok')).toBe('');
  });
  it('compose devuelve el primer error', () => {
    const rule = compose(required('El nombre'), minLength('El nombre', 3));
    expect(rule('')).toMatch(/requerido/);
    expect(rule('ab')).toMatch(/al menos 3/);
    expect(rule('abc')).toBe('');
  });
  it('validate solo devuelve campos con error', () => {
    const errors = validate({ a: required('A'), b: required('B') }, { a: 'x', b: '' });
    expect(errors).toEqual({ b: 'B es requerido' });
  });
});
