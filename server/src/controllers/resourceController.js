const asyncHandler = require('../middleware/asyncHandler');

/** Cabeceras de paginación: el cuerpo sigue siendo un arreglo (contrato original). */
function setPageHeaders(res, meta) {
  res.set('X-Total-Count', String(meta.total));
  res.set('X-Page', String(meta.page));
  res.set('X-Total-Pages', String(meta.totalPages));
  res.set('Access-Control-Expose-Headers', 'X-Total-Count, X-Page, X-Total-Pages');
}

/**
 * Fábrica de controladores CRUD. Canciones y playlists comparten la misma
 * forma de manejar HTTP, así que se escribe una vez (DRY) y cada recurso
 * solo aporta su servicio y su mensaje de borrado.
 */
function createCrudController(service, { deletedMessage }) {
  return {
    list: asyncHandler(async (req, res) => {
      const { items, meta } = await service.list(req.validated.query);
      setPageHeaders(res, meta);
      res.json(items);
    }),
    get: asyncHandler(async (req, res) => {
      res.json(await service.get(req.validated.params.id));
    }),
    create: asyncHandler(async (req, res) => {
      res.status(201).json(await service.create(req.validated.body));
    }),
    update: asyncHandler(async (req, res) => {
      res.json(await service.update(req.validated.params.id, req.validated.body));
    }),
    remove: asyncHandler(async (req, res) => {
      await service.remove(req.validated.params.id);
      res.json({ message: deletedMessage });
    }),
  };
}

module.exports = { createCrudController };
