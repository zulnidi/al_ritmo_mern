const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

// Obtener todas las playlists con sus canciones
router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find()
            .populate('songs')
            .sort({ createdAt: -1 });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener una playlist por id
router.get('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate('songs');
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist no encontrada' });
        }
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear una nueva playlist
router.post('/', async (req, res) => {
    try {
        const playlist = new Playlist(req.body);
        const savedPlaylist = await playlist.save();
        res.status(201).json(savedPlaylist);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }
        if (error.code === 11000) {
            return res.status(400).json({ errors: ['El nombre de la playlist ya existe'] });
        }
        res.status(500).json({ message: error.message });
    }
});

// Actualizar una playlist
router.put('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist no encontrada' });
        }

        Object.assign(playlist, req.body);
        const updatedPlaylist = await playlist.save();
        
        const populatedPlaylist = await Playlist.findById(updatedPlaylist._id)
            .populate('songs');
            
        res.json(populatedPlaylist);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }
        if (error.code === 11000) {
            return res.status(400).json({ errors: ['El nombre de la playlist ya existe'] });
        }
        res.status(500).json({ message: error.message });
    }
});

// Agregar canción a playlist
router.post('/:id/songs', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist no encontrada' });
        }

        const song = await Song.findById(req.body.songId);
        if (!song) {
            return res.status(404).json({ message: 'Canción no encontrada' });
        }

        if (!playlist.songs.includes(song._id)) {
            playlist.songs.push(song._id);
            await playlist.save();
        }

        const populatedPlaylist = await Playlist.findById(playlist._id)
            .populate('songs');
            
        res.json(populatedPlaylist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Eliminar canción de playlist
router.delete('/:id/songs/:songId', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist no encontrada' });
        }

        playlist.songs = playlist.songs.filter(
            songId => songId.toString() !== req.params.songId
        );
        
        await playlist.save();
        
        const populatedPlaylist = await Playlist.findById(playlist._id)
            .populate('songs');
            
        res.json(populatedPlaylist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Eliminar una playlist
router.delete('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist no encontrada' });
        }
        
        await playlist.deleteOne();
        res.json({ message: 'Playlist eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;