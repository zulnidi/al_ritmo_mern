const { Router } = require('express');
const validate = require('../middleware/validate');
const { idParams } = require('../validators/common');
const v = require('../validators/playlistValidators');
const { createPlaylistController } = require('../controllers/playlistController');

function createPlaylistRoutes(playlistService) {
  const c = createPlaylistController(playlistService);
  const router = Router();
  router.get('/', validate({ query: v.listPlaylistsQuery }), c.list);
  router.post('/', validate({ body: v.createPlaylistBody }), c.create);
  router.get('/:id', validate({ params: idParams }), c.get);
  router.put('/:id', validate({ params: idParams, body: v.updatePlaylistBody }), c.update);
  router.delete('/:id', validate({ params: idParams }), c.remove);
  router.post('/:id/songs', validate({ params: idParams, body: v.addSongBody }), c.addSong);
  router.delete('/:id/songs/:songId', validate({ params: v.playlistSongParams }), c.removeSong);
  return router;
}

module.exports = createPlaylistRoutes;
