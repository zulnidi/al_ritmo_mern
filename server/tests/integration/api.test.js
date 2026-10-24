const { buildApp, validSong } = require('../helpers/buildApp');

const createSong = async (api, extra) => (await api.post('/api/songs').send(validSong(extra))).body;

describe('infraestructura', () => {
  it('health, 404 y cabeceras de seguridad', async () => {
    const { api } = buildApp();
    const health = await api.get('/api/health');
    expect(health.status).toBe(200);
    expect(health.headers['x-powered-by']).toBeUndefined();
    expect(health.headers['x-content-type-options']).toBe('nosniff');
    const missing = await api.get('/api/nada');
    expect(missing.status).toBe(404);
    expect(missing.body.message).toMatch(/Ruta no encontrada/);
  });

  it('400 con JSON inválido', async () => {
    const { api } = buildApp();
    const res = await api.post('/api/songs').set('content-type', 'application/json').send('{mal');
    expect(res.status).toBe(400);
  });

  it('limita las peticiones', async () => {
    const { api } = buildApp({ config: { rateLimitMax: 2 } });
    await api.get('/api/health');
    await api.get('/api/health');
    expect((await api.get('/api/health')).status).toBe(429);
  });

  it('500 sin filtrar detalles en producción', async () => {
    const logger = { error: jest.fn() };
    const songRepository = {
      list: async () => {
        throw new Error('secreto interno');
      },
    };
    const { api } = buildApp({ songRepository, logger, config: { isProduction: true } });
    const res = await api.get('/api/songs');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/secreto|stack/);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});

describe('/api/songs', () => {
  it('crea (201) y obtiene', async () => {
    const { api } = buildApp();
    const created = await api.post('/api/songs').send(validSong());
    expect(created.status).toBe(201);
    const got = await api.get(`/api/songs/${created.body._id}`);
    expect(got.body).toMatchObject({ title: 'Waka Waka', genre: 'Pop' });
  });

  it('valida el cuerpo con mensajes por campo', async () => {
    const { api } = buildApp();
    const res = await api.post('/api/songs').send({ title: 'A', artist: '', genre: 'P' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fields).sort()).toEqual(['artist', 'genre', 'title']);
  });

  it('rechaza ids mal formados y campos desconocidos se ignoran', async () => {
    const { api } = buildApp();
    expect((await api.get('/api/songs/abc')).status).toBe(400);
    const res = await api.post('/api/songs').send(validSong({ admin: true }));
    expect(res.body.admin).toBeUndefined();
  });

  it('lista con arreglo en el cuerpo y paginación en cabeceras', async () => {
    const { api } = buildApp();
    for (const [title, genre] of [
      ['Uno', 'Pop'],
      ['Dos', 'Rock'],
      ['Tres', 'Pop'],
    ]) {
      await createSong(api, { title, genre });
    }
    const res = await api.get('/api/songs?limit=2&page=1');
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.headers['x-total-count']).toBe('3');
    expect(res.headers['x-total-pages']).toBe('2');
    expect((await api.get('/api/songs?genre=pop')).body).toHaveLength(2);
    expect((await api.get('/api/songs?search=dos')).body).toHaveLength(1);
    expect((await api.get('/api/songs?limit=500')).status).toBe(400);
  });

  it('PUT actualiza parcialmente y exige al menos un campo', async () => {
    const { api } = buildApp();
    const { _id } = await createSong(api);
    const ok = await api.put(`/api/songs/${_id}`).send({ genre: 'Latino' });
    expect(ok.body).toMatchObject({ genre: 'Latino', artist: 'Shakira' });
    expect((await api.put(`/api/songs/${_id}`).send({})).status).toBe(400);
    expect((await api.put(`/api/songs/${'a'.repeat(24)}`).send({ genre: 'Pop' })).status).toBe(404);
  });

  it('DELETE responde con mensaje y luego 404', async () => {
    const { api } = buildApp();
    const { _id } = await createSong(api);
    expect((await api.delete(`/api/songs/${_id}`)).body.message).toBe('Canción eliminada');
    expect((await api.delete(`/api/songs/${_id}`)).status).toBe(404);
  });
});

describe('/api/playlists', () => {
  it('crea con canciones y devuelve las canciones pobladas', async () => {
    const { api } = buildApp();
    const song = await createSong(api);
    const res = await api
      .post('/api/playlists')
      .send({ name: 'Favoritas', songs: [song._id, song._id] });
    expect(res.status).toBe(201);
    expect(res.body.songs).toHaveLength(1);
    expect(res.body.songs[0].title).toBe('Waka Waka');
  });

  it('409 con nombre repetido y 400 con canciones inexistentes', async () => {
    const { api } = buildApp();
    await api.post('/api/playlists').send({ name: 'Mix' });
    expect((await api.post('/api/playlists').send({ name: 'Mix' })).status).toBe(409);
    const bad = await api.post('/api/playlists').send({ name: 'Otra', songs: ['a'.repeat(24)] });
    expect(bad.status).toBe(400);
    expect((await api.post('/api/playlists').send({ name: 'X' })).status).toBe(400);
  });

  it('agrega y quita canciones', async () => {
    const { api } = buildApp();
    const song = await createSong(api);
    const { body: playlist } = await api.post('/api/playlists').send({ name: 'Mix' });
    const added = await api.post(`/api/playlists/${playlist._id}/songs`).send({ songId: song._id });
    expect(added.body.songs).toHaveLength(1);
    const removed = await api.delete(`/api/playlists/${playlist._id}/songs/${song._id}`);
    expect(removed.body.songs).toEqual([]);
    expect(
      (await api.post(`/api/playlists/${playlist._id}/songs`).send({ songId: 'a'.repeat(24) }))
        .status,
    ).toBe(404);
    expect((await api.post(`/api/playlists/${playlist._id}/songs`).send({})).status).toBe(400);
  });

  it('lista, busca, actualiza y elimina', async () => {
    const { api } = buildApp();
    const { body: p } = await api.post('/api/playlists').send({ name: 'Rock clásico' });
    await api.post('/api/playlists').send({ name: 'Pop actual' });
    const list = await api.get('/api/playlists?search=rock');
    expect(list.body).toHaveLength(1);
    expect(list.headers['x-total-count']).toBe('1');
    expect((await api.put(`/api/playlists/${p._id}`).send({ name: 'Rock 90s' })).body.name).toBe(
      'Rock 90s',
    );
    expect((await api.put(`/api/playlists/${p._id}`).send({ name: 'Pop actual' })).status).toBe(
      409,
    );
    expect((await api.get(`/api/playlists/${p._id}`)).status).toBe(200);
    expect((await api.delete(`/api/playlists/${p._id}`)).body.message).toBe('Playlist eliminada');
    expect((await api.get(`/api/playlists/${p._id}`)).status).toBe(404);
  });

  it('borrar una canción la elimina de las playlists', async () => {
    const { api } = buildApp();
    const song = await createSong(api);
    const { body: p } = await api.post('/api/playlists').send({ name: 'Mix', songs: [song._id] });
    await api.delete(`/api/songs/${song._id}`);
    expect((await api.get(`/api/playlists/${p._id}`)).body.songs).toEqual([]);
  });
});
