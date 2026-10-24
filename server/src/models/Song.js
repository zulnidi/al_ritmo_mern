const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    minlength: [2, 'El título debe tener al menos 2 caracteres'],
    maxlength: [100, 'El título no puede exceder 100 caracteres'],
  },
  artist: {
    type: String,
    required: [true, 'El artista es requerido'],
    trim: true,
    minlength: [2, 'El artista debe tener al menos 2 caracteres'],
    maxlength: [100, 'El artista no puede exceder 100 caracteres'],
  },
  genre: {
    type: String,
    required: [true, 'El género es requerido'],
    trim: true,
    minlength: [2, 'El género debe tener al menos 2 caracteres'],
    maxlength: [50, 'El género no puede exceder 50 caracteres'],
    index: true,
  },
  album: {
    type: String,
    trim: true,
    maxlength: [100, 'El álbum no puede exceder 100 caracteres'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Song || mongoose.model('Song', songSchema);
