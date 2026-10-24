const { escapeRegex, buildPageMeta } = require('../../src/utils/pagination');
const {
  buildSongFilter,
  buildPlaylistFilter,
  rethrowDuplicate,
} = require('../../src/repositories/mongoHelpers');
const { loadConfig } = require('../../src/config/env');
const { normalizeError } = require('../../src/middleware/errorHandler');
const AppError = require('../../src/errors/AppError');

describe('utils', () => {
  it('escapeRegex neutraliza metacaracteres', () => {
    expect(escapeRegex('a.b*c(d)')).toBe('a\\.b\\*c\\(d\\)');
  });
  it('buildPageMeta nunca devuelve menos de una página', () => {
    expect(buildPageMeta({ total: 0, page: 1, limit: 10 }).totalPages).toBe(1);
    expect(buildPageMeta({ total: 21, page: 1, limit: 10 }).totalPages).toBe(3);
  });
});

describe('mongoHelpers', () => {
  it('construye filtros escapando la búsqueda', () => {
    const f = buildSongFilter({ search: 'a.b', genre: 'Pop' });
    expect(f.genre.test('pop')).toBe(true);
    expect(f.$or[0].title.test('xaxb')).toBe(false);
    expect(buildSongFilter()).toEqual({});
    expect(buildPlaylistFilter({})).toEqual({});
    expect(buildPlaylistFilter({ search: 'x' }).name.test('X')).toBe(true);
  });
  it('rethrowDuplicate traduce 11000 a 409 y relanza lo demás', () => {
    expect(() => rethrowDuplicate({ code: 11000 }, 'dup')).toThrow(
      expect.objectContaining({ statusCode: 409 }),
    );
    const other = new Error('otro');
    expect(() => rethrowDuplicate(other, 'dup')).toThrow(other);
  });
});

describe('loadConfig', () => {
  it('aplica valores por defecto y separa orígenes', () => {
    const c = loadConfig({
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb://x',
      CORS_ORIGIN: 'http://a.co, http://b.co',
    });
    expect(c).toMatchObject({
      isProduction: true,
      port: 5000,
      corsOrigins: ['http://a.co', 'http://b.co'],
    });
    expect(loadConfig({ NODE_ENV: 'test', CORS_ORIGIN: '*' }).corsOrigins).toBe('*');
  });
  it('falla rápido con mensaje claro', () => {
    expect(() => loadConfig({})).toThrow(/MONGODB_URI/);
    expect(() => loadConfig({ NODE_ENV: 'test', PORT: 'abc' })).toThrow(/PORT/);
  });
});

describe('normalizeError', () => {
  it('traduce errores de Mongoose y body-parser', () => {
    expect(
      normalizeError({ name: 'ValidationError', errors: { title: { message: 'mal' } } }),
    ).toMatchObject({
      statusCode: 400,
      fields: { title: 'mal' },
    });
    expect(normalizeError({ name: 'CastError', value: 'zz' }).statusCode).toBe(400);
    expect(normalizeError({ type: 'entity.too.large' }).statusCode).toBe(413);
    expect(normalizeError(AppError.notFound('x')).statusCode).toBe(404);
    expect(normalizeError(new Error('boom'))).toBeNull();
  });
});
