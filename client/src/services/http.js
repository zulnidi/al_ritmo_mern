import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Convierte cualquier error de axios en un objeto uniforme:
 * { message, errors: string[], fields: {campo: mensaje}, status }.
 * Así los componentes nunca dependen de la forma interna de axios.
 */
export function normalizeError(error) {
  if (error.response) {
    const { data = {}, status } = error.response;
    const errors = data.errors || [];
    return {
      message: data.message || errors[0] || 'Error del servidor',
      errors,
      fields: data.fields || {},
      status,
    };
  }
  if (error.request) {
    return { message: 'No se pudo conectar con el servidor', errors: [], fields: {}, status: 0 };
  }
  return { message: error.message, errors: [], fields: {}, status: 0 };
}

const http = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });
http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);

export default http;
