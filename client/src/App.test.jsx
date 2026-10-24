import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { songService, playlistService } from './services/api';
import { renderApp } from './test/render';
import { playlist, song } from './test/fixtures';

vi.mock('./services/api', () => ({
  songService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  playlistService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  songService.getAll.mockResolvedValue([song()]);
  playlistService.getAll.mockResolvedValue([playlist()]);
});

describe('Home', () => {
  it('muestra canciones y playlists', async () => {
    renderApp();
    const songs = await screen.findByRole('region', { name: 'Canciones' });
    expect(within(songs).getByText('Waka Waka')).toBeInTheDocument();
    const lists = screen.getByRole('region', { name: 'Playlists' });
    expect(await within(lists).findByText('Favoritas')).toBeInTheDocument();
    expect(within(lists).getByText('Waka Waka - Shakira')).toBeInTheDocument();
  });

  it('muestra estado vacío y error con reintento', async () => {
    songService.getAll.mockResolvedValueOnce([]).mockRejectedValue({ message: 'Sin conexión' });
    playlistService.getAll.mockRejectedValueOnce({ message: 'Sin conexión' }).mockResolvedValue([]);
    renderApp();
    expect(await screen.findByText('No hay canciones disponibles')).toBeInTheDocument();
    expect(await screen.findByText(/Sin conexión/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('No hay playlists disponibles')).toBeInTheDocument();
  });

  it('elimina tras confirmar y recarga', async () => {
    songService.delete.mockResolvedValue({});
    songService.getAll.mockResolvedValueOnce([song()]).mockResolvedValueOnce([]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp();
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar Waka Waka' }));
    expect(songService.delete).toHaveBeenCalledWith('s1');
    expect(await screen.findByText('No hay canciones disponibles')).toBeInTheDocument();
  });

  it('no elimina si el usuario cancela, y muestra el error si falla', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderApp();
    const button = await screen.findByRole('button', { name: 'Eliminar Waka Waka' });
    await userEvent.click(button);
    expect(songService.delete).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    songService.delete.mockRejectedValue({ message: 'No se pudo eliminar' });
    await userEvent.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo eliminar');
  });
});

describe('SongForm', () => {
  it('valida en el cliente antes de enviar', async () => {
    renderApp('/songs/new');
    await userEvent.click(await screen.findByRole('button', { name: 'Crear' }));
    expect(await screen.findByText('El título es requerido')).toBeInTheDocument();
    expect(screen.getByLabelText(/Título/)).toHaveAttribute('aria-invalid', 'true');
    expect(songService.create).not.toHaveBeenCalled();
  });

  it('crea la canción y vuelve al inicio', async () => {
    songService.create.mockResolvedValue(song());
    renderApp('/songs/new');
    await userEvent.type(await screen.findByLabelText(/Título/), 'Bailando');
    await userEvent.type(screen.getByLabelText(/Artista/), 'Enrique');
    await userEvent.type(screen.getByLabelText(/Género/), 'Pop');
    await userEvent.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() =>
      expect(songService.create).toHaveBeenCalledWith({
        title: 'Bailando',
        artist: 'Enrique',
        genre: 'Pop',
        album: '',
      }),
    );
    expect(await screen.findByRole('heading', { name: /Al Ritmo/ })).toBeInTheDocument();
  });

  it('muestra los errores por campo que devuelve el servidor', async () => {
    songService.create.mockRejectedValue({
      message: 'Datos inválidos',
      fields: { artist: 'Artista duplicado' },
    });
    renderApp('/songs/new');
    await userEvent.type(await screen.findByLabelText(/Título/), 'Bailando');
    await userEvent.type(screen.getByLabelText(/Artista/), 'Enrique');
    await userEvent.type(screen.getByLabelText(/Género/), 'Pop');
    await userEvent.click(screen.getByRole('button', { name: 'Crear' }));
    expect(await screen.findByText('Artista duplicado')).toBeInTheDocument();
  });

  it('muestra un error general cuando no hay detalle por campo', async () => {
    songService.create.mockRejectedValue({
      message: 'No se pudo conectar con el servidor',
      fields: {},
    });
    renderApp('/songs/new');
    await userEvent.type(await screen.findByLabelText(/Título/), 'Bailando');
    await userEvent.type(screen.getByLabelText(/Artista/), 'Enrique');
    await userEvent.type(screen.getByLabelText(/Género/), 'Pop');
    await userEvent.click(screen.getByRole('button', { name: 'Crear' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
  });

  it('carga y actualiza una canción existente', async () => {
    songService.getById.mockResolvedValue(song());
    songService.update.mockResolvedValue(song());
    renderApp('/songs/edit/s1');
    const genre = await screen.findByLabelText(/Género/);
    expect(genre).toHaveValue('Pop');
    await userEvent.clear(genre);
    await userEvent.type(genre, 'Latino');
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() =>
      expect(songService.update).toHaveBeenCalledWith(
        's1',
        expect.objectContaining({ genre: 'Latino' }),
      ),
    );
  });

  it('muestra un error si no puede cargar la canción', async () => {
    songService.getById.mockRejectedValue({ message: 'Canción no encontrada' });
    renderApp('/songs/edit/zzz');
    expect(await screen.findByRole('alert')).toHaveTextContent('Canción no encontrada');
  });
});

describe('PlaylistForm', () => {
  it('agrega y quita canciones sin duplicarlas y envía los ids', async () => {
    playlistService.create.mockResolvedValue(playlist());
    renderApp('/playlists/new');
    await userEvent.type(await screen.findByLabelText(/Nombre/), 'Mix');
    await userEvent.selectOptions(screen.getByLabelText('Canciones en la Playlist'), 's1');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    await userEvent.selectOptions(screen.getByLabelText('Canciones en la Playlist'), 's1');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    const selected = screen.getByRole('list', { name: 'Canciones seleccionadas' });
    expect(within(selected).getAllByRole('listitem')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar Waka Waka' }));
    expect(within(selected).queryAllByRole('listitem')).toHaveLength(0);
    await userEvent.selectOptions(screen.getByLabelText('Canciones en la Playlist'), 's1');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() =>
      expect(playlistService.create).toHaveBeenCalledWith({ name: 'Mix', songs: ['s1'] }),
    );
  });

  it('edita una playlist existente y valida el nombre', async () => {
    playlistService.getById.mockResolvedValue(playlist());
    playlistService.update.mockResolvedValue(playlist());
    renderApp('/playlists/edit/p1');
    const name = await screen.findByLabelText(/Nombre/);
    expect(name).toHaveValue('Favoritas');
    await userEvent.clear(name);
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
    await userEvent.type(name, 'Rock');
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() =>
      expect(playlistService.update).toHaveBeenCalledWith('p1', { name: 'Rock', songs: ['s1'] }),
    );
  });

  it('muestra el error del servidor por nombre repetido', async () => {
    playlistService.create.mockRejectedValue({
      message: 'dup',
      fields: { name: 'El nombre de la playlist ya existe' },
    });
    renderApp('/playlists/new');
    await userEvent.type(await screen.findByLabelText(/Nombre/), 'Mix');
    await userEvent.click(screen.getByRole('button', { name: 'Crear' }));
    expect(await screen.findByText('El nombre de la playlist ya existe')).toBeInTheDocument();
  });
});

describe('rutas', () => {
  it('muestra 404', async () => {
    renderApp('/nada');
    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });
});
