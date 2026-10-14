// Vercel serverless entry point: every request is rewritten here (see server/vercel.json)
// and handed to the Express app.
import app from '../src/app.js';
import { connectDB } from '../src/db/connection.js';

export default async function handler(req, res) {
  try {
    await connectDB(); // reuses the connection while this function instance is warm
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    return res.status(503).json({ message: 'Database unavailable' });
  }
  return app(req, res);
}

