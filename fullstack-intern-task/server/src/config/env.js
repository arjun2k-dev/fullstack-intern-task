import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// server/.env (two levels up from src/config)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set when NODE_ENV=production');
}

const dbName = process.env.DB_NAME || 'template_store';
if (!/^[A-Za-z0-9_$]+$/.test(dbName)) {
  throw new Error('DB_NAME may only contain letters, numbers, underscores and $');
}

export const env = Object.freeze({
  nodeEnv,
  isProd,
  port: Number(process.env.PORT) || 5000,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: dbName,
  },
});
