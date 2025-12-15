import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SongForm from './components/SongForm';
import EditSong from './components/EditSong';
import PlaylistForm from './components/PlaylistForm';
import EditPlaylist from './components/EditPlaylist';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/songs/new" element={<SongForm />} />
                    <Route path="/songs/edit/:id" element={<EditSong />} />
                    <Route path="/playlists/new" element={<PlaylistForm />} />
                    <Route path="/playlists/edit/:id" element={<EditPlaylist />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;