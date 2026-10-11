import { Router } from 'express';
import { testConnection } from '../db/connection.js';
import authRoutes from './auth.routes.js';
import favoritesRoutes from './favorites.routes.js';
import templatesRoutes from './templates.routes.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', database: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'down' });
  }
});

router.use('/auth', authRoutes);
router.use('/templates', templatesRoutes);
router.use('/favorites', favoritesRoutes);

export default router;
