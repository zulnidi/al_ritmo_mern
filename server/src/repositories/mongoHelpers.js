const AppError = require('../errors/AppError');
const { escapeRegex } = require('../utils/pagination');

/** Construye el filtro de Mongo para listar canciones (búsqueda + género). */
function buildSongFilter({ search, genre } = {}) {
  const filter = {};
  if (genre) filter.genre = new RegExp(`^${escapeRegex(genre)}$`, 'i');
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { artist: rx }, { album: rx }];
  }
  return filter;
}

function buildPlaylistFilter({ search } = {}) {
  return search ? { name: new RegExp(escapeRegex(search), 'i') } : {};
}

/** Traduce el error E11000 de Mongo (índice único) a un 409 de dominio. */
function rethrowDuplicate(err, message) {
  if (err?.code === 11000) throw AppError.conflict(message, { fields: { name: message } });
  throw err;
}

module.exports = { buildSongFilter, buildPlaylistFilter, rethrowDuplicate };
