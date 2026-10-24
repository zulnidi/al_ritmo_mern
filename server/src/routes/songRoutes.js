const { Router } = require('express');
const validate = require('../middleware/validate');
const { idParams } = require('../validators/common');
const { createSongBody, updateSongBody, listSongsQuery } = require('../validators/songValidators');
const { createCrudController } = require('../controllers/resourceController');

function createSongRoutes(songService) {
  const c = createCrudController(songService, { deletedMessage: 'Canción eliminada' });
  const router = Router();
  router.get('/', validate({ query: listSongsQuery }), c.list);
  router.post('/', validate({ body: createSongBody }), c.create);
  router.get('/:id', validate({ params: idParams }), c.get);
  router.put('/:id', validate({ params: idParams, body: updateSongBody }), c.update);
  router.delete('/:id', validate({ params: idParams }), c.remove);
  return router;
}

module.exports = createSongRoutes;
