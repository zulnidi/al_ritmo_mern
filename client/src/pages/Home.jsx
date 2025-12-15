import React from 'react';
import SongList from '../components/SongList';
import PlaylistList from '../components/PlaylistList';

const Home = () => {
    return (
        <div className="home">
            <header className="app-header">
                <h1>🎵 Mi App Musical</h1>
                <p>Gestiona tus canciones y playlists favoritas</p>
            </header>
            
            <main className="main-content">
                <SongList />
                <PlaylistList />
            </main>
        </div>
    );
};

export default Home;