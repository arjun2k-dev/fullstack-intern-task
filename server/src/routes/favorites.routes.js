import { Router } from 'express';
import {
  addFavorite,
  listFavorites,
  removeFavorite,
} from '../controllers/favorites.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Every favorites endpoint requires a logged-in user
router.use(requireAuth);

router.get('/', listFavorites);
router.post('/:templateId', addFavorite);
router.delete('/:templateId', removeFavorite);

export default router;
