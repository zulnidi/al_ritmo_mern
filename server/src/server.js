require('dotenv').config();
const mongoose = require('mongoose');
const createApp = require('./app');
const { loadConfig } = require('./config/env');
const connectDB = require('./config/db');
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');
const MongoSongRepository = require('./repositories/MongoSongRepository');
const MongoPlaylistRepository = require('./repositories/MongoPlaylistRepository');

/** Composition root: aquí (y solo aquí) se conectan las implementaciones reales. */
async function main() {
  const config = loadConfig();
  await connectDB(config.mongoUri);

  const app = createApp({
    songRepository: new MongoSongRepository(Song),
    playlistRepository: new MongoPlaylistRepository(Playlist),
    config,
  });

  const server = app.listen(config.port, () =>
    console.log(`Servidor corriendo en http://localhost:${config.port}`),
  );

  const shutdown = () => server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
