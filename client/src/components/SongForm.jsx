import { useNavigate, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import FormField from './ui/FormField';
import FormActions from './ui/FormActions';
import { useAsyncData } from '../hooks/useAsyncData';
import { useResourceForm } from '../hooks/useResourceForm';
import { songService } from '../services/api';
import { compose, maxLength, minLength, required } from '../lib/validation';

const schema = {
  title: compose(required('El título'), minLength('El título', 2), maxLength('El título', 100)),
  artist: compose(required('El artista'), minLength('El artista', 2), maxLength('El artista', 100)),
  genre: compose(required('El género'), minLength('El género', 2), maxLength('El género', 50)),
  album: maxLength('El álbum', 100),
};
const EMPTY = { title: '', artist: '', genre: '', album: '' };

export default function SongForm({ isEdit = false }) {
  const { id } = useParams();
  const loader = useCallback(
    () => (isEdit ? songService.getById(id) : Promise.resolve(EMPTY)),
    [isEdit, id],
  );
  const { data, loading, error } = useAsyncData(loader, EMPTY);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error)
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  return <SongFormBody isEdit={isEdit} id={id} initial={{ ...EMPTY, ...data }} />;
}

function SongFormBody({ isEdit, id, initial }) {
  const navigate = useNavigate();
  const form = useResourceForm({
    initialValues: initial,
    schema,
    onSubmit: async (values) => {
      if (isEdit) await songService.update(id, values);
      else await songService.create(values);
      navigate('/');
    },
  });
  const { values, errors, handleChange } = form;

  return (
    <div className="song-form">
      <h2>{isEdit ? 'Editar Canción' : 'Nueva Canción'}</h2>
      {form.formError && (
        <div className="alert alert-danger" role="alert">
          {form.formError}
        </div>
      )}
      <form onSubmit={form.handleSubmit} noValidate>
        <FormField
          id="title"
          label="Título"
          required
          value={values.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Ej: November Rain"
        />
        <FormField
          id="artist"
          label="Artista"
          required
          value={values.artist}
          onChange={handleChange}
          error={errors.artist}
          placeholder="Ej: Guns N' Roses"
        />
        <FormField
          id="genre"
          label="Género"
          required
          value={values.genre}
          onChange={handleChange}
          error={errors.genre}
          placeholder="Ej: Rock"
        />
        <FormField
          id="album"
          label="Álbum"
          value={values.album}
          onChange={handleChange}
          error={errors.album}
          placeholder="Ej: Use Your Illusion I"
        />
        <FormActions submitting={form.submitting} isEdit={isEdit} />
      </form>
    </div>
  );
}
