import { normalizeError } from './http';

describe('normalizeError', () => {
  it('usa el mensaje, errores y campos del servidor', () => {
    const err = normalizeError({
      response: {
        status: 400,
        data: { message: 'Datos inválidos', errors: ['x'], fields: { title: 'x' } },
      },
    });
    expect(err).toEqual({
      message: 'Datos inválidos',
      errors: ['x'],
      fields: { title: 'x' },
      status: 400,
    });
  });
  it('tolera respuestas sin cuerpo útil', () => {
    expect(normalizeError({ response: { status: 500, data: {} } }).message).toBe(
      'Error del servidor',
    );
    expect(normalizeError({ response: { status: 400, data: { errors: ['uno'] } } }).message).toBe(
      'uno',
    );
  });
  it('distingue falta de conexión y otros errores', () => {
    expect(normalizeError({ request: {} })).toMatchObject({
      status: 0,
      message: 'No se pudo conectar con el servidor',
    });
    expect(normalizeError({ message: 'boom' }).message).toBe('boom');
  });
});
