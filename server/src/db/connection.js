import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import { env } from '../config/env.js';

// Reject queries with unknown fields instead of silently ignoring them.
mongoose.set('strictQuery', true);

let connecting = null;

/** Connects once; concurrent and later calls reuse the same connection (important on serverless). */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connecting) {
    connecting = mongoose
      .connect(env.db.uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 })
      .then(() => mongoose.connection)
      .catch((err) => {
        connecting = null; // allow a retry on the next request
        throw err;
      });
  }
  return connecting;
}

export async function disconnectDB() {
  connecting = null;
  await mongoose.disconnect();
}

/** Throws if the database is unreachable. Used on boot and by /api/health. */
export async function testConnection() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected');
  }
  await mongoose.connection.db.command({ ping: 1 });
}

/** Human-friendly "host/dbname" for logs (never includes credentials). */
export function describeConnection() {
  const { host, name } = mongoose.connection;
  return `${host}/${name}`;
}