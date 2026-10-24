const AppError = require('../errors/AppError');
const { buildPageMeta } = require('../utils/pagination');

/**
 * Casos de uso de canciones. Depende de las abstracciones SongRepository y
 * PlaylistRepository (inyectadas), nunca de Mongoose.
 */
class SongService {
  constructor({ songRepository, playlistRepository }) {
    this.songs = songRepository;
    this.playlists = playlistRepository;
  }

  async list({ page, limit, search, genre }) {
    const { items, total } = await this.songs.list({
      search,
      genre,
      skip: (page - 1) * limit,
      limit,
    });
    return { items, meta: buildPageMeta({ total, page, limit }) };
  }

  async get(id) {
    const song = await this.songs.findById(id);
    if (!song) throw AppError.notFound('Canción no encontrada');
    return song;
  }

  create(data) {
    return this.songs.create(data);
  }

  async update(id, data) {
    const song = await this.songs.update(id, data);
    if (!song) throw AppError.notFound('Canción no encontrada');
    return song;
  }

  /** Al borrar una canción también se quita de las playlists que la contenían. */
  async remove(id) {
    const song = await this.songs.delete(id);
    if (!song) throw AppError.notFound('Canción no encontrada');
    await this.playlists.removeSongFromAll(id);
  }
}

module.exports = SongService;
