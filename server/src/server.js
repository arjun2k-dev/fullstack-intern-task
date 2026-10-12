import app from './app.js';
import { env } from './config/env.js';
import { connectDB, describeConnection, disconnectDB } from './db/connection.js';

async function start() {
  try {
    await connectDB();
    console.log(`MongoDB connected (${describeConnection()})`);
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    console.error('Check MONGODB_URI in server/.env and make sure MongoDB is running.');
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}/api (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// On Vercel the API runs as a serverless function (server/api/index.js imports app.js),
// so there is no long-running process to start. Locally, `npm start` / `npm run dev` listens on a port.
if (!process.env.VERCEL) {
  start();
}

export default app;