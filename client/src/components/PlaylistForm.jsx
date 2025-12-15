import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { playlistService, songService } from '../services/api';

const PlaylistForm = ({ isEdit = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [formData, setFormData] = useState({
        name: '',
        songs: []
    });
    
    const [availableSongs, setAvailableSongs] = useState([]);
    const [selectedSongId, setSelectedSongId] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchAvailableSongs();
        
        if (isEdit && id) {
            fetchPlaylist();
        }
    }, [isEdit, id]);

    const fetchPlaylist = async () => {
        try {
            setLoading(true);
            const response = await playlistService.getById(id);
            setFormData({
                name: response.data.name,
                songs: response.data.songs.map(song => song._id)
            });
            setFormError('');
        } catch (err) {
            setFormError('Error al cargar la playlist');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSongs = async () => {
        try {
            const response = await songService.getAll();
            setAvailableSongs(response.data);
        } catch (err) {
            console.error('Error al cargar canciones:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleAddSong = () => {
        if (selectedSongId && !formData.songs.includes(selectedSongId)) {
            setFormData(prev => ({
                ...prev,
                songs: [...prev.songs, selectedSongId]
            }));
            setSelectedSongId('');
        }
    };

    const handleRemoveSong = (songId) => {
        setFormData(prev => ({
            ...prev,
            songs: prev.songs.filter(id => id !== songId)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'El nombre debe tener al menos 2 caracteres';
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
                await playlistService.update(id, formData);
            } else {
                await playlistService.create(formData);
            }
            navigate('/');
        } catch (err) {
            if (err.errors && Array.isArray(err.errors)) {
                const serverErrors = {};
                err.errors.forEach(errorMsg => {
                    if (errorMsg.includes('nombre')) serverErrors.name = errorMsg;
                });
                setErrors(serverErrors);
            } else {
                setFormError(err.message || 'Error al guardar la playlist');
            }
        } finally {
            setLoading(false);
        }
    };

    const getSongById = (songId) => {
        return availableSongs.find(song => song._id === songId);
    };

    if (loading && isEdit) return <div>Cargando...</div>;

    return (
        <div className="playlist-form">
            <h2>{isEdit ? 'Editar Playlist' : 'Nueva Playlist'}</h2>
            
            {formError && <div className="alert alert-danger">{formError}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nombre de la Playlist *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                        placeholder="Ej: Mis Favoritas de Rock"
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-group">
                    <label>Canciones en la Playlist</label>
                    <div className="songs-selection">
                        <select
                            value={selectedSongId}
                            onChange={(e) => setSelectedSongId(e.target.value)}
                            className="song-select"
                        >
                            <option value="">Seleccionar canción...</option>
                            {availableSongs.map(song => (
                                <option key={song._id} value={song._id}>
                                    {song.title} - {song.artist}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleAddSong}
                            className="btn btn-small"
                        >
                            Agregar
                        </button>
                    </div>

                    <div className="selected-songs">
                        {formData.songs.map(songId => {
                            const song = getSongById(songId);
                            return song ? (
                                <div key={songId} className="selected-song-item">
                                    <span>{song.title} - {song.artist}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSong(songId)}
                                        className="btn-remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : null;
                        })}
                    </div>
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

export default PlaylistForm;