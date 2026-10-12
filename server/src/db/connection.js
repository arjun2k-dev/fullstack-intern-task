import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import { env } from '../config/env.js';

// Reject queries with unknown fields instead of silently ignoring them.
mongoose.set('strictQuery', true);

/** Connects once; later calls reuse the existing connection. */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(env.db.uri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  });
  return mongoose.connection;
}

export async function disconnectDB() {
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
