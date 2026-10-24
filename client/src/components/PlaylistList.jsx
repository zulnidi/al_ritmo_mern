import ResourceSection from './ResourceSection';
import { playlistService } from '../services/api';

const PREVIEW = 3;

export default function PlaylistList() {
  return (
    <ResourceSection
      className="playlist-list"
      title="Playlists"
      newLabel="Nueva Playlist"
      newPath="/playlists/new"
      editPath={(id) => `/playlists/edit/${id}`}
      service={playlistService}
      emptyText="No hay playlists disponibles"
      deleteConfirm="¿Estás seguro de eliminar esta playlist?"
      renderItem={(playlist) => (
        <>
          <h3>{playlist.name}</h3>
          <p>
            <strong>Canciones:</strong> {playlist.songs.length}
          </p>
          {playlist.songs.length > 0 && (
            <ul className="playlist-songs">
              {playlist.songs.slice(0, PREVIEW).map((song) => (
                <li key={song._id}>
                  {song.title} - {song.artist}
                </li>
              ))}
              {playlist.songs.length > PREVIEW && (
                <li>… y {playlist.songs.length - PREVIEW} más</li>
              )}
            </ul>
          )}
        </>
      )}
    />
  );
}
