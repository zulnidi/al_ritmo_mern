const { z } = require('zod');
const { requiredText, pagination, atLeastOneField } = require('./common');

const songFields = {
  title: requiredText('título', { max: 100 }),
  artist: requiredText('artista', { max: 100 }),
  genre: requiredText('género', { max: 50 }),
  album: z.string().trim().max(100, 'El álbum no puede exceder 100 caracteres').optional(),
};

const createSongBody = z.object(songFields);

const updateSongBody = z
  .object(songFields)
  .partial()
  .refine(atLeastOneField, { message: 'Debes enviar al menos un campo para actualizar' });

const listSongsQuery = z.object({
  ...pagination,
  search: z.string().trim().max(100).optional(),
  genre: z.string().trim().max(50).optional(),
});

module.exports = { createSongBody, updateSongBody, listSongsQuery };
