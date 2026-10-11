import app from './app.js';
import { env } from './config/env.js';
import { pool, testConnection } from './db/pool.js';

async function start() {
  try {
    await testConnection();
    console.log(`MySQL connected (${env.db.host}:${env.db.port}/${env.db.database})`);
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('Check the DB_* values in server/.env and run "npm run seed" once.');
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}/api (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
