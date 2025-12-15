import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { songService } from '../services/api';

const SongList = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            setLoading(true);
            const response = await songService.getAll();
            setSongs(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar las canciones');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta canción?')) {
            try {
                await songService.delete(id);
                fetchSongs();
            } catch (err) {
                setError('Error al eliminar la canción');
            }
        }
    };

    if (loading) return <div className="loading">Cargando canciones...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="song-list">
            <div className="header">
                <h2>Canciones</h2>
                <Link to="/songs/new" className="btn btn-primary">
                    Nueva Canción
                </Link>
            </div>

            <div className="songs-container">
                {songs.length === 0 ? (
                    <p>No hay canciones disponibles</p>
                ) : (
                    songs.map(song => (
                        <div key={song._id} className="song-card">
                            <div className="song-info">
                                <h3>{song.title}</h3>
                                <p><strong>Artista:</strong> {song.artist}</p>
                                <p><strong>Género:</strong> {song.genre}</p>
                                {song.album && <p><strong>Álbum:</strong> {song.album}</p>}
                            </div>
                            <div className="song-actions">
                                <Link 
                                    to={`/songs/edit/${song._id}`} 
                                    className="btn btn-edit"
                                >
                                    Editar
                                </Link>
                                <button
                                    onClick={() => handleDelete(song._id)}
                                    className="btn btn-delete"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SongList;