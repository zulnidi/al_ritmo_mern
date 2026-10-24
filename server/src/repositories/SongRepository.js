/**
 * Contrato (abstracción) de persistencia de canciones.
 * El servicio depende de esta forma, no de Mongoose: así puede probarse con
 * un repositorio falso o en memoria (principio de inversión de dependencias).
 *
 * Todas las operaciones devuelven objetos planos (no documentos Mongoose).
 */
class SongRepository {
  /** @returns {Promise<{items: object[], total: number}>} */
  async list(_query) {
    throw new Error('SongRepository.list no implementado');
  }
  async findById(_id) {
    throw new Error('SongRepository.findById no implementado');
  }
  /** @returns {Promise<object[]>} las canciones que existen entre los ids dados */
  async findManyByIds(_ids) {
    throw new Error('SongRepository.findManyByIds no implementado');
  }
  async create(_data) {
    throw new Error('SongRepository.create no implementado');
  }
  /** @returns {Promise<object|null>} null si no existe */
  async update(_id, _data) {
    throw new Error('SongRepository.update no implementado');
  }
  /** @returns {Promise<object|null>} la canción eliminada, o null si no existe */
  async delete(_id) {
    throw new Error('SongRepository.delete no implementado');
  }
}

module.exports = SongRepository;
