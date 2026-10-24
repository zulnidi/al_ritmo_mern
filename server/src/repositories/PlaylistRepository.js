/**
 * Contrato (abstracción) de persistencia de playlists.
 * `findById`, `create`, `update`, `addSong` y `removeSong` devuelven la playlist
 * con sus canciones ya pobladas (objetos completos, no solo ids).
 */
class PlaylistRepository {
  /** @returns {Promise<{items: object[], total: number}>} */
  async list(_query) {
    throw new Error('PlaylistRepository.list no implementado');
  }
  async findById(_id) {
    throw new Error('PlaylistRepository.findById no implementado');
  }
  /** Debe lanzar AppError 409 si el nombre ya existe. */
  async create(_data) {
    throw new Error('PlaylistRepository.create no implementado');
  }
  async update(_id, _data) {
    throw new Error('PlaylistRepository.update no implementado');
  }
  async delete(_id) {
    throw new Error('PlaylistRepository.delete no implementado');
  }
  /** Agrega sin duplicar. @returns {Promise<object|null>} */
  async addSong(_id, _songId) {
    throw new Error('PlaylistRepository.addSong no implementado');
  }
  async removeSong(_id, _songId) {
    throw new Error('PlaylistRepository.removeSong no implementado');
  }
  /** Quita una canción de todas las playlists (integridad al borrar canciones). */
  async removeSongFromAll(_songId) {
    throw new Error('PlaylistRepository.removeSongFromAll no implementado');
  }
}

module.exports = PlaylistRepository;
