const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const SongService = require('./services/SongService');
const PlaylistService = require('./services/PlaylistService');
const createSongRoutes = require('./routes/songRoutes');
const createPlaylistRoutes = require('./routes/playlistRoutes');
const { createErrorHandler, notFoundHandler } = require('./middleware/errorHandler');

/**
 * Fábrica de la aplicación Express. Recibe los repositorios ya construidos
 * (inyección de dependencias): en producción son de Mongo; en pruebas, en memoria.
 */
function createApp({ songRepository, playlistRepository, config = {}, logger = console }) {
  const { corsOrigins = '*', rateLimitMax = 300, isProduction = false } = config;
  const songService = new SongService({ songRepository, playlistRepository });
  const playlistService = new PlaylistService({ playlistRepository, songRepository });

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: corsOrigins === '*' ? true : corsOrigins }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ message: 'API funcionando correctamente' }));
  app.use('/api/songs', createSongRoutes(songService));
  app.use('/api/playlists', createPlaylistRoutes(playlistService));

  app.use(notFoundHandler);
  app.use(createErrorHandler({ isProduction, logger }));
  return app;
}

module.exports = createApp;
