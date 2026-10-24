import ResourceSection from './ResourceSection';
import { songService } from '../services/api';

export default function SongList() {
  return (
    <ResourceSection
      className="song-list"
      title="Canciones"
      newLabel="Nueva Canción"
      newPath="/songs/new"
      editPath={(id) => `/songs/edit/${id}`}
      service={songService}
      emptyText="No hay canciones disponibles"
      deleteConfirm="¿Estás seguro de eliminar esta canción?"
      renderItem={(song) => (
        <>
          <h3>{song.title}</h3>
          <p>
            <strong>Artista:</strong> {song.artist}
          </p>
          <p>
            <strong>Género:</strong> {song.genre}
          </p>
          {song.album && (
            <p>
              <strong>Álbum:</strong> {song.album}
            </p>
          )}
        </>
      )}
    />
  );
}
