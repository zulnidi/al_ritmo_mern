const request = require('supertest');
const createApp = require('../../src/app');
const InMemorySongRepository = require('../../src/repositories/memory/InMemorySongRepository');
const InMemoryPlaylistRepository = require('../../src/repositories/memory/InMemoryPlaylistRepository');

/** Construye la app con repositorios en memoria: sin Mongo, sin red, determinista. */
function buildApp({
  config,
  logger = { error: () => {} },
  songRepository,
  playlistRepository,
} = {}) {
  const songs = songRepository || new InMemorySongRepository();
  const playlists = playlistRepository || new InMemoryPlaylistRepository(songs);
  const app = createApp({
    songRepository: songs,
    playlistRepository: playlists,
    config: { corsOrigins: '*', rateLimitMax: 10000, ...config },
    logger,
  });
  return { app, api: request(app), songs, playlists };
}

const validSong = (extra = {}) => ({
  title: 'Waka Waka',
  artist: 'Shakira',
  genre: 'Pop',
  album: 'Sale el Sol',
  ...extra,
});

module.exports = { buildApp, validSong };
