const mongoose = require('mongoose');

/** Conecta a MongoDB. Lanza el error: quien llama decide si termina el proceso. */
async function connectDB(uri) {
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB conectado: ${conn.connection.host}`);
  return conn;
}

module.exports = connectDB;
