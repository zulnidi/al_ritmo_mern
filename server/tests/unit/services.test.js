const AppError = require('../../src/errors/AppError');
const SongService = require('../../src/services/SongService');
const PlaylistService = require('../../src/services/PlaylistService');
const InMemorySongRepository = require('../../src/repositories/memory/InMemorySongRepository');
const InMemoryPlaylistRepository = require('../../src/repositories/memory/InMemoryPlaylistRepository');
const { validSong } = require('../helpers/buildApp');

let songs, playlists, songService, playlistService;
beforeEach(() => {
  songs = new InMemorySongRepository();
  playlists = new InMemoryPlaylistRepository(songs);
  songService = new SongService({ songRepository: songs, playlistRepository: playlists });
  playlistService = new PlaylistService({ playlistRepository: playlists, songRepository: songs });
});

const notFound = expect.objectContaining({ statusCode: 404 });

describe('SongService', () => {
  it('crea, obtiene y actualiza', async () => {
    const created = await songService.create(validSong());
    expect(await songService.get(created._id)).toMatchObject({ title: 'Waka Waka' });
    const updated = await songService.update(created._id, { genre: 'Latino' });
    expect(updated).toMatchObject({ genre: 'Latino', artist: 'Shakira' });
  });

  it('lanza 404 si no existe', async () => {
    await expect(songService.get('x')).rejects.toEqual(notFound);
    await expect(songService.update('x', { genre: 'Pop' })).rejects.toEqual(notFound);
    await expect(songService.remove('x')).rejects.toEqual(notFound);
  });

  it('pagina y filtra con metadatos', async () => {
    for (const title of ['Uno', 'Dos', 'Tres']) await songService.create(validSong({ title }));
    const { items, meta } = await songService.list({ page: 2, limit: 2 });
    expect(items).toHaveLength(1);
    expect(meta).toEqual({ total: 3, page: 2, limit: 2, totalPages: 2 });
    const found = await songService.list({ page: 1, limit: 10, search: 'tre' });
    expect(found.items.map((s) => s.title)).toEqual(['Tres']);
  });

  it('al borrar una canción la quita de las playlists', async () => {
    const song = await songService.create(validSong());
    const playlist = await playlistService.create({ name: 'Favoritas', songs: [song._id] });
    await songService.remove(song._id);
    expect((await playlistService.get(playlist._id)).songs).toEqual([]);
  });
});

describe('PlaylistService', () => {
  it('rechaza canciones inexistentes al crear y actualizar', async () => {
    await expect(
      playlistService.create({ name: 'Mix', songs: ['a'.repeat(24)] }),
    ).rejects.toBeInstanceOf(AppError);
    const p = await playlistService.create({ name: 'Mix' });
    await expect(playlistService.update(p._id, { songs: ['b'.repeat(24)] })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('no permite nombres repetidos', async () => {
    await playlistService.create({ name: 'Mix' });
    await expect(playlistService.create({ name: 'Mix' })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('agrega una canción sin duplicarla y la quita', async () => {
    const song = await songService.create(validSong());
    const p = await playlistService.create({ name: 'Mix' });
    await playlistService.addSong(p._id, song._id);
    const again = await playlistService.addSong(p._id, song._id);
    expect(again.songs).toHaveLength(1);
    expect((await playlistService.removeSong(p._id, song._id)).songs).toEqual([]);
  });

  it('lanza 404 con playlists o canciones inexistentes', async () => {
    await expect(playlistService.get('x')).rejects.toEqual(notFound);
    await expect(playlistService.update('x', { name: 'Nuevo' })).rejects.toEqual(notFound);
    await expect(playlistService.remove('x')).rejects.toEqual(notFound);
    await expect(playlistService.addSong('x', 'y')).rejects.toEqual(notFound);
    await expect(playlistService.removeSong('x', 'y')).rejects.toEqual(notFound);
    const p = await playlistService.create({ name: 'Mix' });
    await expect(playlistService.addSong(p._id, 'y')).rejects.toEqual(notFound);
  });

  it('busca y pagina', async () => {
    await playlistService.create({ name: 'Rock clásico' });
    await playlistService.create({ name: 'Pop actual' });
    const { items, meta } = await playlistService.list({ page: 1, limit: 10, search: 'rock' });
    expect(items).toHaveLength(1);
    expect(meta.total).toBe(1);
  });
});
