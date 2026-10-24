import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import SongForm from './components/SongForm';
import PlaylistForm from './components/PlaylistForm';

/** El Router vive en main.jsx para poder probar App con MemoryRouter. */
export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/songs/new" element={<SongForm />} />
        <Route path="/songs/edit/:id" element={<SongForm isEdit />} />
        <Route path="/playlists/new" element={<PlaylistForm />} />
        <Route path="/playlists/edit/:id" element={<PlaylistForm isEdit />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
