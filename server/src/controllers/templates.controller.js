import { pool } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../utils/validators.js';

// Escape LIKE wildcards so user input is matched literally.
const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

const FAVORITE_FLAG_SQL = `EXISTS (
  SELECT 1 FROM favorites f WHERE f.template_id = t.id AND f.user_id = ?
)`;

const toTemplate = (row) => ({ ...row, is_favorite: Boolean(row.is_favorite) });

/**
 * GET /api/templates?search=&category=
 * Public. When a valid token is sent, each template also reports `is_favorite`.
 */
export const listTemplates = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const userId = req.user?.id;

  const params = [];
  let favoriteSelect = '0';
  if (userId) {
    favoriteSelect = FAVORITE_FLAG_SQL;
    params.push(userId);
  }

  let sql = `
    SELECT t.id, t.name, t.description, t.thumbnail_url, t.category,
           ${favoriteSelect} AS is_favorite
    FROM templates t
    WHERE 1 = 1`;

  if (search) {
    sql += ` AND (t.name LIKE ? OR t.description LIKE ?)`;
    const like = `%${escapeLike(search)}%`;
    params.push(like, like);
  }
  if (category && category.toLowerCase() !== 'all') {
    sql += ` AND t.category = ?`;
    params.push(category);
  }
  sql += ` ORDER BY t.id ASC`;

  const [rows] = await pool.execute(sql, params);
  res.json({ count: rows.length, templates: rows.map(toTemplate) });
});

/** GET /api/templates/categories */
export const listCategories = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT DISTINCT category FROM templates ORDER BY category ASC');
  res.json({ categories: rows.map((r) => r.category) });
});

/** GET /api/templates/:id */
export const getTemplate = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'Template id');
  const userId = req.user?.id;

  const params = [];
  let favoriteSelect = '0';
  if (userId) {
    favoriteSelect = FAVORITE_FLAG_SQL;
    params.push(userId);
  }
  params.push(id);

  const [rows] = await pool.execute(
    `SELECT t.id, t.name, t.description, t.thumbnail_url, t.category,
            ${favoriteSelect} AS is_favorite
     FROM templates t
     WHERE t.id = ?`,
    params
  );

  if (rows.length === 0) throw new AppError(404, 'Template not found');
  res.json({ template: toTemplate(rows[0]) });
});
