
require('dotenv').config();

const connectDB = require('./config/db');
const app = require('./app');

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    console.error('Check MONGODB_URI in backend/.env and the Network Access list in Atlas.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

start();
