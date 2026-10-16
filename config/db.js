const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log(
    `MongoDB connected: ${mongoose.connection.name}`
  );
}

module.exports = connectDB;