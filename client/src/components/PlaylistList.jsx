import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playlistService } from '../services/api';

const PlaylistList = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const response = await playlistService.getAll();
            setPlaylists(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar las playlists');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta playlist?')) {
            try {
                await playlistService.delete(id);
                fetchPlaylists();
            } catch (err) {
                setError('Error al eliminar la playlist');
            }
        }
    };

    if (loading) return <div className="loading">Cargando playlists...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="playlist-list">
            <div className="header">
                <h2>Playlists</h2>
                <Link to="/playlists/new" className="btn btn-primary">
                    Nueva Playlist
                </Link>
            </div>

            <div className="playlists-container">
                {playlists.length === 0 ? (
                    <p>No hay playlists disponibles</p>
                ) : (
                    playlists.map(playlist => (
                        <div key={playlist._id} className="playlist-card">
                            <div className="playlist-info">
                                <h3>{playlist.name}</h3>
                                <p><strong>Canciones:</strong> {playlist.songs.length}</p>
                                
                                {playlist.songs.length > 0 && (
                                    <div className="playlist-songs">
                                        <ul>
                                            {playlist.songs.slice(0, 3).map(song => (
                                                <li key={song._id}>
                                                    {song.title} - {song.artist}
                                                </li>
                                            ))}
                                            {playlist.songs.length > 3 && (
                                                <li>... y {playlist.songs.length - 3} más</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="playlist-actions">
                                <Link 
                                    to={`/playlists/edit/${playlist._id}`} 
                                    className="btn btn-edit"
                                >
                                    Editar
                                </Link>
                                <button
                                    onClick={() => handleDelete(playlist._id)}
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

export default PlaylistList;