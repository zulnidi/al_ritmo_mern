import SongList from '../components/SongList';
import PlaylistList from '../components/PlaylistList';

export default function Home() {
  return (
    <div className="home">
      <header className="app-header">
        <h1>🎵 Al Ritmo</h1>
        <p>Gestiona tus canciones y playlists favoritas</p>
      </header>
      <main className="main-content">
        <SongList />
        <PlaylistList />
      </main>
    </div>
  );
}
