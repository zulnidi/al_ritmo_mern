import http from './http';

/** Fábrica de servicios CRUD: canciones y playlists comparten el mismo contrato REST. */
function createResourceService(path) {
  return {
    getAll: async () => (await http.get(path)).data,
    getById: async (id) => (await http.get(`${path}/${id}`)).data,
    create: async (data) => (await http.post(path, data)).data,
    update: async (id, data) => (await http.put(`${path}/${id}`, data)).data,
    delete: async (id) => (await http.delete(`${path}/${id}`)).data,
  };
}

export const songService = createResourceService('/songs');
export const playlistService = createResourceService('/playlists');
