
require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/db/db');
const mongoose = require('mongoose');

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 bytes.');
  }

  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; shutting down...`);
    server.close(async (error) => {
      try {
        await mongoose.connection.close();
      } finally {
        process.exit(error ? 1 : 0);
      }
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('Unable to start the server:', error.message);
  mongoose.disconnect().catch(() => {}).finally(() => process.exit(1));
});
