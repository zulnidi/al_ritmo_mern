const { z } = require('zod');
const { objectId, requiredText, pagination, atLeastOneField } = require('./common');

const songIds = z
  .array(objectId('identificador de canción'), { error: 'songs debe ser una lista de ids' })
  .transform((ids) => [...new Set(ids)]);

const createPlaylistBody = z.object({
  name: requiredText('nombre', { max: 100 }),
  songs: songIds.optional(),
});

const updatePlaylistBody = createPlaylistBody
  .partial()
  .refine(atLeastOneField, { message: 'Debes enviar al menos un campo para actualizar' });

const listPlaylistsQuery = z.object({
  ...pagination,
  search: z.string().trim().max(100).optional(),
});

const addSongBody = z.object({ songId: objectId('identificador de canción') });

const playlistSongParams = z.object({
  id: objectId(),
  songId: objectId('identificador de canción'),
});

module.exports = {
  createPlaylistBody,
  updatePlaylistBody,
  listPlaylistsQuery,
  addSongBody,
  playlistSongParams,
};
