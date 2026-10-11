import app from '../src/app.js';
import { connectDB } from '../src/db/connection.js';

export default async function handler(req, res) {
  await connectDB();      // reuses the connection while the function is warm
  return app(req, res);
}