const asyncHandler = require('../middleware/asyncHandler');
const { createCrudController } = require('./resourceController');

function createPlaylistController(service) {
  return {
    ...createCrudController(service, { deletedMessage: 'Playlist eliminada' }),
    addSong: asyncHandler(async (req, res) => {
      const { id } = req.validated.params;
      res.json(await service.addSong(id, req.validated.body.songId));
    }),
    removeSong: asyncHandler(async (req, res) => {
      const { id, songId } = req.validated.params;
      res.json(await service.removeSong(id, songId));
    }),
  };
}

module.exports = { createPlaylistController };
