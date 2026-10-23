# 🎵 Al Ritmo MERN

Aplicación **full stack** para gestionar canciones y playlists. Permite crear, listar, editar y eliminar canciones, y armar playlists asociando canciones existentes.

Proyecto académico construido con el stack **MERN** (MongoDB, Express, React, Node.js).

## ✨ Funcionalidades

- CRUD completo de **canciones** (título, artista, género y álbum).
- CRUD de **playlists** con canciones asociadas.
- Validaciones en el servidor (longitudes, campos requeridos, nombre de playlist único) con mensajes de error claros.
- Navegación entre páginas con React Router y página 404.
- Manejo centralizado de errores en el backend y en el cliente.

## 🧱 Tecnologías

| Capa | Tecnologías |
|------|-------------|
| Frontend | React 19, React Router 7, Axios, Create React App |
| Backend | Node.js, Express 5, Mongoose 9, CORS, dotenv |
| Base de datos | MongoDB |

## 📁 Estructura

```
al_ritmo_mern/
├── client/            # Aplicación React
│   └── src/
│       ├── components/  # Formularios y listas (SongForm, PlaylistList, ...)
│       ├── pages/       # Home, NotFound
│       └── services/    # Cliente Axios (api.js)
└── server/            # API REST con Express
    ├── config/          # Conexión a MongoDB
    ├── middleware/      # Manejo de errores
    ├── models/          # Song, Playlist
    └── routes/          # songRoutes, playlistRoutes
```

## 🔌 API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Verifica que la API esté activa |
| GET / POST | `/api/songs` | Listar / crear canciones |
| GET / PUT / DELETE | `/api/songs/:id` | Ver / editar / eliminar una canción |
| GET / POST | `/api/playlists` | Listar (con sus canciones) / crear playlists |
| GET / PUT / DELETE | `/api/playlists/:id` | Ver / editar / eliminar una playlist |

## 🚀 Cómo ejecutarlo

Necesitas Node.js y una base MongoDB (local o Atlas).

**1. Servidor**

```bash
cd server
npm install
```

Crea un archivo `.env` en `server/`:

```
MONGODB_URI=tu_cadena_de_conexion
PORT=5000
```

```bash
npm run dev      # con nodemon
# o
npm start
```

**2. Cliente**

```bash
cd client
npm install
npm start
```

La app abre en `http://localhost:3000` y consume la API en `http://localhost:5000/api`.

## 🔮 Próximos pasos

- Pruebas automatizadas para la API.
- Despliegue (cliente y servidor) y variable de entorno para la URL de la API.
- Autenticación de usuarios.

## 👩‍💻 Autora

**Zullie Nicole Díaz López**: [GitHub](https://github.com/zulnidi)
