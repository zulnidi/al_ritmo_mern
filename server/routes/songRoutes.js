const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// Obtener todas las canciones
router.get('/', async (req, res) => {
    try {
        const songs = await Song.find().sort({ createdAt: -1 });
        res.json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener una canción por id
router.get('/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: 'Canción no encontrada' });
        }
        res.json(song);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear una nueva canción
router.post('/', async (req, res) => {
    try {
        const song = new Song(req.body);
        const savedSong = await song.save();
        res.status(201).json(savedSong);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }
        res.status(500).json({ message: error.message });
    }
});

// Actualizar una canción
router.put('/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: 'Canción no encontrada' });
        }

        Object.assign(song, req.body);
        const updatedSong = await song.save();
        res.json(updatedSong);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: messages });
        }
        res.status(500).json({ message: error.message });
    }
});

// Eliminar una canción
router.delete('/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: 'Canción no encontrada' });
        }
        
        await song.deleteOne();
        res.json({ message: 'Canción eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;