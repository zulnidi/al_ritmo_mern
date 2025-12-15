import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { songService } from '../services/api';

const SongForm = ({ isEdit = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        genre: '',
        album: ''
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (isEdit && id) {
            fetchSong();
        }
    }, [isEdit, id]);

    const fetchSong = async () => {
        try {
            setLoading(true);
            const response = await songService.getById(id);
            setFormData(response.data);
            setFormError('');
        } catch (err) {
            setFormError('Error al cargar la canción');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error específico cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        } else if (formData.title.trim().length < 2) {
            newErrors.title = 'El título debe tener al menos 2 caracteres';
        }
        
        if (!formData.artist.trim()) {
            newErrors.artist = 'El artista es requerido';
        } else if (formData.artist.trim().length < 2) {
            newErrors.artist = 'El artista debe tener al menos 2 caracteres';
        }
        
        if (!formData.genre.trim()) {
            newErrors.genre = 'El género es requerido';
        } else if (formData.genre.trim().length < 2) {
            newErrors.genre = 'El género debe tener al menos 2 caracteres';
        }
        
        if (formData.album && formData.album.trim().length > 100) {
            newErrors.album = 'El álbum no puede exceder 100 caracteres';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setFormError('');

        try {
            if (isEdit) {
                await songService.update(id, formData);
            } else {
                await songService.create(formData);
            }
            navigate('/');
        } catch (err) {
            if (err.errors && Array.isArray(err.errors)) {
                // Errores de validación del servidor
                const serverErrors = {};
                err.errors.forEach(errorMsg => {
                    if (errorMsg.includes('título')) serverErrors.title = errorMsg;
                    else if (errorMsg.includes('artista')) serverErrors.artist = errorMsg;
                    else if (errorMsg.includes('género')) serverErrors.genre = errorMsg;
                    else if (errorMsg.includes('álbum')) serverErrors.album = errorMsg;
                });
                setErrors(serverErrors);
            } else {
                setFormError(err.message || 'Error al guardar la canción');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) return <div>Cargando...</div>;

    return (
        <div className="song-form">
            <h2>{isEdit ? 'Editar Canción' : 'Nueva Canción'}</h2>
            
            {formError && <div className="alert alert-danger">{formError}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Título *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={errors.title ? 'error' : ''}
                        placeholder="Ej: November Rain"
                    />
                    {errors.title && <div className="error-message">{errors.title}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="artist">Artista *</label>
                    <input
                        type="text"
                        id="artist"
                        name="artist"
                        value={formData.artist}
                        onChange={handleChange}
                        className={errors.artist ? 'error' : ''}
                        placeholder="Ej: Guns N' Roses"
                    />
                    {errors.artist && <div className="error-message">{errors.artist}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="genre">Género *</label>
                    <input
                        type="text"
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        className={errors.genre ? 'error' : ''}
                        placeholder="Ej: Rock, Power Ballads"
                    />
                    {errors.genre && <div className="error-message">{errors.genre}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="album">Álbum</label>
                    <input
                        type="text"
                        id="album"
                        name="album"
                        value={formData.album}
                        onChange={handleChange}
                        className={errors.album ? 'error' : ''}
                        placeholder="Ej: Use Your Illusion I"
                    />
                    {errors.album && <div className="error-message">{errors.album}</div>}
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/')}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SongForm;