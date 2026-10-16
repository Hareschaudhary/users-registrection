
const dns = require('node:dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(
    `MongoDB connected (database: ${mongoose.connection.name})`
  );
}

module.exports = connectDB;
