const PlaylistRepository = require('./PlaylistRepository');
const { buildPlaylistFilter, rethrowDuplicate } = require('./mongoHelpers');

const DUPLICATE_MESSAGE = 'El nombre de la playlist ya existe';

class MongoPlaylistRepository extends PlaylistRepository {
  /** @param {import('mongoose').Model} model */
  constructor(model) {
    super();
    this.model = model;
  }

  async list({ search, skip = 0, limit = 50 } = {}) {
    const filter = buildPlaylistFilter({ search });
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('songs')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);
    return { items, total };
  }

  findById(id) {
    return this.model.findById(id).populate('songs').lean();
  }

  async create(data) {
    try {
      const doc = await this.model.create(data);
      return await this.findById(doc._id);
    } catch (err) {
      return rethrowDuplicate(err, DUPLICATE_MESSAGE);
    }
  }

  async update(id, data) {
    try {
      return await this.model
        .findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .populate('songs')
        .lean();
    } catch (err) {
      return rethrowDuplicate(err, DUPLICATE_MESSAGE);
    }
  }

  delete(id) {
    return this.model.findByIdAndDelete(id).lean();
  }

  addSong(id, songId) {
    return this.model
      .findByIdAndUpdate(id, { $addToSet: { songs: songId } }, { new: true })
      .populate('songs')
      .lean();
  }

  removeSong(id, songId) {
    return this.model
      .findByIdAndUpdate(id, { $pull: { songs: songId } }, { new: true })
      .populate('songs')
      .lean();
  }

  async removeSongFromAll(songId) {
    await this.model.updateMany({ songs: songId }, { $pull: { songs: songId } });
  }
}

module.exports = MongoPlaylistRepository;
