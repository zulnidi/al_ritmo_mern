const SongRepository = require('./SongRepository');
const { buildSongFilter } = require('./mongoHelpers');

class MongoSongRepository extends SongRepository {
  /** @param {import('mongoose').Model} model */
  constructor(model) {
    super();
    this.model = model;
  }

  async list({ search, genre, skip = 0, limit = 50 } = {}) {
    const filter = buildSongFilter({ search, genre });
    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return { items, total };
  }

  findById(id) {
    return this.model.findById(id).lean();
  }

  findManyByIds(ids) {
    return this.model.find({ _id: { $in: ids } }).lean();
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  }

  delete(id) {
    return this.model.findByIdAndDelete(id).lean();
  }
}

module.exports = MongoSongRepository;
