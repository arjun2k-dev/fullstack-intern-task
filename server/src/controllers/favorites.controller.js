import { pool } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../utils/validators.js';

/** GET /api/favorites - the logged-in user's favorited templates, newest first. */
export const listFavorites = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT t.id, t.name, t.description, t.thumbnail_url, t.category,
            f.created_at AS favorited_at
     FROM favorites f
     JOIN templates t ON t.id = f.template_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC, t.id DESC`,
    [req.user.id]
  );

  res.json({
    count: rows.length,
    templates: rows.map((row) => ({ ...row, is_favorite: true })),
  });
});

/**
 * POST /api/favorites/:templateId
 * Idempotent: 201 when newly added, 200 if it was already a favorite.
 */
export const addFavorite = asyncHandler(async (req, res) => {
  const templateId = parseId(req.params.templateId, 'Template id');

  const [templates] = await pool.execute('SELECT id FROM templates WHERE id = ?', [templateId]);
  if (templates.length === 0) throw new AppError(404, 'Template not found');

  const [result] = await pool.execute(
    'INSERT IGNORE INTO favorites (user_id, template_id) VALUES (?, ?)',
    [req.user.id, templateId]
  );

  const created = result.affectedRows === 1;
  res.status(created ? 201 : 200).json({
    message: created ? 'Added to favorites' : 'Already in favorites',
    templateId,
    is_favorite: true,
  });
});

/**
 * DELETE /api/favorites/:templateId
 * Idempotent: always 200 so rapid double-clicks in the UI never surface an error.
 */
export const removeFavorite = asyncHandler(async (req, res) => {
  const templateId = parseId(req.params.templateId, 'Template id');

  const [result] = await pool.execute(
    'DELETE FROM favorites WHERE user_id = ? AND template_id = ?',
    [req.user.id, templateId]
  );

  res.json({
    message: result.affectedRows > 0 ? 'Removed from favorites' : 'Template was not in favorites',
    templateId,
    is_favorite: false,
  });
});
