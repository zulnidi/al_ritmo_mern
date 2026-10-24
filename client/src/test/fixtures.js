export const song = (extra = {}) => ({
  _id: 's1',
  title: 'Waka Waka',
  artist: 'Shakira',
  genre: 'Pop',
  album: 'Sale el Sol',
  ...extra,
});
export const playlist = (extra = {}) => ({
  _id: 'p1',
  name: 'Favoritas',
  songs: [song()],
  ...extra,
});
