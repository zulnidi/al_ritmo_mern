const crypto = require('crypto');
const PlaylistRepository = require('../PlaylistRepository');
const AppError = require('../../errors/AppError');

const newId = () => crypto.randomBytes(12).toString('hex');

class InMemoryPlaylistRepository extends PlaylistRepository {
  /** @param {import('../SongRepository')} songRepository usado para "poblar" canciones */
  constructor(songRepository) {
    super();
    this.songRepository = songRepository;
    this.items = new Map();
    this.seq = 0;
  }

  async _populate(p) {
    if (!p) return null;
    const { _seq, ...rest } = p; // eslint-disable-line no-unused-vars
    const songs = await this.songRepository.findManyByIds(p.songs);
    // conserva el orden de inserción y descarta referencias huérfanas
    const byId = new Map(songs.map((s) => [String(s._id), s]));
    return { ...rest, songs: p.songs.map((id) => byId.get(String(id))).filter(Boolean) };
  }

  _assertUniqueName(name, exceptId) {
    for (const p of this.items.values()) {
      if (p.name === name && p._id !== exceptId) {
        throw AppError.conflict('El nombre de la playlist ya existe');
      }
    }
  }

  async list({ search, skip = 0, limit = 50 } = {}) {
    let all = [...this.items.values()];
    if (search) all = all.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    all.sort((a, b) => b._seq - a._seq);
    const items = await Promise.all(all.slice(skip, skip + limit).map((p) => this._populate(p)));
    return { items, total: all.length };
  }

  findById(id) {
    return this._populate(this.items.get(String(id)));
  }

  async create({ name, songs = [] }) {
    this._assertUniqueName(name);
    const p = { _id: newId(), name, songs: [...songs], createdAt: new Date(), _seq: ++this.seq };
    this.items.set(p._id, p);
    return this._populate(p);
  }

  async update(id, data) {
    const current = this.items.get(String(id));
    if (!current) return null;
    if (data.name !== undefined) this._assertUniqueName(data.name, current._id);
    Object.assign(current, data);
    return this._populate(current);
  }

  async delete(id) {
    const current = this.items.get(String(id));
    if (!current) return null;
    this.items.delete(current._id);
    return current;
  }

  async addSong(id, songId) {
    const current = this.items.get(String(id));
    if (!current) return null;
    if (!current.songs.map(String).includes(String(songId))) current.songs.push(String(songId));
    return this._populate(current);
  }

  async removeSong(id, songId) {
    const current = this.items.get(String(id));
    if (!current) return null;
    current.songs = current.songs.filter((s) => String(s) !== String(songId));
    return this._populate(current);
  }

  async removeSongFromAll(songId) {
    for (const p of this.items.values()) {
      p.songs = p.songs.filter((s) => String(s) !== String(songId));
    }
  }
}

module.exports = InMemoryPlaylistRepository;
