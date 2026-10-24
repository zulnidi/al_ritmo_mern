const AppError = require('../errors/AppError');
const { buildPageMeta } = require('../utils/pagination');

const NOT_FOUND = 'Playlist no encontrada';

class PlaylistService {
  constructor({ playlistRepository, songRepository }) {
    this.playlists = playlistRepository;
    this.songs = songRepository;
  }

  async list({ page, limit, search }) {
    const { items, total } = await this.playlists.list({ search, skip: (page - 1) * limit, limit });
    return { items, meta: buildPageMeta({ total, page, limit }) };
  }

  async get(id) {
    const playlist = await this.playlists.findById(id);
    if (!playlist) throw AppError.notFound(NOT_FOUND);
    return playlist;
  }

  async create(data) {
    if (data.songs) await this.#assertSongsExist(data.songs);
    return this.playlists.create(data);
  }

  async update(id, data) {
    if (data.songs) await this.#assertSongsExist(data.songs);
    const playlist = await this.playlists.update(id, data);
    if (!playlist) throw AppError.notFound(NOT_FOUND);
    return playlist;
  }

  async remove(id) {
    const playlist = await this.playlists.delete(id);
    if (!playlist) throw AppError.notFound(NOT_FOUND);
  }

  async addSong(id, songId) {
    await this.get(id);
    if (!(await this.songs.findById(songId))) throw AppError.notFound('Canción no encontrada');
    return this.playlists.addSong(id, songId);
  }

  async removeSong(id, songId) {
    const playlist = await this.playlists.removeSong(id, songId);
    if (!playlist) throw AppError.notFound(NOT_FOUND);
    return playlist;
  }

  async #assertSongsExist(ids) {
    const found = await this.songs.findManyByIds(ids);
    if (found.length !== ids.length) {
      throw AppError.badRequest('Algunas canciones no existen', {
        fields: { songs: 'Alguna de las canciones indicadas no existe' },
      });
    }
  }
}

module.exports = PlaylistService;
