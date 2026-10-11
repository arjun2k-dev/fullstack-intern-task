import { Router } from 'express';
import {
  getTemplate,
  listCategories,
  listTemplates,
} from '../controllers/templates.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listTemplates);
// Must be declared before '/:id' or "categories" would be parsed as an id
router.get('/categories', listCategories);
router.get('/:id', optionalAuth, getTemplate);

export default router;
