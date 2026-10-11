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

const mongoUri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/template_store').trim();
if (!/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
  throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
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
    uri: mongoUri,
  },
});
