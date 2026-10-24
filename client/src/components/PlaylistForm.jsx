import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import FormField from './ui/FormField';
import FormActions from './ui/FormActions';
import { useAsyncData } from '../hooks/useAsyncData';
import { useResourceForm } from '../hooks/useResourceForm';
import { playlistService, songService } from '../services/api';
import { compose, maxLength, minLength, required } from '../lib/validation';

const schema = {
  name: compose(required('El nombre'), minLength('El nombre', 2), maxLength('El nombre', 100)),
};

export default function PlaylistForm({ isEdit = false }) {
  const { id } = useParams();
  const loader = useCallback(async () => {
    const [songs, playlist] = await Promise.all([
      songService.getAll(),
      isEdit ? playlistService.getById(id) : Promise.resolve({ name: '', songs: [] }),
    ]);
    return { songs, name: playlist.name, songIds: playlist.songs.map((s) => s._id) };
  }, [isEdit, id]);
  const { data, loading, error } = useAsyncData(loader);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error || !data)
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  return <PlaylistFormBody isEdit={isEdit} id={id} data={data} />;
}

function PlaylistFormBody({ isEdit, id, data }) {
  const navigate = useNavigate();
  const [selectedSongId, setSelectedSongId] = useState('');
  const form = useResourceForm({
    initialValues: { name: data.name, songs: data.songIds },
    schema,
    onSubmit: async (values) => {
      if (isEdit) await playlistService.update(id, values);
      else await playlistService.create(values);
      navigate('/');
    },
  });
  const { values, errors } = form;
  const songsById = new Map(data.songs.map((s) => [s._id, s]));

  const addSong = () => {
    if (selectedSongId && !values.songs.includes(selectedSongId)) {
      form.setField('songs', [...values.songs, selectedSongId]);
      setSelectedSongId('');
    }
  };
  const removeSong = (songId) =>
    form.setField(
      'songs',
      values.songs.filter((s) => s !== songId),
    );

  return (
    <div className="playlist-form">
      <h2>{isEdit ? 'Editar Playlist' : 'Nueva Playlist'}</h2>
      {form.formError && (
        <div className="alert alert-danger" role="alert">
          {form.formError}
        </div>
      )}
      <form onSubmit={form.handleSubmit} noValidate>
        <FormField
          id="name"
          label="Nombre de la Playlist"
          required
          value={values.name}
          onChange={form.handleChange}
          error={errors.name}
          placeholder="Ej: Mis Favoritas de Rock"
        />

        <div className="form-group">
          <label htmlFor="song-select">Canciones en la Playlist</label>
          <div className="songs-selection">
            <select
              id="song-select"
              className="song-select"
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(e.target.value)}
            >
              <option value="">Seleccionar canción...</option>
              {data.songs.map((song) => (
                <option key={song._id} value={song._id}>
                  {song.title} - {song.artist}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-small" onClick={addSong}>
              Agregar
            </button>
          </div>
          <ul className="selected-songs" aria-label="Canciones seleccionadas">
            {values.songs
              .filter((sid) => songsById.has(sid))
              .map((sid) => {
                const song = songsById.get(sid);
                return (
                  <li key={sid} className="selected-song-item">
                    <span>
                      {song.title} - {song.artist}
                    </span>
                    <button
                      type="button"
                      className="btn-remove"
                      aria-label={`Quitar ${song.title}`}
                      onClick={() => removeSong(sid)}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>

        <FormActions submitting={form.submitting} isEdit={isEdit} />
      </form>
    </div>
  );
}
