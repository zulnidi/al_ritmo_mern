const crypto = require('crypto');
const SongRepository = require('../SongRepository');

const newId = () => crypto.randomBytes(12).toString('hex');
const clone = (o) => (o ? { ...o } : o);

/**
 * Implementación en memoria: sirve para pruebas de integración de la API sin
 * base de datos y para demostrar que el servicio no depende de Mongoose.
 */
class InMemorySongRepository extends SongRepository {
  constructor(seed = []) {
    super();
    this.items = new Map();
    this.seq = 0;
    seed.forEach((s) => this.create(s));
  }

  async list({ search, genre, skip = 0, limit = 50 } = {}) {
    let all = [...this.items.values()];
    if (genre) all = all.filter((s) => s.genre.toLowerCase() === genre.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      all = all.filter((s) =>
        [s.title, s.artist, s.album].some((v) => v && v.toLowerCase().includes(q)),
      );
    }
    all.sort((a, b) => b._seq - a._seq);
    return { items: all.slice(skip, skip + limit).map(this._public), total: all.length };
  }

  _public(s) {
    const { _seq, ...rest } = s; // eslint-disable-line no-unused-vars
    return rest;
  }

  async findById(id) {
    const s = this.items.get(String(id));
    return s ? this._public(s) : null;
  }

  async findManyByIds(ids) {
    return ids
      .map((id) => this.items.get(String(id)))
      .filter(Boolean)
      .map(this._public);
  }

  async create(data) {
    const song = {
      album: undefined,
      ...data,
      _id: newId(),
      createdAt: new Date(),
      _seq: ++this.seq,
    };
    this.items.set(song._id, song);
    return this._public(clone(song));
  }

  async update(id, data) {
    const current = this.items.get(String(id));
    if (!current) return null;
    const updated = { ...current, ...data };
    this.items.set(current._id, updated);
    return this._public(updated);
  }

  async delete(id) {
    const current = this.items.get(String(id));
    if (!current) return null;
    this.items.delete(current._id);
    return this._public(current);
  }
}

module.exports = InMemorySongRepository;
