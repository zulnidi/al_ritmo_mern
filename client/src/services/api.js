import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para manejar errores
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // El servidor respondió con un código de error
            return Promise.reject({
                message: error.response.data.message || 'Error del servidor',
                errors: error.response.data.errors || [],
                status: error.response.status
            });
        } else if (error.request) {
            // La petición fue hecha pero no hubo respuesta
            return Promise.reject({
                message: 'No se pudo conectar con el servidor',
                errors: [],
                status: 0
            });
        } else {
            // Algo pasó al configurar la petición
            return Promise.reject({
                message: error.message,
                errors: [],
                status: 0
            });
        }
    }
);

// Servicios para canciones
export const songService = {
    getAll: () => api.get('/songs'),
    getById: (id) => api.get(`/songs/${id}`),
    create: (songData) => api.post('/songs', songData),
    update: (id, songData) => api.put(`/songs/${id}`, songData),
    delete: (id) => api.delete(`/songs/${id}`)
};

// Servicios para playlists
export const playlistService = {
    getAll: () => api.get('/playlists'),
    getById: (id) => api.get(`/playlists/${id}`),
    create: (playlistData) => api.post('/playlists', playlistData),
    update: (id, playlistData) => api.put(`/playlists/${id}`, playlistData),
    delete: (id) => api.delete(`/playlists/${id}`),
    addSong: (playlistId, songId) => api.post(`/playlists/${playlistId}/songs`, { songId }),
    removeSong: (playlistId, songId) => api.delete(`/playlists/${playlistId}/songs/${songId}`)
};

export default api;